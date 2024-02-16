import { useState } from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField, RHFCodes } from '../../components/hook-form';
import axios from '../../utils/axios';
import { useAuthContext } from '../../auth/useAuthContext';

// ----------------------------------------------------------------------

export default function AuthNewPasswordForm() {
  const { login } = useAuthContext();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRecovery = typeof window !== 'undefined' ? sessionStorage.getItem('email-recovery') : '';

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Vui lòng nhập mã'),
    code2: Yup.string().required('Vui lòng nhập mã'),
    code3: Yup.string().required('Vui lòng nhập mã'),
    code4: Yup.string().required('Vui lòng nhập mã'),
    code5: Yup.string().required('Vui lòng nhập mã'),
    code6: Yup.string().required('Vui lòng nhập mã'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    password: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
    confirm_password: Yup.string()
      .required('Vui lòng nhập xác nhận mật khẩu')
      .oneOf([Yup.ref('password'), null], 'Mật khẩu phải trùng khớp'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
    email: emailRecovery || '',
    password: '',
    confirm_password: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    const body = {
      otp: `${data?.code1}${data?.code2}${data?.code3}${data?.code4}${data?.code5}${data?.code6}`,
      email: data?.email,
      password: data?.password,
    };
    try {
      await axios.post('auth/reset-password', body);

      await login(data.email, data.password);

      enqueueSnackbar('Đổi mật khẩu thành công!');

      sessionStorage.removeItem('email-recovery');
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email" disabled={!!emailRecovery} InputLabelProps={{ shrink: true }} />

        <RHFCodes keyName="code" inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']} />

        {(!!errors.code1 || !!errors.code2 || !!errors.code3 || !!errors.code4 || !!errors.code5 || !!errors.code6) && (
          <FormHelperText error sx={{ px: 2 }}>
            Mã là bắt buộc
          </FormHelperText>
        )}

        <RHFTextField
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirm_password"
          label="Xác nhận mật khẩu mới"
          type={showConfirmPassword ? 'text' : 'password'}
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

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} sx={{ mt: 3 }}>
          Cập nhật mật khẩu
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
