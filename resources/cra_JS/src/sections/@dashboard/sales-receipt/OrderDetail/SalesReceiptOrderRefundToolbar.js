import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Stack, Button, Tooltip, IconButton, Typography, CircularProgress } from '@mui/material';

// hooks
import useResponsive from '../../../../hooks/useResponsive';
// components
import Iconify from '../../../../components/iconify';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

SalesReceiptOrderRefundToolbar.propTypes = {
  onCloseDetails: PropTypes.func,
};

export default function SalesReceiptOrderRefundToolbar({
  onCloseDetails,
  onSave,
  isEdit,
  title,
  loadingBtnSave,
  isSuccess,
}) {
  const isDesktop = useResponsive('up', 'sm');
  const isMobile = useResponsive('down', 'sm');

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
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

        <Typography variant="h5"> {isSuccess ? 'Chi tiết đơn trả' : title} </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexGrow={1}>
          {isDesktop && (
            <>
              {!isSuccess && (
                <Tooltip title={isEdit ? 'Duyệt' : 'Lưu'}>
                  <Button
                    color={'success'}
                    variant="contained"
                    size="small"
                    startIcon={
                      loadingBtnSave ? (
                        <CircularProgress style={{ color: 'white' }} size={24} />
                      ) : (
                        <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />
                      )
                    }
                    disabled={loadingBtnSave}
                    onClick={() => {
                      onSave();
                    }}
                  >
                    {isEdit ? 'Duyệt' : 'Lưu'}
                  </Button>
                </Tooltip>
              )}
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
            <>
              {!isSuccess && (
                <Tooltip title={'Lưu'}>
                  <Button
                    color="success"
                    variant="contained"
                    size="small"
                    startIcon={
                      loadingBtnSave ? (
                        <CircularProgress style={{ color: 'white' }} size={24} />
                      ) : (
                        <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />
                      )
                    }
                    disabled={loadingBtnSave}
                    onClick={() => {
                      onSave();
                    }}
                  >
                    Lưu
                  </Button>
                </Tooltip>
              )}
            </>
          )}
          <ConfirmDialog
            open={openConfirm}
            onClose={handleCloseConfirm}
            title="Xác Nhận"
            content={<>Bạn có chắc chắn muốn xác nhận phiếu xuất này?</>}
            action={
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  onSave('confirm');
                  handleCloseConfirm();
                }}
              >
                Xác Nhận
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
