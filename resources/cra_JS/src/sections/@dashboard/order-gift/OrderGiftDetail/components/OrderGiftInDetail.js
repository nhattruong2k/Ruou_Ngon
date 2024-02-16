import React, { useEffect, useState } from 'react';
// form
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
// @mui
import { Box, Button, Stack, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
// utils
import axios from '../../../../../utils/axios';
// components
import { useSnackbar } from '../../../../../components/snackbar';
import { RHFAutocomplete, RHFTextField } from '../../../../../components/hook-form';
import { TableHeadCustom, useTable } from '../../../../../components/table';
import Scrollbar from '../../../../../components/scrollbar/Scrollbar';
import Iconify from '../../../../../components/iconify';
import { currencyFormatter, formatPriceNumber } from '../../../../../utils/formatNumber';
import ConfirmDialog from '../../../../../components/confirm-dialog';

const TABLE_HEAD = [
  {
    label: 'Mã sản phẩm',
    id: 'good_code',
    minWidth: 150,
  },
  {
    label: 'Tên sản phẩm',
    id: 'good_name',
    minWidth: 150,
  },
  {
    label: 'Đơn vị tính',
    id: 'unit',
    minWidth: 150,
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    minWidth: 150,
    align: 'right',
  },
  {
    label: 'Đơn giá (vnđ)',
    id: 'price',
    minWidth: 150,
    align: 'right',
  },
  {
    label: 'Chiết khấu (%)',
    id: 'discount_rate',
    minWidth: 150,
    align: 'right',
  },
  {
    label: 'Thành tiền (vnđ)',
    id: 'total_price',
    minWidth: 150,
    align: 'right',
  },
  {
    label: 'Tiền chiết khấu (vnđ)',
    id: 'discount_price',
    minWidth: 180,
    align: 'right',
  },
  {
    id: '',
  },
];

export default function OrderGiftInDetail({
  triggerClickAddGiftIn,
  goods,
  currentParty,
  isEdit = false,
  mode,
  infoOrderItems,
  activeFields,
  isLoading = false,
  isRefresh,
  setRefresh,
  setTotalPrice,
  loadingGoods,
}) {
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
  const { control, register, setValue, watch, resetField, getValues } = useFormContext();

  const { errors } = useFormState();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [itemRemove, setItemRemove] = useState(null);

  const [totalOrder, setTotalOrder] = useState(0);

  const [totalDiscountOrder, setTotalDiscountOrder] = useState(0);

  const [totalPricePayment, setTotalPricePayment] = useState(0);

  const [timer, setTimer] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'itemGiftIns',
  });

  const values = watch();

  useEffect(() => {
    if (triggerClickAddGiftIn) {
      handleAdd();
    }
  }, [triggerClickAddGiftIn]);

  useEffect(() => {
    if (isEdit) {
      setTotalOrder(infoOrderItems?.totalPriceOrder);
      setTotalDiscountOrder(infoOrderItems?.totalDiscountPriceOrder);

      const result = infoOrderItems?.totalPriceOrder - infoOrderItems?.totalDiscountPriceOrder;
      setTotalPricePayment(result);
      setTotalPrice(result);
    }
  }, [isEdit, infoOrderItems]);

  useEffect(() => {
    if (isRefresh) {
      setTotalOrder(0);
      setTotalDiscountOrder(0);
      setTotalPricePayment(0);
      setTotalPrice(0);
      setRefresh();
    }
  }, [isRefresh]);

  const handleAdd = () => {
    prepend({
      id: null,
      good_code: null,
      good_name: '',
      good_unit: '',
      quantity: '',
      price: 0,
      total_price: 0,
      discount_price: 0,
      discount_rate: 0,
    });
  };

  const handleRemove = async () => {
    if (itemRemove.item.id) {
      setLoadingBtnSave(true);

      const orderItemChosen = values.itemGiftIns.at(itemRemove.index);

      if (orderItemChosen?.id) {
        const body = {
          id: orderItemChosen.id,
        };

        await axios.post('rm-order-item-order-gift', body).then((response) => {
          enqueueSnackbar('Xóa thành công');
        });
      }
      setLoadingBtnSave(false);
      remove(itemRemove.index);
      values.itemGiftIns.splice(itemRemove.index, 1);
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
      if (values?.itemGiftIns) {
        values.itemGiftIns.splice(key, 1);
        handleTotalOrder();
        handleTotalDiscountPrice();
      }
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleTotalOrder = () => {
    const orderItems = values?.itemGiftIns || [];

    // handle when list order item have empty item
    const orderItemsFilter = orderItems.filter((item) => item.good_code !== null && item.quantity);

    const result = orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.total_price), 0);

    setTotalOrder(result);
  };

  const handleTotalDiscountPrice = () => {
    const orderItems = values?.itemGiftIns || [];

    // handle when list order item have empty item
    const orderItemsFilter = orderItems.filter((item) => item.good_code !== null && item.quantity);

    setTotalDiscountOrder(orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.discount_price), 0));
  };

  const handleDiscountPrice = (totalPrice, discountRate) => (totalPrice * parseFloat(discountRate)) / 100;

  const checkDiscountRate = (currentDiscount, maxDiscount) => {
    if (currentDiscount > parseFloat(maxDiscount))
      enqueueSnackbar('Chiết khấu vượt quá quy định', { variant: 'warning' });
  };

  useEffect(() => {
    const result = totalOrder - totalDiscountOrder;

    setTotalPricePayment(result);
    setTotalPrice(result);
  }, [totalOrder, totalDiscountOrder]);

  const checkQuantityBeforeCreate = async (goodChosen, index) => {
    const currentChosen = values?.itemGiftIns?.filter((value) => value?.good_code?.id === goodChosen)[0];

    const body = {
      good_id: goodChosen,
      warehouse_id: values.warehouse?.id,
      quantity: Number(currentChosen.quantity),
    };

    if (Number(currentChosen.quantity) && values.warehouse?.id) {
      await axios.post('check-quantity-before-create', body).then((response) => {
        if (!response?.data?.data) {
          enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
          // setValue(`itemGiftIns[${index}].quantity`, '');
          // setValue(`itemGiftIns[${index}].total_price`, '');
          // setValue(`itemGiftIns[${index}].discount_price`, '');
        }
      });
    } else if (Number(currentChosen.quantity)) {
      enqueueSnackbar('Vui lòng chọn kho hàng cho sản phẩm này!', { variant: 'error' });
      setValue(`itemGiftIns[${index}].quantity`, '');
      setValue(`itemGiftIns[${index}].total_price`, '');
      setValue(`itemGiftIns[${index}].discount_price`, '');
    }
  };

  return (
    <>
      <Scrollbar>
        <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {fields.map((element, index) => (
              <TableRow key={`${index}_${element?.id}`} hover>
                <TableCell>
                  {
                    <RHFAutocomplete
                      sx={{ width: { md: 120 } }}
                      name={`itemGiftIns[${index}].good_code`}
                      autoHighlight
                      loading={loadingGoods}
                      disabled={activeFields.good_code}
                      options={goods.map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        const ItemFilter = values.itemGiftIns.filter((good) => good?.good_code?.id === newValue?.id);
                        if (ItemFilter.length > 0) {
                          enqueueSnackbar('Mã sản phẩm đã tồn tại', { variant: 'error' });
                          update(`itemGiftIns[${index}].good_code`, null);
                          update(`itemGiftIns[${index}].good_name`, '');
                          update(`itemGiftIns[${index}].good_unit`, '');
                          update(`itemGiftIns[${index}].price`, 0);
                          update(`itemGiftIns[${index}].discount_rate`, 0);
                          update(`itemGiftIns[${index}].total_price`, 0);
                          setValue(`itemGiftIns[${index}].good_code`, null);
                          setValue(`itemGiftIns[${index}].good_name`, '');
                          setValue(`itemGiftIns[${index}].good_unit`, '');
                          setValue(`itemGiftIns[${index}].price`, 0);
                          setValue(`itemGiftIns[${index}].discount_rate`, 0);
                          setValue(`itemGiftIns[${index}].total_price`, 0);
                        } else {
                          const discountOfGood = newValue?.discount_rate
                            ? newValue?.discount_rate
                            : currentParty.discount_rate;
                          const totalPrice = newValue?.price
                            ? (newValue?.price * Number(fields[index].quantity)).toString()
                            : 0;
                          const discountPrice = handleDiscountPrice(totalPrice, discountOfGood);
                          update(`itemGiftIns[${index}].good_code`, newValue);
                          update(`itemGiftIns[${index}].good_name`, newValue?.name);
                          update(`itemGiftIns[${index}].good_unit`, newValue?.unit_of_measure?.name);
                          update(`itemGiftIns[${index}].price`, newValue?.price ? currencyFormatter(newValue?.price) : 0);
                          update(`itemGiftIns[${index}].discount_rate`, discountOfGood);
                          update(`itemGiftIns[${index}].total_price`, currencyFormatter(totalPrice));
                          update(`itemGiftIns[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                          setValue(`itemGiftIns[${index}].good_code`, newValue);
                          setValue(`itemGiftIns[${index}].good_name`, newValue?.name);
                          setValue(`itemGiftIns[${index}].good_unit`, newValue?.unit_of_measure?.name);
                          setValue(
                            `itemGiftIns[${index}].price`,
                            newValue?.price ? currencyFormatter(newValue?.price) : 0
                          );
                          setValue(`itemGiftIns[${index}].discount_rate`, discountOfGood || 0);
                          setValue(`itemGiftIns[${index}].total_price`, currencyFormatter(totalPrice));
                          setValue(`itemGiftIns[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                          handleTotalOrder();
                          handleTotalDiscountPrice();
                          checkQuantityBeforeCreate(newValue?.id, index);
                        }
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option?.code}
                        </li>
                      )}
                      getOptionLabel={(option) => option.code || ''}
                      renderInput={(params) => <TextField {...params} size="small" InputLabelProps={{ shrink: true }} />}
                    />
                  }
                </TableCell>
                <TableCell>
                  {
                    <RHFTextField
                      size="small"
                      name={`itemGiftIns[${index}].good_name`}
                      sx={{ maxWidth: { md: 200 } }}
                      InputLabelProps={{ shrink: true }}
                      disabled
                      inputProps={{
                        maxLength: 255,
                        readOnly: true,
                        disabled: true,
                      }}
                    />
                  }
                </TableCell>
                <TableCell>
                  {
                    <RHFTextField
                      size="small"
                      name={`itemGiftIns[${index}].good_unit`}
                      sx={{ maxWidth: { md: 120 } }}
                      InputLabelProps={{ shrink: true }}
                      disabled
                      inputProps={{
                        maxLength: 255,
                        readOnly: true,
                        disabled: true,
                      }}
                    />
                  }
                </TableCell>
                <TableCell align='right'>
                  {
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      name={`itemGiftIns[${index}].quantity`}
                      type="number"
                      disabled={activeFields.quantity}
                      onChange={(e) => {
                        clearTimeout(timer);
                        const newTimer = setTimeout(() => {
                          checkQuantityBeforeCreate(element?.good_code?.id, index);
                        }, 500);
                        setTimer(newTimer);
                        const quantity = e.target.value ? e.target.value : '';
                        const totalPrice = formatPriceNumber(element.price) * Number(quantity);
                        const discountPrice = (totalPrice * Number(fields[index].discount_rate)) / 100;
                        update(`itemGiftIns[${index}].quantity`, quantity);
                        setValue(`itemGiftIns[${index}].quantity`, quantity);
                        setValue(`itemGiftIns[${index}].total_price`, currencyFormatter(totalPrice.toString()));
                        setValue(`itemGiftIns[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                        handleTotalOrder();
                        handleTotalDiscountPrice();
                      }}
                      sx={{ maxWidth: { md: 100 } }}
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                </TableCell>
                <TableCell align='right'>
                  {<RHFTextField size="small" name={`itemGiftIns[${index}].price`} typeinput="price" disabled className="input-number-text-align-right" />}
                </TableCell>
                <TableCell align='right'>
                  {
                    <RHFTextField
                      size="small"
                      name={`itemGiftIns[${index}].discount_rate`}
                      type="number"
                      disabled={activeFields.discount_rate}
                      onChange={(e) => {
                        const discountRate = e.target.value ? e.target.value.replace(',', '.') : 0;
                        const discountPrice = handleDiscountPrice(formatPriceNumber(element.total_price), discountRate);
                        update(`itemGiftIns[${index}].discount_rate`, discountRate);
                        setValue(`itemGiftIns[${index}].discount_rate`, discountRate);
                        setValue(`itemGiftIns[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                        handleTotalDiscountPrice();
                        checkDiscountRate(discountRate, element?.good_code?.max_discount_rate);
                      }}
                      className="input-number-text-align-right"
                    />
                  }
                </TableCell>
                <TableCell align='right'>
                  {<RHFTextField size="small" name={`itemGiftIns[${index}].total_price`} disabled className="input-number-text-align-right" />}
                </TableCell>
                <TableCell align='right'>
                  {<RHFTextField size="small" name={`itemGiftIns[${index}].discount_price`} disabled className="input-number-text-align-right" />}
                </TableCell>
                <TableCell align='right'>
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
          </TableBody>
        </Table>
      </Scrollbar>
      <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}>
        <Stack direction="row" sx={{ typography: 'subtitle2' }}>
          <Box>Cộng tiền hàng</Box>
          <Box sx={{ width: 160 }}>{totalPricePayment ? currencyFormatter(totalPricePayment.toString()) : '-'}</Box>
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
    </>
  );
}
