import PropTypes from 'prop-types';
import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import {
  Stack,
  Button,
  TableRow,
  Checkbox,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import axios from '../../../../utils/axios';
// utils
import { useSnackbar } from '../../../../components/snackbar';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { FOLDER_IMAGE } from '../../../../utils/constant';
// ----------------------------------------------------------------------

PartyTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function PartyTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, onViewRow }) {
  const { enqueueSnackbar } = useSnackbar();

  const [openConfirm, setOpenConfirm] = useState(false);

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
    axios
      .get(`download-file/${fileUrl}/${FOLDER_IMAGE.party_attachment}`, {
        method: 'GET',
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${row.name}_${fileUrl}`);
        document.body.appendChild(link);
        link.click();
        setLoadingAttachment(false);
      })
      .catch((error) => {
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

        <TableCell>{row?.name || ''}</TableCell>
        <TableCell>{row?.code || ''}</TableCell>
        <TableCell>{row?.party_type?.name || ''}</TableCell>
        <TableCell>{row?.phone || ''}</TableCell>
        <TableCell>{row?.address || ''}</TableCell>
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
          <Iconify icon="eva:edit-fill" />
          Sửa
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
