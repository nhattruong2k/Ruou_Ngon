import { useState } from 'react';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Card, InputAdornment, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const [showOldPassword, setShowOldPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ChangePassWordSchema = Yup.object().shape({
    old_password: Yup.string().required('Vui lòng nhập mật khẩu cũ'),
    new_password: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu mới'),
    confirm_new_password: Yup.string().oneOf([Yup.ref('new_password'), null], 'Mật khẩu phải trùng khớp'),
  });

  const defaultValues = {
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (formData) => {
    await axios
      .post('update-password', formData)
      .then((response) => {
        enqueueSnackbar('Cập nhật mật khẩu thành công!');
      })
      .catch((error) => {
        setTimeout(() => {
          enqueueSnackbar(error.message, { variant: 'error' });
        }, 500);
      });
    reset();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Stack spacing={3} alignItems="flex-end" sx={{ p: 3 }}>
          <RHFTextField
            name="old_password"
            type={showOldPassword ? 'text' : 'password'}
            label="Mật khẩu cũ"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                    <Iconify icon={showOldPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="new_password"
            type={showNewPassword ? 'text' : 'password'}
            label="Mật khẩu mới"
            helperText={
              <Stack component="span" direction="row" alignItems="center">
                <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Mật khẩu phải tối thiểu 6 ký tự
              </Stack>
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="confirm_new_password"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Xác nhận mật khẩu mới"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Cập nhật mật khẩu
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
