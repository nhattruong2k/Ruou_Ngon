import PropTypes from 'prop-types';
// @mui
import { Stack, Button, Tooltip, IconButton, Typography } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

UserPermistionRsb.propTypes = {
  onCloseDetails: PropTypes.func,
};

export default function UserPermistionRsb({ onCloseDetails }) {
  const isDesktop = useResponsive('up', 'sm');
  const isMobile = useResponsive('down', 'sm');

  return (
    <>
      <Stack p={2.5} direction="row" alignItems="center">
        <>
          <Tooltip title="Back">
            <IconButton onClick={onCloseDetails} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        </>

        <Typography variant="subtitle1"> Phân role user </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexGrow={1}>
          {isDesktop && (
            <>
              <Tooltip title="Save this">
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                  onClick={() => {}}
                >
                  Save
                </Button>
              </Tooltip>
              <Tooltip title="Cancel this">
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                  onClick={onCloseDetails}
                >
                  Cancel
                </Button>
              </Tooltip>
            </>
          )}

          {isMobile && (
            <>
              <Tooltip title="Save this">
              <iconify-icon icon="ion:save-outline"><></></iconify-icon>
              </Tooltip>
            </>
          )}

          <IconButton size="small">
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>
    </>
  );
}
