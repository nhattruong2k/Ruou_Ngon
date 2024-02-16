import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, TextField } from '@mui/material';

import CategorySbrToolbar from './SbrToolbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

AddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPermistion: PropTypes.object,
};

export default function AddNewAndEditForm({ isEdit = false, onClose, currentPermistion, filterStatus, refetchData, screens }) {

  const refSubmitButtom = useRef();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newCategorySchema = Yup.object().shape({
    name: Yup.string().required('Nhập mã quyền'),
    screen_id: Yup.object().required('Chọn trang').nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPermistion?.name || '',
      note: currentPermistion?.note || '',
      screen_id: currentPermistion?.screen || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPermistion]
  );

  const methods = useForm({
    resolver: yupResolver(newCategorySchema),
    defaultValues,
  });


  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting },
    formState: { errors },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPermistion]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const newFormData = {
      name: formData.name,
      screen_id: formData.screen_id.id,
      note: formData.note,
    }
    try {
      if (isEdit) {
        await axios.put(`permistions/${currentPermistion.id}`, newFormData);
      } else {
        await axios.post('permistions', newFormData);
        reset();
      }

      enqueueSnackbar(!isEdit ? 'Tạo mới thành công!' : 'Cập nhật thành công!');
      refetchData();
      setLoadingBtnSave(false);
    } catch (error) {
      setLoadingBtnSave(false);
      if (error.code === 422) {
        const responseErrors = Object.entries(error.data);
        responseErrors.forEach((item) => {
          setTimeout(() => {
            enqueueSnackbar(item[1], { variant: 'error' });
          }, 500);
        });
      }
    }
  };

  return (
    <>
      <CategorySbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật quyền' : 'Thêm quyền'}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>

          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ p: 3, borderRadius: 0, border: 0, boxShadow: 'none' }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                }}
              >
                <RHFTextField size="small" name="name" label="Mã quyền*" />
                <RHFAutocomplete
                  name="screen_id"
                  autoHighlight
                  size="small"
                  sx={{ width: '100%' }}
                  options={screens.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('screen_id', newValue);
                    clearErrors(['screen_id']);
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) =>
                    <TextField
                      error={Boolean(errors.screen_id)}
                      helperText={errors.screen_id?.message}
                      {...params} fullWidth size="small" label="Thuộc trang*" />}
                />
                <RHFTextField name="note" label="Ghi chú" size="small" fullWidth />
                <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
                  <button hidden={1} ref={refSubmitButtom} type={'submit'} />
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
