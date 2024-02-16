import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthNewPasswordForm from '../../sections/auth/AuthNewPasswordForm';
// assets
import { SentIcon } from '../../assets/icons';
import axios from '../../utils/axios';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);

  const resendCode = async () => {
    setIsLoading(true);
    try {
      await axios.post('auth/verify-email-reset-password', { email: sessionStorage.getItem('email-recovery') });
      enqueueSnackbar('Đã gửi mã xác thực');
      setIsLoading(false);
    } catch (error) {
      setTimeout(() => {
        enqueueSnackbar(error.message, { variant: 'error' });
      }, 500);
    }
  };
  return (
    <>
      <Helmet>
        <title> Mật khẩu mới | Rượu ngon</title>
      </Helmet>

      <SentIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        Yêu cầu được gửi thành công!
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        Chúng tôi đã gửi email xác nhận gồm 6 chữ số đến email của bạn.
        <br />
        Vui lòng nhập mã vào ô bên dưới để xác minh email của bạn.
      </Typography>

      <AuthNewPasswordForm />

      <Typography variant="body2" sx={{ my: 3 }}>
        Bạn không có mã? &nbsp;
        <Link component="button" variant="subtitle2" disabled={isLoading} onClick={resendCode}>
          Gửi lại mã
        </Link>
      </Typography>

      <Link
        to={PATH_AUTH.login}
        component={RouterLink}
        color="inherit"
        variant="subtitle2"
        sx={{
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        Quay lại trang đăng nhập
      </Link>
    </>
  );
}
