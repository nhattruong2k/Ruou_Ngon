import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Container, Tab, Tabs, Box } from '@mui/material';
// routes
// _mock_
// components
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
// sections
import ChangePasswordForm from '../../sections/auth/ChangePasswordForm';

// ----------------------------------------------------------------------

export default function UserAccountPage() {
  const { themeStretch } = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('change_password');

  const TABS = [
    {
      value: 'change_password',
      label: 'Đổi mật khẩu',
      icon: <Iconify icon="ic:round-vpn-key" />,
      component: <ChangePasswordForm />,
    },
  ];

  return (
    <>
      <Helmet>
        <title> Tài khoản | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs heading="Tài khoản" links={[{ name: 'Người dùng', href: '#' }, { name: 'Đổi mật khẩu' }]} />

        <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>

        {TABS.map(
          (tab) =>
            tab.value === currentTab && (
              <Box key={tab.value} sx={{ mt: 5 }}>
                {tab.component}
              </Box>
            )
        )}
      </Container>
    </>
  );
}
