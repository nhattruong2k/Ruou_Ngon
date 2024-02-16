import PropTypes from 'prop-types';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form

import moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
// @mui
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Divider,
  Typography,
  TextField,
  Checkbox,
  Container,
  Button,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
import axios from '../../../../utils/axios';
import { useSnackbar } from '../../../../components/snackbar';
import ConfirmDialog from '../../../../components/confirm-dialog';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// mock
import { _invoiceAddressFrom } from '../../../../_mock/arrays';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
// components
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../../components/hook-form';
//
import InvoiceNewEditDetails from './InvoiceNewEditDetails';
import InvoiceOldDebt from './InvoiceOldDebt';
import PaymentDetailsToolbar from './payment-details-toolbar';
import { FUNCTIONS, FOLDER_IMAGE, PAYMENT_TYPE } from '../../../../utils/constant';
import { useDispatch, useSelector } from '../../../../redux/store';
import { getParties } from '../../../../redux/slices/parties';
import { getEmployees } from '../../../../redux/slices/employee';
import { getOrderByParty } from '../../../../redux/slices/paymentOrder';
import { useAuthContext } from '../../../../auth/useAuthContext';

// ----------------------------------------------------------------------
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

PaymentCreateForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPayment: PropTypes.object,
  currentOrders: PropTypes.array,
};

export default function PaymentCreateForm({ isEdit, currentOrders, currentPayment, setUpdatePayment }) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const dispatch = useDispatch();

  const refSubmitButton = useRef();

  const upMd = useResponsive('up', 'md');

  const [disabledInput, setDisabledInput] = useState({
    party_id: isEdit,
    all_total_payment: isEdit,
    order_id: isEdit,
    user_id: isEdit,
    date: isEdit,
    file: isEdit,
    comment: isEdit,
  });

  const [openConfirm, setOpenConfirm] = useState(false);

  const [statusPayment, setStatusPayment] = useState(false);

  const [loadingSend, setLoadingSend] = useState(false);

  const dataParties = useSelector((state) => state.parties);

  const dataEmployee = useSelector((state) => state.employee);

  const dataOrder = useSelector((state) => state.paymentOrder.dataOrders);

  const [orderList, setOrderList] = useState([]);

  const [totalOrder, setTotalOrder] = useState(0);

  const [remainingAmounts, setRemainingAmounts] = useState([]);

  const [timer, setTimer] = useState(null);

  const [loadingAttachment, setLoadingAttachment] = useState(false);

  const [currentParty, setCurrentParty] = useState(null);

  const [selectOrder, setSelectOrder] = useState(false);

  const NewUserSchema = Yup.object().shape({
    party_id: Yup.object().required('Chọn khách hàng').nullable(),
    order_id: Yup.array().min(1, 'Chọn đơn hàng thanh toán').nullable(true),
    all_total_payment: Yup.string().required('Nhập số tiền thanh toán'),
    user_id: Yup.object().required('Chọn người lập phiếu').nullable(),
    date: Yup.date().nullable().required('Vui lòng chọn ngày chứng từ'),
  });

  const defaultValues = useMemo(
    () => ({
      date: currentPayment?.date || moment().format('YYYY-MM-DD HH:mm'),
      items: [],
      code: currentPayment?.code || `${FUNCTIONS.payment_order.code}${moment().format('YYMM')}-0000`,
      order_id: currentOrders || [],
      party_id: currentPayment?.party || null,
      name_party: currentPayment?.party?.name || '',
      user_id: currentPayment?.user || user,
      all_total_payment: currentPayment?.total_amount || '',
      file: currentPayment?.attachment || '',
      comment: currentPayment?.comment || '',
      status_payment: '',
    }),
    [currentPayment]
  );
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  const valueForm = watch();

  useEffect(() => {
    dispatch(getParties({}));
    dispatch(getEmployees({}));
  }, [dispatch]);

  useEffect(() => {
    setDisabledInput({
      party_id: isEdit,
      all_total_payment: isEdit,
      order_id: isEdit,
      user_id: isEdit,
      date: isEdit,
      file: isEdit,
      comment: isEdit,
    });
    if (isEdit && currentPayment) {
      getTotalOrder(currentOrders);
      reset(defaultValues);
    }
    if (!isEdit) {
      setTotalOrder(0);
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPayment]);

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  useEffect(() => {
    if (valueForm?.order_id && selectOrder) {
      const orderFilters = _.sortBy(valueForm?.order_id, 'indexItem');
      setValue('order_id', orderFilters);
      setSelectOrder(false);
    }
  }, [selectOrder]);

  const handleCreateAndSend = async (data) => {
    const newFormData = {
      date: moment(data.date).format('YYYY-MM-DD HH:mm:ss'),
      total_amount: formatPriceNumber(data?.all_total_payment),
      party_id: data.party_id.id,
      orders: data.order_id.map((item) => {
        const orderPayment = data.items.find((itemPayment) => itemPayment.order_id === item.id);
        const type = item?.isOldDebt ? PAYMENT_TYPE.debt : PAYMENT_TYPE.order;
        return {
          id: item.id,
          total: orderPayment.total_order_remaining,
          amount: orderPayment.total_payment,
          type,
        };
      }),
      receiver: data.user_id.id,
      comment: data.comment,
      attachment_file: data.attachment_file,
      status_payment: data.status_payment,
    };

    setLoadingSend(true);
    let response = '';
    if (isEdit) {
      response = await axios.put(`payment-multiple-orders/${currentPayment.id}`, newFormData);
      setUpdatePayment(1);
    } else {
      response = await axios.post('payment-multiple-orders', newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });
      reset();
      setTotalOrder(0);
      navigate(PATH_DASHBOARD.paymentMultipleOrder.edit(response?.data?.data?.data?.id));
    }

    setOpenConfirm(false);
    enqueueSnackbar(isEdit ? 'Cập nhật thanh toán thành công!' : 'Tạo thanh toán thành công');
    try {
      setLoadingSend(false);
    } catch (error) {
      console.error(error);
      setLoadingSend(false);
    }
  };

  useEffect(() => {
    if (!dataOrder.isLoading) {
      const newDataOrders =
        dataOrder?.orders &&
        dataOrder?.orders.map((order, index) => ({ ...order, isOldDebt: false, indexItem: index + 1 }));
      if (currentParty?.old_debt && currentParty?.old_debt > 0) {
        const oldDebt = {
          id: currentParty.id,
          code: 'Công nợ cũ',
          total_price: currentParty?.old_debt,
          isOldDebt: true,
          indexItem: 0,
        };

        setOrderList([oldDebt, ...newDataOrders]);
      } else {
        setOrderList(newDataOrders);
      }
    }
  }, [dataOrder]);

  const filterOrder = (newValue) => {
    setOrderList([]);
    setTotalOrder(0);
    dispatch(getOrderByParty({ party_id: newValue.id }));
  };

  const getTotalOrder = (newValue) => {
    const totalPaymentOrder = newValue.reduce((accumulator, item) => {
      let totalPaidOrder;
      let totalPaidDebt;
      // kiểm tra thanh toán đã được duyệt thì số tiền còn lại không cần trừ đi
      if (item.isOldDebt && currentPayment?.payment_status_id !== 2) {
        totalPaidDebt = item?.payment_old_debts?.reduce(
          (accumulatorPaid, itemPaid) => accumulatorPaid + Number(itemPaid.amount),
          0
        );
      } else if (!item.isOldDebt) {
        totalPaidOrder = item?.payment_items?.reduce(
          (accumulatorPaid, itemPaid) => accumulatorPaid + Number(itemPaid.amount),
          0
        );
      }

      return accumulator + Number(item.total_price) - (totalPaidOrder || 0 + totalPaidDebt || 0);
    }, 0);

    setTotalOrder(totalPaymentOrder);
  };

  const handleRemainingAmountChange = (index, newRemainingAmount) => {
    if (newRemainingAmount > totalOrder) {
      newRemainingAmount = totalOrder;
      setValue('all_total_payment', newRemainingAmount);
    }
    setRemainingAmounts((prevAmounts) => {
      const newAmounts = [...prevAmounts];
      newAmounts[index] = newRemainingAmount;
      return newAmounts;
    });
  };

  const handleOpenConfirm = (status) => {
    setOpenConfirm(true);
    setValue('status_payment', status);
    setStatusPayment(status === 'approved');
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDrop = useCallback(
    (event) => {
      const file = event.target.files[0];

      if (file) {
        const newFile = new File([file], file.name, { type: file.type });
        newFile.preview = URL.createObjectURL(file);

        setValue(`attachment_file`, newFile);
        setValue(`file`, newFile.name);
      }
    },
    [setValue]
  );

  const downloadFile = (fileUrl) => {
    setLoadingAttachment(true);

    axios
      .get(`download-file/${fileUrl}/${FOLDER_IMAGE.payment_attachment}`, {
        method: 'GET',
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${currentPayment?.code}_${fileUrl}`);
        document.body.appendChild(link);
        link.click();
        setLoadingAttachment(false);
      })
      .catch((error) => {
        setLoadingAttachment(false);
        enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
      });
  };

  return (
    <Container maxWidth={'lg'}>
      <PaymentDetailsToolbar
        backLink={PATH_DASHBOARD.paymentMultipleOrder.list}
        currentPayment={currentPayment}
        isEdit={isEdit}
        code={`${FUNCTIONS.payment_order.code}${moment().format('YYMM')}-0000`}
        handleApproved={() => handleOpenConfirm('approved')}
        handledecline={() => handleOpenConfirm('decline')}
        handleSave={onSave}
        loadingSend={loadingSend}
      />

      <FormProvider methods={methods} onSubmit={handleSubmit(handleCreateAndSend)}>
        <Card>
          <Stack
            spacing={{ xs: 2, md: 5 }}
            direction={{ xs: 'column', md: 'row' }}
            divider={<Divider flexItem orientation={upMd ? 'vertical' : 'horizontal'} sx={{ borderStyle: 'dashed' }} />}
            sx={{ p: 3 }}
          >
            <Stack sx={{ width: 1 }}>
              <Stack spacing={3} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <RHFAutocomplete
                  name="party_id"
                  autoHighlight
                  loading={dataParties.isLoading}
                  size="small"
                  sx={{ width: '100%' }}
                  disabled={disabledInput.party_id}
                  options={dataParties.parties.map((option) => option)}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(
                      (option) =>
                        option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                        option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    )
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('party_id', newValue);
                    setValue('name_party', newValue?.name || '');
                    setValue('order_id', []);
                    clearErrors(['party_id']);
                    filterOrder(newValue);
                    setCurrentParty(newValue);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {`${option.code} - ${option.name}`}
                    </li>
                  )}
                  getOptionLabel={(option) => option.code || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.party_id)}
                      helperText={errors.party_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn khách hàng*"
                    />
                  )}
                />
                <RHFTextField size="small" name="name_party" label="Tên khách hàng" disabled />
                <RHFAutocomplete
                  name="order_id"
                  loading={dataOrder.isLoading}
                  multiple
                  autoHighlight
                  disableCloseOnSelect
                  disabled={disabledInput.order_id}
                  size="small"
                  sx={{ width: '100%' }}
                  options={orderList.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('order_id', newValue);
                    clearErrors(['order_id']);
                    getTotalOrder(newValue);
                    setSelectOrder(true);
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id} style={{ textTransform: 'capitalize' }}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.code}
                    </li>
                  )}
                  noOptionsText={
                    <Typography variant="subtitle2" gutterBottom>
                      Không có đơn hàng
                    </Typography>
                  }
                  getOptionLabel={(option) => option.code || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.order_id)}
                      helperText={errors.order_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Đơn hàng*"
                    />
                  )}
                />
              </Stack>
              <RHFTextField
                sx={{ mt: 2 }}
                size="small"
                name="total_remaining"
                value={currencyFormatter(totalOrder)}
                label="Tổng tiền còn lại"
                disabled
                className="component-text-field-disabled"
              />
              <RHFTextField
                onChange={(event, newValue) => {
                  setValue('all_total_payment', event.target.value);
                  clearTimeout(timer);
                  const newTimer = setTimeout(() => {
                    handleRemainingAmountChange(0, formatPriceNumber(event.target.value));
                  }, 500);
                  setTimer(newTimer);
                }}
                sx={{ mt: 3 }}
                size="small"
                name="all_total_payment"
                label="Số tiền thanh toán"
                typeinput="price"
                disabled={disabledInput.all_total_payment}
              />
            </Stack>

            <Stack sx={{ width: 1 }}>
              <Stack spacing={3} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <RHFAutocomplete
                  disabled
                  name="user_id"
                  autoHighlight
                  loading={dataEmployee.isLoading}
                  size="small"
                  sx={{ width: '100%' }}
                  options={dataEmployee.employees.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('user_id', newValue);
                    clearErrors(['user_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.user_id)}
                      helperText={errors.user_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Người lập phiếu*"
                    />
                  )}
                />
                <RHFTextField
                  size="small"
                  name="code"
                  label="Số chứng từ*"
                  disabled
                  className="component-text-field-disabled"
                />
                <Controller
                  name="date"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      label="Ngày chứng từ"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          disabled={disabledInput.date}
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          size="small"
                        />
                      )}
                    />
                  )}
                />
                {currentPayment?.attachment ? (
                  <Box sx={{ width: '100%' }}>
                    <RHFTextField
                      disabled={disabledInput.file}
                      sx={{ width: '92%' }}
                      size="small"
                      name="file"
                      label="File đính kèm"
                      InputLabelProps={{ shrink: true }}
                    />
                    <Tooltip title="Download">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          downloadFile(currentPayment?.attachment);
                        }}
                      >
                        {loadingAttachment ? (
                          <CircularProgress style={{ color: 'red' }} size={20} />
                        ) : (
                          <Iconify icon="eva:download-outline" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <RHFTextField
                    disabled={disabledInput.file}
                    onChange={(e) => handleDrop(e)}
                    value={null}
                    type="file"
                    size="small"
                    name="file"
                    label="File đính kèm"
                    InputLabelProps={{ shrink: true }}
                  />
                )}

                <RHFTextField disabled={disabledInput.comment} size="small" name="comment" label="Lý do" />
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 3, bgcolor: 'background.neutral' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Chi tiết thanh toán
            </Typography>
          </Stack>
          {(valueForm?.order_id || []).map((row, index) =>
            row?.isOldDebt ? (
              <InvoiceOldDebt
                key={index}
                keyItem={index}
                row={row}
                remainingAmount={remainingAmounts[index]}
                setRemainingAmount={(newRemainingAmount) => handleRemainingAmountChange(index + 1, newRemainingAmount)}
                currentPayment={currentPayment}
                isEdit={isEdit}
              />
            ) : (
              <InvoiceNewEditDetails
                key={index}
                keyItem={index}
                row={row}
                remainingAmount={remainingAmounts[index]}
                setRemainingAmount={(newRemainingAmount) => handleRemainingAmountChange(index + 1, newRemainingAmount)}
                currentPayment={currentPayment}
                isEdit={isEdit}
              />
            )
          )}
        </Card>

        <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
          <button hidden={1} ref={refSubmitButton} type={'submit'} />
        </Stack>
      </FormProvider>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title={statusPayment ? 'Duyệt' : 'Từ chối'}
        content={
          statusPayment
            ? 'Bạn có chắc chắn muốn duyệt thanh toán này?'
            : 'Bạn có chắc chắn muốn từ chối thanh toán này?'
        }
        action={
          <LoadingButton
            loading={loadingSend}
            variant="contained"
            color={(statusPayment && 'success') || 'error'}
            onClick={onSave}
          >
            {(statusPayment && 'Duyệt') || 'Từ chối'}
          </LoadingButton>
        }
      />
    </Container>
  );
}
