import PropTypes from 'prop-types';
import * as Yup from 'yup';
import React, { useEffect, useRef, useState, useMemo } from 'react';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../../pages/style/style.css';
import { Box, Card, Grid, Stack, Divider, TextField, TableContainer, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';

// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import axios from '../../../../utils/axios';
import SalesReceiptOrderRefundToolbar from './SalesReceiptOrderRefundToolbar';
import Iconify from '../../../../components/iconify';
import { dispatch, useSelector } from '../../../../redux/store';
import { getGoods } from '../../../../redux/slices/good';
import SaleReceiptOrderRefundDetail from './SaleReceiptOrderRefundDetail';
import { useAuthContext } from '../../../../auth/useAuthContext';
import SaleReceiptOrderRefundDialog from './SaleReceiptOrderRefundDialog';
import { STATUSES } from '../../../../utils/constant';

// ----------------------------------------------------------------------

SalesReceiptOrderRefundForm.propTypes = {
  isEdit: PropTypes.bool,
  currentOrder: PropTypes.object,
};

export default function SalesReceiptOrderRefundForm({ isEdit = false, onClose, currentOrder, refetchData = null }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const refSubmitButton = useRef();

  const goods = useSelector((state) => state.good.goods);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [triggerClickAdd, setTriggerClickAdd] = useState(0);

  const [isSuccess, setIsSuccess] = useState(false);

  const [defaultCode, setDefaultCode] = useState(`TH${moment().format('YYMM')}-0000`);

  const [openTo, setOpenTo] = useState(false);

  const [orderItems, setOrderItems] = useState([]);

  const [dateRefund, setDateRefund] = useState(moment().format('YYYY-MM-DD'));

  const defaultValues = useMemo(
    () => ({
      date: moment().format('YYYY-MM-DD'),
      warehouse: currentOrder?.warehouse?.name || '',
      quantity: currentOrder?.total_quatity || 0,
      party_code: currentOrder?.party?.code || '',
      party_name: currentOrder?.party?.name || '',
      employee: currentOrder?.employee?.name || user.name,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrder]
  );

  const NewOrderRefundSchema = Yup.object().shape({
    date: Yup.date().nullable().required('Vui lòng chọn ngày trả'),
  });

  const methods = useForm({
    resolver: yupResolver(NewOrderRefundSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentOrder) {
      setValue('items', currentOrder?.order_items);
      setValue('order', currentOrder?.codeSaleReceipt || '');
      setDefaultCode(currentOrder?.code);
      addQuantity(currentOrder?.order_items);
      setIsSuccess(currentOrder?.order_status_id === STATUSES.refund_sale_receipt);
    }
    if (!isEdit) {
      reset(defaultValues);
      setOrderItems(currentOrder?.order_items || []);
      setValue('order', currentOrder?.code || '');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentOrder]);

  useEffect(() => {
    if (!goods.length) dispatch(getGoods({}));
  }, [goods]);

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);

    if (formData?.items && formData?.items.length > 0) {
      try {
        const orderItems = formData.items.map((item) => {
          return {
            id: item.id,
            good_id: item.good_id,
            quantity: Number(item.quantity),
            quantityRefund: Number(item.quantityRefund),
            discount: item.discount || 0,
            price: item.price || 0,
          };
        });

        const newFormData = {
          order_id: currentOrder?.id || null,
          warehouse: currentOrder?.warehouse?.id || null,
          party_id: currentOrder?.party?.id || null,
          date: moment(formData?.date).format('YYYY-MM-DD') || '',
          employee: user.id || null,
          order_items: orderItems || [],
          comment: formData?.comment || '',
          date_debt: currentOrder?.date_debt || 0,
          vat_rate: currentOrder?.vat_rate || 0,
        };

        if (!isEdit) {
          await axios.post('order-refund', newFormData);
          enqueueSnackbar('Thêm phiếu trả hàng thành công!');
        } else {
          try {
            newFormData.reference_id = currentOrder.reference_id;
            await axios.post('update-order-refund', newFormData).then((response) => {
              enqueueSnackbar('Duyệt đơn trả hàng thành công!');
              refetchData();
            });
          } catch (err) {
            enqueueSnackbar(err.message, { variant: 'error' });
            setLoadingBtnSave(false);
          }
        }

        onClose();
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Vui lòng chọn chi tiết mặt hàng cần trả', { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  const addQuantity = (dataItems = null) => {
    if (dataItems)
      setValue(
        'quantity_refund',
        dataItems.reduce((total, item) => total + Number(item.quantityRefund), 0)
      );
    else
      setValue(
        'quantity_refund',
        values?.items.reduce((total, item) => total + Number(item.quantityRefund), 0)
      );
  };

  const handleOpenTo = () => {
    setOpenTo(true);
  };

  const handleCloseTo = () => {
    setOpenTo(false);
  };

  const handleSetOrderItemRefund = (orderItem) => {
    const newOrderItem = {
      id: orderItem.id,
      good_id: orderItem?.good?.id,
      good_code: orderItem?.good?.code,
      good_name: orderItem?.good?.name,
      good_unit: orderItem?.good?.unit_of_measure?.name,
      quantity: orderItem?.quantity,
      quantityRefund: 1,
      discount: orderItem?.good?.discount_rate || 0,
      price: orderItem?.good?.price || 0,
    };
    const dataItems = values.items ? [...values.items, newOrderItem] : [newOrderItem];
    setValue('items', dataItems);
    removeOrderItemChosen(orderItem);
    handleCloseTo();
    addQuantity(dataItems);
  };

  const removeOrderItemChosen = (orderItem) => {
    setOrderItems(() => {
      return orderItems.filter((item) => item.id !== orderItem.id);
    });
  };

  const refundItemRemoved = (id) => {
    const itemRefund = currentOrder?.order_items.filter((item) => item.id === id)[0];
    const newOrderItems = [...orderItems, itemRefund];
    setOrderItems(newOrderItems);
  };

  return (
    <>
      <SalesReceiptOrderRefundToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Duyệt đơn trả hàng' : 'Tạo đơn trả hàng'}
        isSuccess={isSuccess}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3, boxShadow: 'none' }}>
              <Box
                rowGap={3}
                sx={{ pb: 3 }}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField
                  size="small"
                  name="code"
                  value={defaultCode}
                  label="Số chứng từ"
                  InputProps={{
                    readOnly: true,
                    disabled: true,
                  }}
                />
                <DatePicker
                  label="Ngày trả hàng"
                  name="date"
                  disabled={isEdit}
                  value={dateRefund}
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('date', newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                    setDateRefund(newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                    clearErrors(['date']);
                  }}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.date)}
                      helperText={errors.date?.message}
                      {...params}
                      size="small"
                      fullWidth
                    />
                  )}
                />
                <RHFTextField size="small" name="party_code" label="Mã khách hàng" disabled />
                <RHFTextField size="small" name="party_name" label="Tên khách hàng" disabled />
                <RHFTextField size="small" name="order" label="Đơn hàng*" disabled />
                <RHFTextField size="small" name="employee" label="Người tạo đơn*" disabled />
                <RHFTextField size="small" name="warehouse" label="Kho Nhận*" disabled />
                <RHFTextField size="small" name="quantity_refund" label="Số lượng trả lại" disabled />
              </Box>
              <RHFTextField size="small" disabled={isEdit} name="comment" label="Ghi chú" />
              <Divider sx={{ pt: 3, borderStyle: 'dashed' }} />
              <Box sx={{ pt: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                  }}
                >
                  <div>
                    <Typography variant="h6">Chi tiết</Typography>
                  </div>
                  <div>
                    {!isEdit && (
                      <Button
                        sx={{ mr: 1 }}
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={handleOpenTo}
                      >
                        Chọn mặt hàng trả
                      </Button>
                    )}
                  </div>
                </Stack>

                <SaleReceiptOrderRefundDialog
                  open={openTo}
                  onClose={handleCloseTo}
                  selectOrderItem={(orderItem) => handleSetOrderItemRefund(orderItem)}
                  orderItems={orderItems || []}
                />

                <SaleReceiptOrderRefundDetail
                  triggerClickAdd={triggerClickAdd}
                  goods={goods}
                  addQuantity={addQuantity}
                  currentOrder={currentOrder}
                  refundItemRemoved={(id) => refundItemRemoved(id)}
                  isEdit={isEdit}
                />
              </Box>
              <button hidden={1} ref={refSubmitButton} type={'submit'} />
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
