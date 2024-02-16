import { useEffect, useState } from 'react';
// form
import { useFormContext, useFieldArray, useFormState } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, TextField, InputAdornment, MenuItem, CircularProgress } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import Iconify from '../../../components/iconify';
// utils
import axios from '../../../utils/axios';
// components
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';

export default function WarehouseExportDetail({
  triggerClickAdd,
  goods,
  addQuantity,
  currentOrder,
  functionId,
  isSuccess,
}) {
  const { control, register, setValue, watch, resetField } = useFormContext();

  const { errors } = useFormState();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const [itemRemove, setItemRemove] = useState(null);

  const [canCreateOrderItem, setCanCreateOrderItem] = useState(null);

  const [timer, setTimer] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'items',
  });

  const values = watch();

  useEffect(() => {
    if (triggerClickAdd) {
      handleAdd();
    }
  }, [triggerClickAdd]);

  const handleAdd = () => {
    prepend({
      order_item_id: '',
      good_code: null,
      good_name: '',
      good_unit: '',
      quantity: 1,
    });
  };

  const handleRemove = async () => {
    if (itemRemove.item.order_item_id) {
      setLoadingBtnSave(true);

      const orderItemChosen = currentOrder.order_items.at(itemRemove.index);
      const body = {
        id: orderItemChosen.id,
        order_id: orderItemChosen.order_id,
        function_id: functionId,
        good_id: orderItemChosen.good_id,
      };

      await axios.post('rm-order-item-warehouse-export', body).then((response) => {
        remove(itemRemove.index);
        setLoadingBtnSave(false);
        enqueueSnackbar('Xóa thành công');
      });

      setOpenConfirm(false);
    }
  };

  const handleOpenConfirm = (key, data) => {
    setItemRemove({ index: key, item: data });
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const checkQuantityBeforeCreate = async (goodChosen, index) => {
    const currentChosen = values?.items?.filter((value) => value?.good_code?.id === goodChosen)[0];

    const body = {
      good_id: goodChosen,
      warehouse_id: values.export_warehouse.id,
      quantity: Number(currentChosen.quantity),
    };
    await axios.post('check-quantity-before-create', body).then((response) => {
      if (!response?.data?.data) {
        enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
        // setValue(`items[${index}].quantity`, 1);
        // addQuantity();
      }
    });
  };
  return (
    <Box sx={{ p: 1, pt: 3 }}>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ width: 1 }}>
              <RHFAutocomplete
                sx={{ width: { md: '100%' } }}
                name={`items[${index}].good_code`}
                autoHighlight
                disabled={isSuccess}
                options={goods.map((option) => option)}
                filterOptions={(options, { inputValue }) =>
                  options.filter(
                    (option) =>
                      option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                      option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  addQuantity();
                  const ItemFilter = values.items.filter((good) => good?.good_code?.id === newValue?.id);
                  if (ItemFilter.length > 0) {
                    enqueueSnackbar('Mã sản phẩm đã tồn tại', { variant: 'error' });
                    update(`items[${index}].good_code`, null);
                    update(`items[${index}].good_name`, '');
                    update(`items[${index}].good_unit`, '');
                    setValue(`items[${index}].good_code`, null);
                    setValue(`items[${index}].good_name`, '');
                    setValue(`items[${index}].good_unit`, '');
                  } else {
                    update(`items[${index}].good_code`, newValue);
                    update(`items[${index}].good_name`, newValue?.name);
                    update(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                    setValue(`items[${index}].good_code`, newValue);
                    setValue(`items[${index}].good_name`, newValue?.name);
                    setValue(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                    checkQuantityBeforeCreate(newValue?.id, index);
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option?.code} - {option?.name}
                  </li>
                )}
                getOptionLabel={(option) => option.code || ''}
                renderInput={(params) => (
                  <TextField {...params} size="small" label="Mã sản phẩm*" InputLabelProps={{ shrink: true }} />
                )}
              />

              <RHFTextField
                size="small"
                name={`items[${index}].good_name`}
                label="Tên sản phẩm"
                value={item.good_name}
                sx={{ maxWidth: { md: 200 } }}
                InputLabelProps={{ shrink: true }}
                disabled={isSuccess}
                inputProps={{
                  maxLength: 255,
                  readOnly: true,
                  disabled: true,
                }}
              />
              <RHFTextField
                size="small"
                name={`items[${index}].good_unit`}
                label="Đơn vị tính"
                value={item.good_unit}
                sx={{ maxWidth: { md: 120 } }}
                InputLabelProps={{ shrink: true }}
                disabled={isSuccess}
                inputProps={{
                  maxLength: 255,
                  readOnly: true,
                  disabled: true,
                }}
              />
              <RHFTextField
                size="small"
                name={`items[${index}].quantity`}
                label="Số lượng"
                disabled={isSuccess}
                type="number"
                onChange={(e) => {
                  clearTimeout(timer);
                  const newTimer = setTimeout(() => {
                    checkQuantityBeforeCreate(item?.good_code?.id, index);
                  }, 500);
                  setTimer(newTimer);

                  setValue(`items[${index}].quantity`, e.target.value ? e.target.value : 1);
                  if (item.good_code) addQuantity();
                }}
                sx={{ maxWidth: { md: 100 } }}
                InputLabelProps={{ shrink: true }}
              />
              {!isSuccess && (
                <IconButton
                  sx={{ maxWidth: { md: 120 } }}
                  aria-label="delete"
                  size="small"
                  color="error"
                  disabled={loadingBtnSave}
                  onClick={() => {
                    if (item && item.order_item_id) {
                      handleOpenConfirm(index, item);
                    } else {
                      remove(index);
                    }
                  }}
                >
                  <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
                </IconButton>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

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
    </Box>
  );
}
