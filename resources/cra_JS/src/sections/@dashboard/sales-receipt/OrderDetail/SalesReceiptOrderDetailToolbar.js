// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { CircularProgress, Tooltip } from '@mui/material';
// routes
import { Link as RouterLink } from 'react-router-dom';
import { dispatch } from '../../../../redux/store';
import { resetDataSaleReceipt } from '../../../../redux/slices/saleReceipt';
// utils
// components

import Iconify from '../../../../components/iconify';
import { STATUSES } from '../../../../utils/constant';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

export default function SalesReceiptOrderDetailToolbar({
  backLink,
  createDate,
  orderNumber,
  isEdit,
  loadingBtnSave,
  onSave,
  mode,
  handlePrint,
  status = null,
}) {
  const resetData = () => {
    dispatch(resetDataSaleReceipt());
  };

  const isDesktop = useResponsive('up', 'sm');

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: 2,
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} to={backLink} onClick={() => resetData()}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">
                {(mode === 'edit' || mode === 'add') && 'Đơn hàng'}
                {mode === 'confirm' && 'Duyệt đơn'}
                {mode === 'export' && 'Xác nhận xuất kho đơn'}
                {mode === 'payment' && 'Thanh toán đơn'}
                {(mode === 'success' || mode === 'view') && 'Thông tin đơn hàng'}
                &nbsp;
                {orderNumber}
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {createDate}
            </Typography>
          </Stack>
        </Stack>

        <Stack flexGrow={1} spacing={1.5} direction="row" alignItems="center" justifyContent="flex-end">
          {(mode === 'edit' || mode === 'add' || (mode === 'payment' && status !== STATUSES.success_payment)) && (
            <>
              <Tooltip title={isEdit ? 'Cập nhật' : 'Lưu'}>
                <Button
                  color={isEdit ? 'info' : 'success'}
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
                  onClick={() => (mode === 'payment' ? onSave('payment') : onSave())}
                >
                  {isEdit && mode === 'edit' ? 'Cập nhật' : 'Lưu'}
                </Button>
              </Tooltip>
              {isDesktop && (
                <Tooltip title="Đóng">
                  <Button
                    color="error"
                    variant="contained"
                    size="small"
                    to={backLink}
                    component={RouterLink}
                    startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                    onClick={() => resetData()}
                  >
                    Đóng
                  </Button>
                </Tooltip>
              )}
            </>
          )}
          {mode === 'confirm' && (
            <>
              <Tooltip title="Duyệt">
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
                    onSave(STATUSES.confirm_sale_receipt);
                  }}
                >
                  Duyệt
                </Button>
              </Tooltip>

              <Tooltip title="Từ chối">
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  startIcon={
                    loadingBtnSave ? (
                      <CircularProgress style={{ color: 'white' }} size={24} />
                    ) : (
                      <Iconify width="18" height="18" icon="eva:close-circle-fill" />
                    )
                  }
                  disabled={loadingBtnSave}
                  onClick={() => {
                    onSave(STATUSES.reject_sale_receipt);
                  }}
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}
          {mode === 'export' && (
            <>
              <Tooltip title="Xác nhận">
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
                    onSave(STATUSES.exported);
                  }}
                >
                  Xác nhận
                </Button>
              </Tooltip>
              {isDesktop && (
                <Tooltip title="Đóng">
                  <Button
                    color="error"
                    variant="contained"
                    size="small"
                    startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                    to={backLink}
                    component={RouterLink}
                    onClick={() => resetData()}
                  >
                    Đóng
                  </Button>
                </Tooltip>
              )}
            </>
          )}
          {mode === 'view' && (
            <>
              <Tooltip title="In phiếu">
                <Button
                  key={'btn3'}
                  size="small"
                  sx={{ mr: 1 }}
                  variant="contained"
                  onClick={() => handlePrint()}
                  disabled={loadingBtnSave}
                  startIcon={
                    loadingBtnSave ? (
                      <CircularProgress style={{ color: 'white' }} size={24} />
                    ) : (
                      <Iconify width="18" height="18" icon="mingcute:print-line" />
                    )
                  }
                >
                  In Phiếu
                </Button>
              </Tooltip>
              {isDesktop && (
                <Tooltip title="Đóng">
                  <Button
                    color="error"
                    variant="contained"
                    size="small"
                    startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                    to={backLink}
                    component={RouterLink}
                    onClick={() => resetData()}
                  >
                    Đóng
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
}
