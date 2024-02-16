// @mui
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';
// routes
import { Link as RouterLink } from 'react-router-dom';
// utils
import { stringDateTime } from '../../../../utils/formatTime';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';


// ----------------------------------------------------------------------

export default function PaymentDetailsToolbar({
  backLink,
  currentPayment,
  isEdit,
  code,
  handleApproved,
  handledecline,
  handleSave,
  loadingSend
}) {

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ mb: 2 }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">
                {isEdit ? `Thanh toán #${currentPayment?.code || ''}` : `Tạo thanh toán #${code}`}
              </Typography>

            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              <Label
                sx={{ mr: 3 }}
                variant="soft"
                color={
                  (currentPayment?.payment_status_id === 1 && 'warning') ||
                  (currentPayment?.payment_status_id === 2 && 'success') ||
                  (currentPayment?.payment_status_id === 3 && 'error') ||
                  'warning'
                }
              >
                {
                  (currentPayment?.payment_status_id === 1 && 'Chờ duyệt') ||
                  (currentPayment?.payment_status_id === 2 && 'Đã duyệt') ||
                  (currentPayment?.payment_status_id === 3 && 'Từ chối') ||
                  'Tạo phiếu'
                }
              </Label>
              {stringDateTime(currentPayment?.date)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          {
            (currentPayment?.payment_status_id !== 2 && currentPayment?.payment_status_id !== 3)
            &&
            <LoadingButton loading={!isEdit ? loadingSend : false} onClick={() => currentPayment?.payment_status_id === 1 ? handleApproved() : handleSave()} color="success" variant="contained" startIcon={isEdit ? <Iconify icon="eva:checkmark-circle-2-fill" /> : <Iconify icon="eva:save-fill" />}>
              {isEdit ? 'Duyệt' : 'Lưu Thanh Toán'}
            </LoadingButton>
          }

          {(isEdit && currentPayment?.payment_status_id === 1) &&
            <Button onClick={() => handledecline()} color="error" variant="contained" startIcon={<Iconify icon="eva:close-circle-outline" />}>
              Từ chối
            </Button>
          }

        </Stack>


      </Stack>


    </>
  );
}
