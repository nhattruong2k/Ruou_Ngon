import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, Checkbox, TextField } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import SbrToolbar from './SbrToolbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import axios from '../../../utils/axios';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

AddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPermistion: PropTypes.object,
};

export default function AddNewAndEditForm({ isEdit = false, onClose, currentPermistion, users, refetchData, roles }) {
  const refSubmitButtom = useRef();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newCategorySchema = Yup.object().shape({
    employee: Yup.array().min(1, 'Chọn tài khoản').nullable(true),
    role: Yup.array().min(1, 'Chọn vai trò').nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      employee: currentPermistion ? [currentPermistion] : [],
      role: currentPermistion?.roles || [],
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

    const newFormDate = {
      employees: formData.employee.map(({ id }) => id),
      roles: formData.role.map(({ id }) => id),
    }

    try {
      if (isEdit) {
        await axios.put(`users/${currentPermistion.id}`, newFormDate);
      } else {
        await axios.post('users', newFormDate);
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
      <SbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={'Cấp quyền cho tài khoản'}
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
                <RHFAutocomplete
                  name="employee"
                  multiple
                  options={users.map((option) => option)}
                  size="small"
                  disableCloseOnSelect
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setValue('employee', newValue);
                    clearErrors(['employee'])
                  }}
                  renderInput={(params) => <TextField
                    error={Boolean(errors.employee)}
                    helperText={errors.employee?.message}
                    {...params} fullWidth size="small" label="Chọn tài khoản*" />}
                />
                <RHFAutocomplete
                  name="role"
                  multiple
                  disableCloseOnSelect
                  options={roles.map((option) => option)}
                  size="small"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setValue('role', newValue);
                    clearErrors(['role'])
                  }}
                  renderInput={(params) => <TextField
                    error={Boolean(errors.role)}
                    helperText={errors.role?.message}
                    {...params} fullWidth size="small" label="Chọn vai trò*" />}
                />
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
