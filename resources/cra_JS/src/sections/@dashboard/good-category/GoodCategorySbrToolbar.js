import PropTypes from 'prop-types';
// @mui
import { Stack, Button, Typography, Tooltip, IconButton, CircularProgress } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

GoodCategorySbrToolbar.propTypes = {
  onCloseDetails: PropTypes.func,
  onSave: PropTypes.func,
};

export default function GoodCategorySbrToolbar({ onCloseDetails, onSave, isEdit, title, loadingBtnSave }) {
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

        <Typography variant="subtitle1"> {title} </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexGrow={1}>
          {isDesktop && (
            <>
              <Tooltip title={isEdit ? 'Cập nhật' : 'Lưu'}>
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                  disabled={loadingBtnSave}
                  onClick={() => {
                    onSave();
                  }}
                >
                  {isEdit ? 'Cập nhật' : 'Lưu'}
                </Button>
              </Tooltip>
              <Tooltip title="Đóng">
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                  onClick={onCloseDetails}
                >
                  Đóng
                </Button>
              </Tooltip>
            </>
          )}

          {isMobile && (
            <Tooltip title={isEdit ? "Cập nhật" : 'Lưu'}>
              <Button
                color="success"
                variant="contained"
                size="small"
                startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                disabled={loadingBtnSave}
                onClick={() => {
                  onSave()
                }}
              >
                {isEdit ? 'Cập nhật' : 'Lưu'}
              </Button>
            </Tooltip>
          )}

        </Stack>
      </Stack>
    </>
  );
}