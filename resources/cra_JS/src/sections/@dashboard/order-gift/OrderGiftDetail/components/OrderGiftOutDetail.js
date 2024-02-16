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
import { RHFTextField } from '../../../../../components/hook-form';
import { TableHeadCustom, useTable } from '../../../../../components/table';
import Scrollbar from '../../../../../components/scrollbar/Scrollbar';
import Iconify from '../../../../../components/iconify';
import { currencyFormatter, formatPriceNumber } from '../../../../../utils/formatNumber';
import ConfirmDialog from '../../../../../components/confirm-dialog';

const TABLE_HEAD = [
  {
    label: 'Tên sản phẩm',
    id: 'good_name',
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    align: 'right',
  },
  {
    label: 'Đơn giá (VNĐ)',
    id: 'price',
    align: 'right',
  },
  {
    id: '',
  },
];

export default function OrderGiftOutDetail({
  triggerClickAddGiftOut,
  isEdit = false,
  infoGiftItems,
  activeFields,
  isRefresh,
  setRefresh,
  setTotalPrice,
  mode,
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

  const [totalOrder, setTotalOrder] = useState();

  const [totalPricePayment, setTotalPricePayment] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'itemGiftOuts',
  });

  const values = watch();

  useEffect(() => {
    if (triggerClickAddGiftOut) {
      handleAdd();
    }
  }, [triggerClickAddGiftOut]);

  useEffect(() => {
    if (isEdit) {
      setTotalPrice(infoGiftItems.totalGiftItem);
      setTotalPricePayment(infoGiftItems.totalGiftItem);
    }
  }, [isEdit, infoGiftItems]);

  useEffect(() => {
    if (isRefresh) {
      setTotalOrder(0);
      setTotalPricePayment(0);
      setRefresh();
    }
  }, [isRefresh]);

  const handleAdd = () => {
    prepend({
      id: null,
      good_name: '',
      quantity: 1,
      price: 0,
    });
  };

  const handleRemove = async () => {
    if (itemRemove.item.id) {
      setLoadingBtnSave(true);

      const orderItemChosen = values.itemGiftOuts.at(itemRemove.index);

      if (orderItemChosen?.id) {
        const body = {
          id: orderItemChosen.id,
        };

        await axios.post('rm-gift-item-order-gift', body).then((response) => {
          enqueueSnackbar('Xóa thành công');
        });
      }
      setLoadingBtnSave(false);
      remove(itemRemove.index);
      values.itemGiftOuts.splice(itemRemove.index, 1);
      handleTotalOrder();

      setOpenConfirm(false);
    }
  };

  const handleOpenConfirm = (key, data) => {
    setItemRemove({ index: key, item: data });
    if (isEdit) {
      setOpenConfirm(true);
    } else {
      remove(key);
      if (values?.itemGiftOuts) {
        values.itemGiftOuts.splice(key, 1);
        handleTotalOrder();
      }
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleTotalOrder = () => {
    const itemGiftOuts = values?.itemGiftOuts || [];

    // handle when list order item have empty item
    const itemGiftOutsFilter = itemGiftOuts.filter(
      (item) => item.good_name && formatPriceNumber(item.price.toString())
    );

    const newItemGiftOuts = itemGiftOutsFilter.map((item) => ({
      ...item,
      totalPrice: formatPriceNumber(item.price.toString()) * item.quantity,
    }));

    const result = newItemGiftOuts.reduce((total, item) => total + formatPriceNumber(item.totalPrice.toString()), 0);

    setTotalOrder(result);

    setTotalPrice(result);
  };

  useEffect(() => {
    setTotalPricePayment(totalOrder);
  }, [totalOrder]);

  return (
    <>
      <Scrollbar>
        <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {fields.map((element, index) => (
              <TableRow key={`${index}_${element?.id}`} hover>
                <TableCell sx={{ width: '33.33%' }}>
                  {
                    <RHFTextField
                      size="small"
                      name={`itemGiftOuts[${index}].good_name`}
                      disabled={activeFields.good_name}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        maxLength: 255,
                      }}
                      onChange={(e) => {
                        setValue(`itemGiftOuts[${index}].good_name`, e.target.value);
                        handleTotalOrder();
                      }}
                    />
                  }
                </TableCell>
                <TableCell sx={{ width: '33.33%' }}>
                  {
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      name={`itemGiftOuts[${index}].quantity`}
                      disabled={activeFields.quantity}
                      type="number"
                      onChange={(e) => {
                        const quantity = e.target.value ? e.target.value : 1;
                        setValue(`itemGiftOuts[${index}].quantity`, quantity);
                        handleTotalOrder();
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                </TableCell>
                <TableCell sx={{ width: '33.33%' }}>
                  {
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      name={`itemGiftOuts[${index}].price`}
                      disabled={activeFields.price}
                      typeinput="price"
                      onChange={(e) => {
                        setValue(`itemGiftOuts[${index}].price`, e.target.value ? currencyFormatter(e.target.value) : 0);
                        handleTotalOrder();
                      }}
                    />
                  }
                </TableCell>
                <TableCell>
                  {(mode === 'add' || mode === 'edit') && (
                    <IconButton
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
