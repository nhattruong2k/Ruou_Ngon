import { Link as RouterLink, useLocation } from 'react-router-dom';
// @mui
import { Box, Grid, Link, Stack, Divider, Container, Typography, IconButton } from '@mui/material';
// routes
import { PATH_PAGE } from '../../routes/paths';
// _mock
import { _socials } from '../../_mock/arrays';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import { useSettingsContext } from '../../components/settings';
// config
import { HEADER, NAV } from '../../config';
// ----------------------------------------------------------------------

const LINKS = [
  {
    headline: 'Minimal',
    children: [
      { name: 'About us', href: PATH_PAGE.about },
      { name: 'Contact us', href: PATH_PAGE.contact },
      { name: 'FAQs', href: PATH_PAGE.faqs },
    ],
  },
  {
    headline: 'Legal',
    children: [
      { name: 'Terms and Condition', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
  },
  {
    headline: 'Contact',
    children: [
      { name: 'support@minimals.cc', href: '#' },
      { name: 'Los Angeles, 359  Hidden Valley Road', href: '#' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function Footer() {
  const { pathname } = useLocation();

  const isHome = pathname === '/';

  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');


  const simpleFooter = (
    <Box
      component="footer"
      sx={{

        pb: 2,
        textAlign: 'center',
        // position: 'relative',
        bgcolor: 'background.default',
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          float: 'right',
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
      }}
    >
      <Container>
        <Typography variant="caption" component="div">
          Copyright © 2023 Công ty TNHH Rượu Ngon
          <br /> Developed by
          <Link href="https://odinbi.com/"> Odinbi </Link>
          Corporation &nbsp;
        </Typography>
      </Container>
    </Box>
  );

  return simpleFooter;
}
