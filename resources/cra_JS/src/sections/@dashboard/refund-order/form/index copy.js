import PropTypes from 'prop-types';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form

import moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { DatePicker } from '@mui/x-date-pickers';
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
  CircularProgress
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
import { useAuthContext } from '../../../../auth/useAuthContext';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../../components/hook-form';
//
import InvoiceNewEditDetails from './InvoiceNewEditDetails';
import RefundDetailsToolbar from './refund-details-toolbar';
import { FUNCTIONS, FOLDER_IMAGE } from '../../../../utils/constant';
import { useDispatch, useSelector } from '../../../../redux/store';
import { getParties } from '../../../../redux/slices/parties';
import { getEmployees } from '../../../../redux/slices/employee';
import { getOrderByParty } from '../../../../redux/slices/saleReceipt';

// ----------------------------------------------------------------------
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

RefundCreateForm.propTypes = {
  isEdit: PropTypes.bool,

};

export default function RefundCreateForm({
  isEdit,
  orderRefunds,
  orderSaleReceipts,
  setUpdatePayment }) {
  const { user } = useAuthContext();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const refSubmitButton = useRef();

  const refDetailGood = useRef();

  const upMd = useResponsive('up', 'md');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [statusPayment, setStatusPayment] = useState(false);

  const [loadingSend, setLoadingSend] = useState(false);

  const dataParties = useSelector((state) => state.parties);

  const dataEmployee = useSelector((state) => state.employee);

  const dataOrder = useSelector((state) => state.saleReceipt.dataOrders);

  const [orderList, setOrderList] = useState([]);

  const [groupOrder, setGroupOrder] = useState([]);

  const NewUserSchema = Yup.object().shape({
    party_id: Yup.object().required('Chọn khách hàng').nullable(),
    order_id: Yup.array().min(1, 'Chọn đơn hàng thanh toán').nullable(true),
    user_id: Yup.object().required('Chọn người lập phiếu').nullable(),
    date: Yup.date().nullable().required('Vui lòng chọn ngày chứng từ'),
  });

  const defaultValues = useMemo(
    () => ({
      date: orderRefunds?.date || moment().format('YYYY-MM-DD HH:mm'),
      refundGoods: [],
      code: orderRefunds?.code || `TH${moment().format('YYMM')}-0000`,
      order_id: orderSaleReceipts || [],
      party_id: orderRefunds?.party || null,
      name_party: orderRefunds?.party?.name || '',
      user_id: isEdit ? orderRefunds?.employee : user,
      comment: orderRefunds?.comment || '',
      status_payment: '',
    }),
    [orderRefunds]
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

    if (isEdit && orderRefunds) {
      reset(defaultValues);
      setTimeout(() => {
        setGroup(orderSaleReceipts);
      }, 100)
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, orderRefunds]);

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  const processRefund = (data) => {
    const orders = data.order_id.sort((item1, item2) => {
      const date1 = new Date(item1.date);
      const date2 = new Date(item2.date);
      return item1.id - item2.id;
    });

    const arrGroupOrder = [];
    const orderRefundSelected = data.refundGoods.map((item) => ({ ...item }));

    orders.forEach((element) => {
      element.order_items.forEach((elementItem) => {
        const findGroup = orderRefundSelected.find((item) => item.good_id === elementItem.good_id);

        if (findGroup) {
          const quantityRefund = findGroup.quantityRefund ? Number(findGroup.quantityRefund) : 0;
          let quantity = elementItem.quantity;
          if (quantity > quantityRefund) {
            quantity = quantityRefund;
          } else if (quantityRefund === 0) quantity = 0

          if (quantity > 0) {
            arrGroupOrder.push({
              order_item_id: elementItem.id,
              good_id: elementItem.good_id,
              quantity,
              price: elementItem.price,
            });
          }

          findGroup.quantityRefund -= quantity;
        }
      });
    });

    return arrGroupOrder;
  };

  const onSubmit = async (data) => {
    const arrGroupOrder = processRefund(data);
    if (arrGroupOrder.length > 0) {
      try {
        const newFormData = {
          date: moment(data.date).format('YYYY-MM-DD HH:mm:ss'),
          party_id: data.party_id.id,
          order_items: arrGroupOrder,
          receiver: data.user_id.id,
          comment: data.comment,
          status: data.status_payment,
        };

        setLoadingSend(true);
        if (isEdit) {
          await axios.post(`update-order-refund/${orderRefunds.id}`);
          setOpenConfirm(false);
          setUpdatePayment(1);
        } else {
          await axios.post('create-refund-order', newFormData);
          reset();
        }
        enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setLoadingSend(false);
      } catch (error) {
        setLoadingSend(false);
        if (error.code === 422) {
          const responseErrors = Object.entries(error.data);
          responseErrors.forEach((item) => {
            setTimeout(() => {
              enqueueSnackbar(item[1], { variant: 'error' });
            }, 500);
          });
        } else enqueueSnackbar(error?.data?.message, { variant: 'error' });
      }
    } else enqueueSnackbar('Vui lòng nhập số lượng trả!', { variant: 'error' });
  };

  useEffect(() => {
    if (!dataOrder.isLoading) {
      setOrderList(dataOrder.orders);
    }
  }, [dataOrder]);

  const filterOrder = (newValue) => {
    setOrderList([]);
    dispatch(getOrderByParty({ party_id: newValue.id }));
  };

  const handleOpenConfirm = (status) => {
    setOpenConfirm(true);
    setValue('status_payment', status);
    setStatusPayment(status === 'approved');
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const setGroup = (orders) => {
    const arrGroupOrder = [];
    orders.forEach((element) => {
      element.order_items.forEach((elementItem) => {
        const findGroup = arrGroupOrder.find((item) => item.good_id === elementItem.good_id);
        let quantityRefundTotal = '';
        if (isEdit) {
          const filterOrderItemGood = orderRefunds.order_items.filter((orderitem) => orderitem.good_id === elementItem.good_id);
          quantityRefundTotal = filterOrderItemGood.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
        }
        if (findGroup) {
          findGroup.quantity += elementItem.quantity;
        } else if (elementItem.quantity > 0) {
          arrGroupOrder.push({
            good: elementItem.good,
            good_id: elementItem.good_id,
            quantity: elementItem.quantity,
            price: elementItem.price,
            quantityRefund: isEdit ? quantityRefundTotal : ''
          });
        }
      });
    });

    setGroupOrder(arrGroupOrder);
    setValue('refundGoods', arrGroupOrder);

  };
  return (
    <Container maxWidth={'lg'}>
      <RefundDetailsToolbar
        backLink={PATH_DASHBOARD.order.importWarehouse}
        orderRefunds={orderRefunds}
        isEdit={isEdit}
        code={`TH${moment().format('YYMM')}-0000`}
        handleApproved={() => handleOpenConfirm('approved')}
        handledecline={() => handleOpenConfirm('decline')}
        handleSave={onSave}
        loadingSend={loadingSend}
      />

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
                  disabled={isEdit}
                  options={dataParties.parties.map((option) => option)}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(option =>
                      option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      ||
                      option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('party_id', newValue);
                    setValue('name_party', newValue?.name || '');
                    setValue('order_id', []);
                    clearErrors(['party_id']);
                    filterOrder(newValue);
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {`${option.code} - ${option.name}`}
                      </li>
                    );
                  }}
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
                  disabled={isEdit}
                  size="small"
                  sx={{ width: '100%' }}
                  options={orderList.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('order_id', newValue);
                    clearErrors(['order_id']);
                    setGroup(newValue);
                  }}
                  renderOption={(props, option, { selected }) => {
                    return (
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
                    );
                  }}
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
                <RHFTextField disabled={isEdit} size="small" name="comment" label="Lý do" />
              </Stack>

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
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
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
                    <DatePicker
                      disabled={isEdit}
                      label="Ngày chứng từ"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField

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


              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 3, bgcolor: 'background.neutral' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Chi tiết sản phẩm
            </Typography>
          </Stack>
          <InvoiceNewEditDetails
            ref={refDetailGood}
            row={groupOrder}
            orderRefunds={orderRefunds}
            isEdit={isEdit}
          />
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
