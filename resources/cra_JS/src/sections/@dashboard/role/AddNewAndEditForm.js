import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

import CategorySbrToolbar from './SbrToolbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFMultiCheckbox } from '../../../components/hook-form';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------
export const JOB_BENEFIT_OPTIONS = [
  { value: 'Free parking', label: 'Free parking' },
  { value: 'Bonus commission', label: 'Bonus commission' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Device support', label: 'Device support' },
  { value: 'Health care', label: 'Health care' },
  { value: 'Training', label: 'Training' },
  { value: 'Health Insurance', label: 'Health Insurance' },
  { value: 'Retirement Plans', label: 'Retirement Plans' },
  { value: 'Paid Time Off', label: 'Paid Time Off' },
  { value: 'Flexible Work Schedule', label: 'Flexible Work Schedule' },
];
AddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPermistion: PropTypes.object,
};

export default function AddNewAndEditForm({ isEdit = false, onClose, currentPermistion, filterStatus, refetchData, permissions, screens }) {

  const refSubmitButtom = useRef();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newCategorySchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên vai trò'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPermistion?.name || '',
      permission: currentPermistion?.permistions?.map(item => item.id) || []
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

    try {
      if (isEdit) {
        await axios.put(`roles/${currentPermistion.id}`, formData);
      } else {
        await axios.post('roles', formData);
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
        title={isEdit ? 'Cập nhật vai trò' : 'Thêm vai trò'}
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
                <RHFTextField size="small" name="name" label="Tên vai trò*" />
                <Grid container spacing={0}>
                  {screens.map((row, index) => {

                    const filterPage = permissions
                      .filter((item) => item.screen_id === row.id)
                      .map((item) => ({
                        value: item.id,
                        label: item.name
                      }));
                    if (filterPage.length > 0) {
                      return (
                        <Grid key={`key${index}`} item xs={12} md={4} sx={{ borderRadius: 0, border: 0 }}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2">{row.name}</Typography>
                            <RHFMultiCheckbox
                              name="permission"
                              options={filterPage}
                              sx={{ width: 1 }}
                            />
                          </Stack>
                        </Grid>

                      )
                    }
                    return '';
                  }
                  )}
                </Grid>

              </Box>

              <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
                <button hidden={1} ref={refSubmitButtom} type={'submit'} />
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
