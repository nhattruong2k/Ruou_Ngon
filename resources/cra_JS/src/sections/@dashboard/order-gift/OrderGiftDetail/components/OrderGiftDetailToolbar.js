// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { CircularProgress, Tooltip } from '@mui/material';
// routes
import { Link as RouterLink } from 'react-router-dom';
// utils
// components

import Iconify from '../../../../../components/iconify';
import { STATUSES } from '../../../../../utils/constant';
import useResponsive from '../../../../../hooks/useResponsive';
// ----------------------------------------------------------------------

export default function OrderGiftDetailToolbar({
  backLink,
  createDate,
  orderNumber,
  isEdit = null,
  loadingBtnSave = null,
  onSave,
  mode,
}) {

  const isDesktop = useResponsive('up', 'sm');

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
              <Typography variant="h4">
                {(mode === 'edit' || mode === 'add') && 'Đơn hàng tặng'}
                {mode === 'export' && 'Xác nhận xuất kho đơn'}
                {mode === 'view' && 'Thông tin đơn hàng tặng'}
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
          {(mode === 'edit' || mode === 'add') && (
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
                  onClick={() => onSave()}
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
                  >
                    Đóng
                  </Button>
                </Tooltip>
              )}
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
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
}
