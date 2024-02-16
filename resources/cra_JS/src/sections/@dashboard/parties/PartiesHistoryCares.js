import { useEffect, useState } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, TextField, InputAdornment, MenuItem, CircularProgress } from '@mui/material';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers';
// utils
import axios from '../../../utils/axios';
// components
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';

export default function PartiesHistoryCares({ triggerClickAdd, customerCareTypes, currentParties, refetchData }) {
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
      care_date: moment().format('YYYY-MM-DD'),
      customer_care_type_id: null,
      description: '',
      customer_care_id: '',
    });
  };

  const handleRemove = async () => {
    setOpenConfirm(false);
    if (itemRemove.item.customer_care_id) {
      setLoadingBtnSave(true);
      await axios.delete(`customer-care/${itemRemove.item.customer_care_id}`).then((response) => {
        remove(itemRemove.index);
        setLoadingBtnSave(false);
        enqueueSnackbar('Xóa thành công');
        setTimeout(() => {
          refetchData();
        }, 100)

      });

    }
  };

  const handleOpenConfirm = (key, data) => {
    if (data.customer_care_id) {
      setItemRemove({ index: key, item: data });
      setOpenConfirm(true);
    } else {
      remove(key);
    }

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
              <DatePicker
                size="small"
                label="Ngày chăm sóc"
                value={item.care_date}
                name={`items[${index}].care_date`}
                onChange={(newValue) => {
                  update(`items[${index}].care_date`, newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                  setValue(`items[${index}].care_date`, newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                  setCareDate(newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                }}
                renderInput={(params) => <TextField InputLabelProps={{ shrink: true }} sx={{ maxWidth: { md: 190 } }} {...params} size="small" fullWidth />}
              />
              <RHFAutocomplete
                sx={{ width: { md: 240 }, }}
                name={`items[${index}].customer_care_type_id`}
                autoHighlight
                options={customerCareTypes.map((option) => option)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  const ItemFilter = values.items.filter((customerCareType) => customerCareType?.id === newValue.id);
                  if (ItemFilter.length > 0) {
                    enqueueSnackbar('Hình thức chăm sóc', { variant: 'error' });
                    setValue(`items[${index}].customer_care_type_id`, null);
                    setValue(`items[${index}].name`, '');
                  } else {
                    setValue(`items[${index}].customer_care_type_id`, newValue);
                    setValue(`items[${index}].name`, newValue.code);
                  }
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option?.name}
                    </li>
                  );
                }}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Hình thức chăm sóc*"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />

              <RHFTextField
                size="small"
                name={`items[${index}].description`}
                label="Chú ý"
                onChange={e => {
                  setValue(`items[${index}].description`, e.target.value);
                }}
                sx={{ maxWidth: { md: 220 } }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  maxLength: 255,
                }}
              />
            </Stack>

            <Button
              size="small"
              color="error"
              startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'red' }} size={24} /> : <Iconify icon="eva:trash-2-outline" />}
              disabled={loadingBtnSave}
              onClick={() => { handleOpenConfirm(index, item) }}
            >
              Xóa
            </Button>
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
