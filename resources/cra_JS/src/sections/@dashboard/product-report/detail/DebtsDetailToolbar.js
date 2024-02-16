// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';
// routes
import { Link as RouterLink } from 'react-router-dom';
// utils
// components

import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

export default function DebtsDetailToolbar({ backLink, partyName }) {
  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} to={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">{`Chi tiết công nợ khách hàng : ${partyName}`}</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack flexGrow={1} spacing={1.5} direction="row" alignItems="center" justifyContent="flex-end">
          <Tooltip title="Đóng">
            <Button
              color="error"
              variant="contained"
              size="small"
              startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
              to={backLink}
              component={RouterLink}
            >
              Đóng
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
}
