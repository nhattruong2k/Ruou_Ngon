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

export default function RefundDetailsToolbar({
  backLink,
  orderRefunds,
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
          <IconButton href={backLink} >
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4">
                {isEdit ? `Duyệt trả hàng #${orderRefunds?.code || ''}` : `Tạo phiếu trả hàng`}
              </Typography>

            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              <Label
                sx={{ mr: 3 }}
                variant="soft"
                color={
                  (orderRefunds?.order_status_id === 5 && 'warning') ||
                  (orderRefunds?.order_status_id === 6 && 'success') ||
                  'warning'
                }
              >
                {
                  (orderRefunds?.order_status_id === 5 && 'Chờ duyệt') ||
                  (orderRefunds?.order_status_id === 6 && 'Đã duyệt') ||
                  'Tạo phiếu'
                }
              </Label>
            </Typography>
          </Stack>
        </Stack>

        {
          (!isEdit || orderRefunds?.order_status_id === 5) &&
          <Stack
            flexGrow={1}
            spacing={1.5}
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
          >

            <LoadingButton loading={!isEdit ? loadingSend : false} onClick={() => orderRefunds?.order_status_id ? handleApproved() : handleSave()} color="success" variant="contained" startIcon={isEdit ? <Iconify icon="eva:checkmark-circle-2-fill" /> : <Iconify icon="eva:save-fill" />}>
              {isEdit ? 'Duyệt' : 'Lưu phiếu'}
            </LoadingButton>

          </Stack>
        }



      </Stack>


    </>
  );
}
