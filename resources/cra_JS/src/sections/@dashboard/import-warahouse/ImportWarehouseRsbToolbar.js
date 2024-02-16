import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import { Stack, Button, Typography, Tooltip, IconButton, CircularProgress } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';

import ConfirmDialog from '../../../components/confirm-dialog';
// ----------------------------------------------------------------------

ImportWarehouseRsbToolbar.propTypes = {
  onCloseDetails: PropTypes.func,
};

export default function ImportWarehouseRsbToolbar({ onCloseDetails, isEdit, onSave, title, loadingBtnSave, currentOrder, loadingBtnConfirm }) {
  const isDesktop = useResponsive('up', 'sm');
  const isMobile = useResponsive('down', 'sm');
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };
  const StatusConfirm = () => {
    onSave('confirm');
    setOpenConfirm(false);
  };
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
          {
            (currentOrder?.order_status_id === 1 && isEdit) &&

            <Tooltip title="Xác nhận">
              <Button
                color="success"
                sx={isMobile && ({ height: '39px' })}
                variant="contained"
                size="small"
                startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                disabled={loadingBtnSave}
                onClick={() => {
                  handleOpenConfirm();
                }}
              >
                Xác nhận
              </Button>
            </Tooltip>
          }
          {((isDesktop || isMobile) && currentOrder?.order_status_id !== 2) && (
            <>
              <Tooltip title={isEdit ? 'Cập nhật' : 'Lưu'}>
                <Button
                  color="info"
                  variant="contained"
                  sx={isMobile && isEdit && ({ height: '39px' })}
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
            </>
          )}
          {
            (isDesktop) && (
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
            )
          }
        </Stack>
      </Stack>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xác nhận"
        content="Bạn có chắc chắn muốn xác nhận phiếu này?"
        action={
          <Button variant="contained" color="success" onClick={() => StatusConfirm()}>
            Xác nhận
          </Button>
        }
      />
    </>
  );
}
