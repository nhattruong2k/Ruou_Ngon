import PropTypes from 'prop-types';
// @mui
import { Stack, Button, Tooltip, IconButton } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

EmployeeTypeRightSideToolbar.propTypes = {
  onCloseDetails: PropTypes.func,
};

export default function EmployeeTypeRightSideToolbar({
  onCloseDetails,
}) {
  const isDesktop = useResponsive('up', 'sm');

  return (
    <>
      <Stack p={2.5} direction="row" alignItems="center">
        {!isDesktop && (
          <>
            <Tooltip title="Back">
              <IconButton onClick={onCloseDetails} sx={{ mr: 1 }}>
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexGrow={1}>
          <Tooltip title="Save this">
            <Button startIcon={<Iconify icon="akar-icons:chevron-down" width="18" height="18"/>} variant="outlined" size="small">
              Save
            </Button>
          </Tooltip>

          <Tooltip title="Cancel this">
            <Button color="error" startIcon={<Iconify icon="akar-icons:chevron-down" width="18" height="18"/>} variant="outlined" size="small">
              Cancel
            </Button>
          </Tooltip>

          <IconButton size="small">
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>
    </>
  );
}
