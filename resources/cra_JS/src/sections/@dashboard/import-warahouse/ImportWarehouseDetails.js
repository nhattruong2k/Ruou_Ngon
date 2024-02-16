import { useEffect, useState } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, TextField, InputAdornment, MenuItem, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers';
// utils
import axios from '../../../utils/axios';
// components
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';

export default function ImportWarehouseDetails({ triggerClickAdd, currentOrder, goods, addQuantity, functionItem }) {
  const { control, setValue, watch, resetField } = useFormContext();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const [itemRemove, setItemRemove] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const [careDate, setCareDate] = useState(null);

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
      stt: '',
      good_id: null,
      code: '',
      unit: '',
      quantity: 1,
    });
  };

  const handleRemove = () => {
    let ids = [];
    if (values.delete_ids) ids = values.delete_ids;
    ids.push(itemRemove.item.order_item_id);
    setValue('delete_ids', ids);
    remove(itemRemove.index);
    setOpenConfirm(false);
  };

  const removeNow = (index) => {
    remove(index);
  }

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

  return (
    <Box sx={{ p: 1, pt: 3 }}>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ width: 1 }}>

              <RHFAutocomplete
                disabled={functionItem?.id === 3 ? true : false || false}
                sx={{ width: { md: '100%' }, }}
                name={`items[${index}].good_id`}
                autoHighlight
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
                  addQuantity();
                  const ItemFilter = values.items.filter((good) => good?.good_id?.id === newValue.id);
                  if (ItemFilter.length > 0) {
                    enqueueSnackbar('Sản phẩm này đã tồn tại', { variant: 'error' });
                    if (item?.order_item_id === '') {
                      setValue(`items[${index}].good_id`, null);
                      setValue(`items[${index}].code`, '');
                      setValue(`items[${index}].unit`, '');
                    }
                  } else {
                    setValue(`items[${index}].good_id`, newValue);
                    setValue(`items[${index}].name`, newValue?.name || '');
                    setValue(`items[${index}].unit`, newValue?.unit_of_measure?.name || '');
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Mã sản phẩm*"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <RHFTextField
                size="small"
                name={`items[${index}].name`}
                label="Tên sản phẩm"
                onChange={e => {
                  setValue(`items[${index}].name`, e.target.value);
                }}
                disabled
                sx={{ maxWidth: { md: 120 } }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  maxLength: 255,
                }}
              />
              <RHFTextField
                size="small"
                name={`items[${index}].unit`}
                label="Đơn vị tính"
                onChange={e => {
                  setValue(`items[${index}].unit`, e.target.value);
                }}
                disabled
                sx={{ maxWidth: { md: 120 } }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  maxLength: 255,
                }}
              />
              <RHFTextField
                size="small"
                name={`items[${index}].quantity`}
                label="Số lượng"
                onChange={e => {
                  setValue(`items[${index}].quantity`, e.target.value ? e.target.value : 1);
                  addQuantity();
                }}
                sx={{ maxWidth: { md: 220 } }}
                InputLabelProps={{ shrink: true }}
                type="number"
                inputProps={{
                  maxLength: 255,
                  min: 1
                }}
                disabled={functionItem?.id === 3 ? true : false || false}
              />
              {
                (functionItem?.id !== 3 && (currentOrder?.order_status_id || 1) === 1) &&
                <IconButton aria-label="delete" onClick={() => {
                  if (item && item.order_item_id) {
                    handleOpenConfirm(index, item);
                  } else {
                    removeNow(index);
                  }
                }}>
                  <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
                </IconButton>
              }

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
