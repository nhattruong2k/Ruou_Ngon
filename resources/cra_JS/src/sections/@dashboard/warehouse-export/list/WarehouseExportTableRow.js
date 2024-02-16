import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import Label from "../../../../components/label";

// ----------------------------------------------------------------------

WarehouseExportTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  isExportTransfer: PropTypes.bool,
};

export default function WarehouseExportTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, onViewRow, isExportTransfer }) {

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

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

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ width: 180 }}>{row?.code || ''}</TableCell>
        <TableCell sx={{ width: 140 }}>{row?.date || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.warehouse?.name || ''}</TableCell>
        {
          isExportTransfer &&
          <>
            <TableCell sx={{ width: 180 }}>{row?.order_child_reference?.order_items[0]?.internal_org?.name || ''}</TableCell>
          </>
        }
        <TableCell sx={{ width: 140 }}>{row?.function?.name || ''}</TableCell>
        <TableCell sx={{ width: 140 }}>
          <Label
            variant="soft"
            color={
              (row?.order_status_id === 1 && 'warning')
              || (row?.order_status_id === 2 && 'success')
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {row?.order_status?.name || ''}
          </Label>
        </TableCell>
        <TableCell sx={{ width: 180 }}>{row?.employee?.name || ''}</TableCell>
        <TableCell sx={{ width: 120 }} align="right">{row?.total_quantity || ''}</TableCell>
        <TableCell>{row?.comment || ''}</TableCell>

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
