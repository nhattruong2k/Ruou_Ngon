import PropTypes from 'prop-types';
import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import {
  Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography, CircularProgress,
  Tooltip,
} from '@mui/material';
import axios from '../../../../utils/axios';
// utils
import { stringDate } from '../../../../utils/formatTime';
import { currencyFormatter } from '../../../../utils/formatNumber';
import { useSnackbar } from '../../../../components/snackbar';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { FOLDER_IMAGE } from '../../../../utils/constant';
// ----------------------------------------------------------------------

PaymentTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function PaymentTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, onViewRow }) {
  const [openConfirm, setOpenConfirm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState(null);

  const [loadingAttachment, setLoadingAttachment] = useState(false);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };


  const downloadFile = (fileUrl, thisButton) => {
    setLoadingAttachment(true);

    axios.get(`download-file/${fileUrl}/${FOLDER_IMAGE.payment_attachment}`, {
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${row.code}_${fileUrl}`);
        document.body.appendChild(link);
        link.click();
        setLoadingAttachment(false);
      }).catch((error) => {
        setLoadingAttachment(false);
        enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
      });
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
            {row?.code || ''}
          </Typography>
        </TableCell>
        <TableCell>{stringDate(row?.date) || ''}</TableCell>
        <TableCell>{row?.party?.name || ''}</TableCell>
        <TableCell>{row?.party?.code || ''}</TableCell>
        <TableCell>{row?.user?.name || ''}</TableCell>
        <TableCell align="right">{currencyFormatter(row?.total_amount || 0)}</TableCell>
        {/* <TableCell>{row?.attachment}</TableCell> */}
        <TableCell>
          {row?.attachment &&
            <Tooltip title={`Tải file đính kém ${row?.attachment}`}>
              <IconButton
                // disabled={loadingAttachment}
                color="primary"
                onClick={() => {
                  downloadFile(row?.attachment || '', `buttonLoading_${row.id}`);
                }}
              >

                {loadingAttachment ? <CircularProgress style={{ color: 'red' }} size={20} /> : <Iconify icon="eva:download-outline" />}
              </IconButton>
            </Tooltip>
          }
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (row?.payment_status_id === 1 && 'warning') || (row?.payment_status_id === 2 && 'success') || 'error'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {(row?.payment_status_id === 1 && 'Chờ Duyệt') || (row?.payment_status_id === 2 && 'Đã duyệt') || 'Từ chối'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Xóa
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          {row?.payment_status_id === 1 && (
            <>
              <Iconify icon="eva:edit-fill" />
              Xét duyệt
            </>
          )}
          {row?.payment_status_id !== 1 && (
            <>
              <Iconify icon="eva:eye-outline" />
              Chi tiết
            </>
          )}
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content="Bạn có chắc chắn muốn xóa?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Xóa
          </Button>
        }
      />
    </>
  );
}
