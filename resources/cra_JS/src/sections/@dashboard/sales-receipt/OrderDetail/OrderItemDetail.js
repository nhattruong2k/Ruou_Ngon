import React, { useEffect, useState } from 'react';
// form
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
// @mui
import { Avatar, Box, Stack, Table, TableBody, TableCell, TableRow } from '@mui/material';
// utils
import axios from '../../../../utils/axios';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { TableHeadCustom } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
import { getText } from '../../../../utils/number-to-text-vietnamese/index';
import { HOST_ASSETS_URL } from '../../../../config';
import { FOLDER_IMAGE } from '../../../../utils/constant';

const TABLE_HEAD = [
  {
    label: 'Mã SP',
    id: 'good_code',
    minWidth: 160,
  },
  {
    label: 'Tên SP',
    id: 'good_name',
    minWidth: 160,
  },
  {
    label: 'Hình ảnh',
    id: 'image',
    width: 100,
  },
  {
    label: 'Đơn vị tính',
    id: 'unit',
    minWidth: 120,
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    align: 'right',
    minWidth: 120,
  },
  {
    label: 'Đơn giá',
    id: 'price',
    minWidth: 160,
    align: 'right'
  },
  {
    label: 'Chiết khấu (%)',
    id: 'discount_rate',
    minWidth: 160,
    align: 'right'
  },
  {
    label: 'Thành tiền',
    id: 'total_price',
    minWidth: 160,
    align: 'right'
  },
  {
    label: 'Tiền CK',
    id: 'discount_price',
    minWidth: 160,
    align: 'right'
  },
];

export default function OrderItemDetail({
  currentOrderItems,
  isEdit = false,
  tax,
  infoPaymentEdit,
  isLoading = false,
  isRefresh,
  setRefresh,
}) {
  const { control, register, setValue, watch, resetField, getValues } = useFormContext();

  const { errors } = useFormState();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [itemRemove, setItemRemove] = useState(null);

  const [totalOrder, setTotalOrder] = useState(0);

  const [totalDiscountOrder, setTotalDiscountOrder] = useState(0);

  const [taxPrice, setTaxPrice] = useState(0);

  const [totalPricePayment, setTotalPricePayment] = useState(0);

  const [totalPaymentByText, setTotalPaymentByText] = useState('');

  const [timer, setTimer] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'items',
  });

  const isNotFound = !fields.length || (!isLoading && !fields.length);

  const values = watch();

  useEffect(() => {
    if (isEdit) {
      setTotalOrder(infoPaymentEdit?.totalPriceOrder);
      setTotalDiscountOrder(infoPaymentEdit?.totalDiscountPriceOrder);
      setTaxPrice(infoPaymentEdit?.totalTaxPrice);

      const result =
        infoPaymentEdit?.totalPriceOrder + infoPaymentEdit?.totalTaxPrice - infoPaymentEdit?.totalDiscountPriceOrder;
      setTotalPricePayment(result);
    }
  }, [isEdit, infoPaymentEdit]);

  useEffect(() => {
    if (isRefresh) {
      setTotalOrder(0);
      setTotalDiscountOrder(0);
      setTaxPrice(0);
      setTotalPricePayment(0);
      setTotalPaymentByText('');
      setRefresh();
    }
  }, [isRefresh]);

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleTotalOrder = () => {
    const orderItems = values?.items || [];

    // handle when list order item have empty item
    const orderItemsFilter = orderItems.filter((item) => item.good_code !== null && item.quantity);

    const result = orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.total_price), 0);
    setTotalOrder(result);

    // tax GTGT
    setTaxPrice((result * tax) / 100);
  };

  const handleTotalDiscountPrice = () => {
    const orderItems = values?.items || [];

    // handle when list order item have empty item
    const orderItemsFilter = orderItems.filter((item) => item.good_code !== null && item.quantity);

    setTotalDiscountOrder(orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.discount_price), 0));
  };

  const handleDiscountPrice = (totalPrice, discountRate) => {
    return (totalPrice * parseFloat(discountRate)) / 100;
  };

  const checkDiscountRate = (currentDiscount, maxDiscount) => {
    if (currentDiscount > parseFloat(maxDiscount))
      enqueueSnackbar('Chiết khấu vượt quá quy định', { variant: 'warning' });
  };

  const handleDiscountRate = (totalPrice, discountPrice) => {
    return (discountPrice / totalPrice) * 100;
  };

  useEffect(() => {
    const result = totalOrder + taxPrice - totalDiscountOrder;

    setTotalPaymentByText(getText(Number.isNaN(result) ? 0 : result));

    setTotalPricePayment(result);
  }, [totalOrder, taxPrice, totalDiscountOrder]);

  const checkQuantityBeforeCreate = async (goodChosen, index) => {
    const currentChosen = values?.items?.filter((value) => value?.good_code?.id === goodChosen)[0];

    if (values.warehouse?.id) {
      const body = {
        good_id: goodChosen,
        warehouse_id: values.warehouse?.id,
        quantity: Number(currentChosen.quantity),
      };
      await axios.post('check-quantity-before-create', body).then((response) => {
        if (!response?.data?.data) {
          enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
          setValue(`items[${index}].quantity`, 1);
        }
      });
    } else enqueueSnackbar('Chưa chọn kho đặt hàng. Vui lòng chọn kho!', { variant: 'error' });
  };

  return (
    <>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {currentOrderItems.map((element, index) => (
              <TableRow key={`${index}_${element?.id}`} hover>
                <TableCell>{element?.good?.code || ''}</TableCell>
                <TableCell>{element?.good?.name || ''}</TableCell>
                <TableCell sx={{ width: 120 }}>
                  <Avatar
                    alt={element?.good?.name || ''}
                    src={`${HOST_ASSETS_URL}storage/${FOLDER_IMAGE.good}/${element?.good?.photo}`}
                    variant="rounded"
                    sx={{ width: 50, height: 50, mr: 2 }}
                  />
                </TableCell>
                <TableCell>{element?.good?.unit_of_measure?.name || ''}</TableCell>
                <TableCell align="right">{element?.quantity || 0}</TableCell>
                <TableCell align="right">{currencyFormatter(element?.price || 1)}</TableCell>
                <TableCell align="right">{element?.percent_discount || 1}</TableCell>
                <TableCell align="right">{currencyFormatter((element?.price || 0) * (element?.quantity || 0))}</TableCell>
                <TableCell align="right">
                  {currencyFormatter((element?.price - element?.discount) * element?.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
      <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Cộng tiền hàng</Box>
          <Box sx={{ width: 160, typography: 'subtitle2' }}>
            {totalOrder ? currencyFormatter(totalOrder.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Thuế xuất GTGT</Box>
          <Box sx={{ width: 160 }}> {`${tax}%`} </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Tiền thuế GTGT</Box>
          <Box sx={{ width: 160 }}>{taxPrice ? currencyFormatter(taxPrice.toString()) : '-'}</Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Cộng tiền chiết khấu</Box>
          <Box sx={{ width: 160, typography: 'subtitle2', color: '#ff5630' }}>
            {totalDiscountOrder ? `- ${currencyFormatter(totalDiscountOrder.toString())}` : '-'}
          </Box>
        </Stack>

        <Stack direction="row" sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>
          <Box>Tổng cộng tiền thanh toán</Box>
          <Box sx={{ width: 160 }}>{totalPricePayment ? currencyFormatter(totalPricePayment.toString()) : '-'}</Box>
        </Stack>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Số tiền viết bằng chữ (VNĐ):</Box>
          <Box sx={{ minWidth: 160 }}>&nbsp;{totalPaymentByText || '-'}</Box>
        </Stack>
      </Stack>
    </>

  );
}
