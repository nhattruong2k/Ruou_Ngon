import React, { useCallback, useEffect, useState } from 'react';
// form
import { useFieldArray, useFormContext } from 'react-hook-form';

// @mui
import { Box, Divider, Stack, TextField, IconButton } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// utils
import moment from 'moment';
import { useAuthContext } from '../../../../auth/useAuthContext';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
import { useSnackbar } from '../../../../components/snackbar';
import { RHFTextField } from '../../../../components/hook-form';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
import { STATUSES } from '../../../../utils/constant';

export default function SalesReceiptPaymentDetail({
  triggerClickAdd,
  infoPaymentEdit,
  setStatus,
  currentSaleReceipt,
  isLoading,
}) {
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const { control, register, setValue, watch, resetField, getValues } = useFormContext();

  const [totalOrder, setTotalOrder] = useState(0);

  const [totalDiscountOrder, setTotalDiscountOrder] = useState(0);

  const [taxPrice, setTaxPrice] = useState(0);

  const [totalPayment, setTotalPayment] = useState(0);

  const [totalPrice, setTotalPrice] = useState(0);

  const [totalPaid, setTotalPaid] = useState(0);

  const [totalRemain, setTotalRemain] = useState(0);

  const [remainPrice, setRemainPrice] = useState(0);

  const [debtNew, setDebtNew] = useState(0);

  const isDesktop = useResponsive('up', 'sm');

  const isMobile = useResponsive('down', 'sm');

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'payments',
  });

  const values = watch();

  useEffect(() => {
    if (triggerClickAdd) {
      handleAdd();
    }
  }, [triggerClickAdd]);

  // Get total price payment order
  useEffect(() => {
    setTotalOrder(infoPaymentEdit?.totalPriceOrder);
    setTotalDiscountOrder(infoPaymentEdit?.totalDiscountPriceOrder);
    setTaxPrice(infoPaymentEdit?.totalTaxPrice);

    const totalPaymentPrice =
      infoPaymentEdit?.totalPriceOrder + infoPaymentEdit?.totalTaxPrice - infoPaymentEdit?.totalDiscountPriceOrder;
    setTotalPayment(totalPaymentPrice);
  }, [infoPaymentEdit]);

  useEffect(() => {
    if (Object.keys(currentSaleReceipt).length) {
      const paymentSuccess = currentSaleReceipt?.payment_items.filter((item) => item.payment.payment_status_id === 2);
      let totalAmount = 0;
      if (paymentSuccess.length > 0) {
        totalAmount = paymentSuccess.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      }

      setTotalPaid(totalAmount);
      setTotalRemain(totalPayment - parseFloat(totalAmount));
      setRemainPrice(currentSaleReceipt?.party?.remain_price);
      setTotalPrice(0);
      setDebtNew(0);
    }

  }, [currentSaleReceipt, totalPayment, isLoading]);

  const handleAdd = () => {
    append({
      id: null,
      attachFile: null,
      comment: '',
      user_payment: user,
      price_payment: 0,
      date_payment: moment().format('YYYY-MM-DD HH:mm'),
      fileName: '',
    });
  };

  const handleTotalPaid = (key, value, remove = '') => {
    let paymentItems = values?.payments || [];

    if (remove) {
      paymentItems = values?.payments.filter((_, index) => index !== key);
    }
    // handle when list order item have empty item
    const paymentItemsFilter = paymentItems.filter((item) => formatPriceNumber(item.price_payment.toString()) !== 0);

    let calculateTotalPrice = paymentItemsFilter.reduce(
      (total, item) => total + formatPriceNumber(item.price_payment.toString()),
      0
    );

    if (calculateTotalPrice > formatPriceNumber(totalRemain.toString())) {
      const priceForRow = formatPriceNumber(totalRemain.toString()) - (calculateTotalPrice - formatPriceNumber(value));
      setValue(key, currencyFormatter(priceForRow.toString()));
      calculateTotalPrice = calculateTotalPrice - formatPriceNumber(value) + priceForRow;
    }

    setDebtNew(remainPrice - calculateTotalPrice);

    setTotalPrice(calculateTotalPrice);

    // Set status for order when create payment
    setStatus(STATUSES.paying_sale_receipt);
  };

  useEffect(() => {
    const result = totalOrder + taxPrice - totalDiscountOrder;

    setTotalPayment(result);
  }, [totalOrder, taxPrice, totalDiscountOrder]);

  const handleDrop = useCallback(
    (event, key) => {
      const file = event.target.files[0];

      if (file) {
        const newFile = new File([file], file.name, { type: file.type });
        newFile.preview = URL.createObjectURL(file);

        setValue(`${key}.attachFile`, newFile);
        setValue(`${key}.fileName`, newFile.name);
      }
    },
    [setValue]
  );

  return (
    <Scrollbar>
      <Box sx={{ p: 3, pt: 3 }}>
        <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
          {fields.map((item, index) => (
            <Stack key={item.id} direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <Stack sx={isDesktop ? { width: '20%' } : {width: '100%'}}>
                <DateTimePicker
                  label="Ngày thanh toán"
                  name={`payments[${index}].date_payment`}
                  value={item.date_payment}
                  onChange={(newValue) => {
                    update(
                      `payments[${index}].date_payment`,
                      newValue ? moment(newValue).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm')
                    );
                    setValue(
                      `payments[${index}].date_payment`,
                      newValue ? moment(newValue).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm')
                    );
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Stack>
              <RHFTextField
                size="small"
                name={`payments[${index}].user_payment`}
                label="Người nhận thanh toán"
                value={user.name}
                disabled
                sx={isDesktop ? { width: '20%' } : {width: '100%'}}
              />
              <RHFTextField
                size="small"
                name={`payments[${index}].price_payment`}
                label="Số tiền thanh toán (VNĐ)"
                typeinput="price"
                sx={isDesktop ? { width: '20%' } : {width: '100%'}}
                inputProps={{
                  maxLength: 15,
                }}
                onChange={(e) => {
                  setValue(`payments[${index}].price_payment`, currencyFormatter(e.target.value.toString()));

                  handleTotalPaid(`payments[${index}].price_payment`, e.target.value);
                }}
              />
              <RHFTextField size="small" name={`payments[${index}].comment`} label="Ghi chú" sx={isDesktop ? { width: '20%' } : {width: '100%'}} />

              <RHFTextField
                size="small"
                name={`payments[${index}].fileName`}
                label="Đính kèm"
                type="file"
                sx={isDesktop ? { width: '20%' } : {width: '100%'}}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => handleDrop(e, `payments[${index}]`)}
                inputProps={{ accept: '*' }}
                value={null}
              />
              <IconButton aria-label="delete" onClick={() => {
                remove(index);
                handleTotalPaid(index, 0, 'remove')
              }}>
                <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
      </Box>
      <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Tổng cộng tiền thanh toán</Box>
          <Box sx={{ width: 180, typography: 'subtitle2' }}>
            {totalPayment ? currencyFormatter(totalPayment.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Số tiền đã thanh toán</Box>
          <Box sx={{ width: 180 }}>{totalPaid ? currencyFormatter(totalPaid.toString()) : '-'}</Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Số tiền thanh toán</Box>
          <Box sx={{ width: 180 }}> {totalPrice ? currencyFormatter(totalPrice.toString()) : '-'} </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Số tiền còn lại</Box>
          <Box sx={{ width: 180, typography: 'subtitle2' }}>
            {totalRemain ? currencyFormatter(totalRemain.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Công nợ cũ</Box>
          <Box sx={{ width: 180 }}>{remainPrice ? currencyFormatter(remainPrice.toString()) : '-'}</Box>
        </Stack>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Công nợ mới</Box>
          <Box sx={{ width: 180, textTransform: 'capitalize' }}>
            &nbsp;{debtNew ? currencyFormatter(debtNew.toString()) : '-'}
          </Box>
        </Stack>
      </Stack>
    </Scrollbar>
  );
}
