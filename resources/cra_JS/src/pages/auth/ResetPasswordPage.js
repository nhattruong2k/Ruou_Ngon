import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthResetPasswordForm from '../../sections/auth/AuthResetPasswordForm';
// assets
import { PasswordIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Đặt lại mật khẩu | Rượu ngon</title>
      </Helmet>

      <PasswordIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        Bạn quên mật khẩu?
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        Vui lòng nhập địa chỉ email được liên kết với tài khoản của bạn và Chúng tôi sẽ gửi email cho bạn một liên kết
        để đặt lại mật khẩu của bạn.
      </Typography>

      <AuthResetPasswordForm />

      <Link
        to={PATH_AUTH.login}
        component={RouterLink}
        color="inherit"
        variant="subtitle2"
        sx={{
          mt: 3,
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
