import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// form
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
// @mui
import { Box, Button, Stack, Table, TableBody, TableCell, TableRow, TextField, Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
// utils
import axios from '../../../../utils/axios';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { RHFAutocomplete, RHFTextField } from '../../../../components/hook-form';
import { TableHeadCustom, TableNoData, useTable } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import Iconify from '../../../../components/iconify';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
import { getText } from '../../../../utils/number-to-text-vietnamese/index';
import ConfirmDialog from '../../../../components/confirm-dialog';
import Image from '../../../../components/image';
import { HOST_ASSETS_URL } from '../../../../config';
import { FOLDER_IMAGE } from '../../../../utils/constant';

const TABLE_HEAD = [
  {
    label: 'Mã sản phẩm',
    id: 'good_code',
  },
  {
    label: 'Tên sản phẩm',
    id: 'good_name',
  },
  {
    label: 'Hình ảnh',
    id: 'image',
  },
  {
    label: 'Đơn VT',
    id: 'unit',
  },
  {
    label: 'Số lượng',
    id: 'quantity',
  },
  {
    label: 'Đơn giá',
    id: 'price',
  },
  {
    label: 'Chiết khấu',
    id: 'discount_rate',
  },
  {
    label: 'Thành tiền',
    id: 'total_price',
  },
  {
    label: 'Tiền CK',
    id: 'discount_price',
  },
  {

    id: '',
  },
];
const SalesReceiptOrderDetail = forwardRef(({
  goods,
  currentParty,
  isEdit = false,
  tax,
  infoPaymentEdit,
  activeFields,
  isLoading = false,
  mode,
  isRefresh,
  setRefresh,
  loadingGoods = false,
  orderSample,
}, ref) => {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultRowsPerPage: 10,
  });
  const { control, register, setValue, watch, resetField, getValues, reset } = useFormContext();

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
    } else {
      setTotalOrder(0);
      setTotalDiscountOrder(0);
      setTaxPrice(0);
      setTotalPricePayment(0);
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

  const handleAdd = () => {
    prepend({
      order_item_id: null,
      good_code: null,
      good_name: '',
      good_image: '',
      good_unit: '',
      quantity: 1,
      price: 0,
      total_price: 0,
      discount_price: 0,
      discount_rate: 0,
    });
  };

  const handleAddOrderSample = () => {
    const items = orderSample?.order_item_samples.map((item) => {

      return {
        order_item_id: null,
        good_code: item.good,
        good_name: item.good.name,
        good_image: item.good.photo,
        good_unit: item.good.unit_of_measure.name,
        quantity: 0,
        price: item.good.price,
        total_price: 0,
        discount_price: 0,
        discount_rate: item.discount,
      }
    })
    append(items);
  };


  const handleRemove = async () => {
    if (itemRemove.item.id) {
      setLoadingBtnSave(true);

      const orderItemChosen = values.items.at(itemRemove.index);

      if (orderItemChosen?.id) {
        const body = {
          id: orderItemChosen.id,
        };

        await axios.post('rm-order-item-sales-receipt', body).then((response) => {
          enqueueSnackbar('Xóa thành công');
        });
      }
      setLoadingBtnSave(false);
      remove(itemRemove.index);
      values.items.splice(itemRemove.index, 1);
      handleTotalOrder();
      handleTotalDiscountPrice();

      setOpenConfirm(false);
    }
  };

  const handleOpenConfirm = (key, data) => {
    setItemRemove({ index: key, item: data });
    if (isEdit) {
      setOpenConfirm(true);
    } else {
      remove(key);
      if (values?.items) {
        values.items.splice(key, 1);
        handleTotalOrder();
        handleTotalDiscountPrice();
      }
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleTotalOrder = (vatRate = 0) => {
    const orderItems = values?.items || [];

    // handle when list order item have empty item
    const orderItemsFilter = orderItems.filter((item) => item.good_code !== null && item.quantity);

    const result = orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.total_price), 0);
    setTotalOrder(result);

    // tax GTGT
    if (vatRate === 0) vatRate = values?.vat_rate || 0;

    setTaxPrice((result * vatRate) / 100);
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

    setTotalPaymentByText(getText(result));

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
          setValue(`items[${index}].quantity`, 0);
        }
      });
    } else enqueueSnackbar('Chưa chọn kho đặt hàng. Vui lòng chọn kho!', { variant: 'error' });

  };

  useImperativeHandle(ref, () => ({
    handleAdd,
    handleAddOrderSample
  }));

  return (
    <Scrollbar>
      <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
        <TableHeadCustom headLabel={TABLE_HEAD} />

        <TableBody>
          {fields.map((element, index) => (
            <TableRow key={`${index}_${element?.id}`} hover>
              <TableCell>
                <RHFAutocomplete
                  sx={{ width: { md: 170 } }}
                  name={`items[${index}].good_code`}
                  loading={loadingGoods}
                  autoHighlight
                  disabled={activeFields.good_code}
                  options={goods.map((option) => option)}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(option =>
                      option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      ||
                      option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    const ItemFilter = values.items.filter((good) => good?.good_code?.id === newValue?.id);
                    if (ItemFilter.length > 1) {
                      enqueueSnackbar('Mã sản phẩm đã tồn tại', { variant: 'error' });
                      update(`items[${index}].good_code`, null);
                      update(`items[${index}].good_name`, '');
                      update(`items[${index}].good_unit`, '');
                      update(`items[${index}].price`, 0);
                      update(`items[${index}].discount_rate`, 0);
                      update(`items[${index}].total_price`, 0);
                      setValue(`items[${index}].good_code`, null);
                      setValue(`items[${index}].good_name`, '');
                      setValue(`items[${index}].good_unit`, '');
                      setValue(`items[${index}].price`, 0);
                      setValue(`items[${index}].discount_rate`, 0);
                      setValue(`items[${index}].total_price`, 0);
                    } else {
                      let discountOfGood = parseFloat(newValue?.discount_rate || 0)
                        ? newValue?.discount_rate || 0
                        : currentParty?.discount_rate || 0;
                      const totalPrice = newValue?.price
                        ? (newValue?.price * Number(fields[index].quantity)).toString()
                        : 0;
                      discountOfGood = Number(discountOfGood);
                      const discountPrice = handleDiscountPrice(totalPrice, discountOfGood);
                      update(`items[${index}].good_code`, newValue);
                      update(`items[${index}].good_name`, newValue?.name);
                      update(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                      update(`items[${index}].price`, newValue?.price ? currencyFormatter(newValue?.price) : 0);
                      update(`items[${index}].discount_rate`, discountOfGood);
                      update(`items[${index}].total_price`, currencyFormatter(totalPrice));
                      update(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                      setValue(`items[${index}].good_code`, newValue);
                      setValue(`items[${index}].good_name`, newValue?.name);
                      setValue(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                      setValue(`items[${index}].price`, newValue?.price ? currencyFormatter(newValue?.price) : 0);
                      setValue(`items[${index}].discount_rate`, discountOfGood || 0);
                      setValue(`items[${index}].total_price`, currencyFormatter(totalPrice));
                      setValue(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                      setValue(`items[${index}].good_image`, newValue?.photo);
                      handleTotalOrder();
                      handleTotalDiscountPrice();
                      checkQuantityBeforeCreate(newValue?.id, index);
                    }
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option?.code} - {option?.name}
                      </li>
                    );
                  }}
                  getOptionLabel={(option) => option.code || ''}
                  renderInput={(params) => <TextField {...params} size="small" InputLabelProps={{ shrink: true }} />}
                />
              </TableCell>
              <TableCell sx={{ width: 180 }}>
                {element?.good_name || ''}
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <Avatar
                  alt={element?.good_name || ''}
                  src={`${HOST_ASSETS_URL}storage/${FOLDER_IMAGE.good}/${element?.good_image}`}
                  variant="rounded"
                  sx={{ width: 50, height: 50, mr: 2 }}
                />

              </TableCell>
              <TableCell sx={{ width: 120 }}>
                {element?.good_unit || ""}
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <RHFTextField
                  size="small"
                  name={`items[${index}].quantity`}
                  type="number"
                  disabled={activeFields.quantity}
                  onChange={(e) => {
                    clearTimeout(timer);
                    const newTimer = setTimeout(() => {
                      checkQuantityBeforeCreate(element?.good_code?.id, index);
                    }, 500);
                    setTimer(newTimer);
                    const quantity = e.target.value ? e.target.value : 1;
                    const totalPrice = formatPriceNumber(element.price.toString()) * Number(quantity);
                    const discountPrice = (totalPrice * Number(fields[index].discount_rate)) / 100;
                    update(`items[${index}].quantity`, quantity);
                    setValue(`items[${index}].quantity`, quantity);
                    setValue(`items[${index}].total_price`, currencyFormatter(totalPrice.toString()));
                    setValue(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                    handleTotalOrder();
                    handleTotalDiscountPrice();
                  }}
                  sx={{ maxWidth: { md: 100 } }}
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell sx={{ width: 180 }}>
                {currencyFormatter(element?.price || '')}
              </TableCell>
              <TableCell sx={{ width: 140 }}>
                <RHFTextField
                  size="small"
                  name={`items[${index}].discount_rate`}
                  type="number"
                  disabled={activeFields.discount_rate}
                  onChange={(e) => {
                    const discountRate = e.target.value ? e.target.value.replace(',', '.') : 0;
                    const discountPrice = handleDiscountPrice(formatPriceNumber(element.total_price.toString()), discountRate);
                    update(`items[${index}].discount_rate`, discountRate);
                    setValue(`items[${index}].discount_rate`, discountRate);
                    setValue(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                    handleTotalDiscountPrice();
                    checkDiscountRate(discountRate, element?.good_code?.max_discount_rate);
                  }}
                />
              </TableCell>
              <TableCell sx={{ width: 180 }}>
                {currencyFormatter(element?.total_price || '')}
              </TableCell>
              <TableCell sx={{ width: 180 }}>
                <RHFTextField
                  size="small"
                  name={`items[${index}].discount_price`}
                  disabled={activeFields.discount_price}
                  onChange={(e) => {
                    const discountPrice = e.target.value ? formatPriceNumber(e.target.value) : 0;
                    const discountRate = handleDiscountRate(formatPriceNumber(element.total_price), discountPrice);
                    setValue(`items[${index}].discount_rate`, parseFloat(discountRate.toFixed(2)));
                    setValue(`items[${index}].discount_price`, e.target.value ? currencyFormatter(e.target.value) : 0);
                    handleTotalDiscountPrice();
                    checkDiscountRate(discountRate, element?.good_code?.max_discount_rate);
                  }}
                />
              </TableCell>
              <TableCell>
                {(mode === 'add' || mode === 'edit') && (
                  <IconButton
                    sx={{ maxWidth: { md: 120 } }}
                    aria-label="delete"
                    size="small"
                    color="error"
                    disabled={loadingBtnSave}
                    onClick={() => {
                      handleOpenConfirm(index, element);
                    }}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableNoData isNotFound={isNotFound} />
        </TableBody>
      </Table>
      <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Cộng tiền hàng</Box>
          <Box sx={{ width: 160, typography: 'subtitle2' }}>
            {totalOrder ? currencyFormatter(totalOrder.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Thuế xuất GTGT</Box>
          {/* <Box sx={{ width: 160 }}> {totalOrder ? '10%' : '-'} </Box> */}
          <Box sx={{ width: 160 }}>
            <RHFTextField
              sx={{ width: 100 }}
              size="small"
              name={"vat_rate"}
              // disabled={activeFields.discount_price}
              onChange={(e) => {
                setValue('vat_rate', e.target.value);
                handleTotalOrder(e.target.value);
              }}
              type="number"
            />
          </Box>
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

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content="Bạn có chắc chắn muốn xóa?"
        action={
          <Button variant="contained" color="error" onClick={handleRemove}>
            Xóa
          </Button>
        }
      />
    </Scrollbar>
  );

});

export default SalesReceiptOrderDetail;