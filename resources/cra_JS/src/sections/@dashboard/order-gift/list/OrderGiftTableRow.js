import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Button, TableRow, Checkbox, MenuItem, TableCell, IconButton } from '@mui/material';
// utils
import { currencyFormatter } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { STATUSES } from '../../../../utils/constant';

// ----------------------------------------------------------------------

OrderGiftTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function OrderGiftTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onExportRow,
  onViewRow,
}) {
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

        <TableCell sx={{ width: 250 }}>{row?.code || ''}</TableCell>
        <TableCell sx={{ width: 250 }}>{row?.date || ''}</TableCell>
        <TableCell sx={{ width: 250 }}>{row?.party?.code || ''}</TableCell>
        <TableCell sx={{ width: 250 }}>{row?.party?.name || ''}</TableCell>
        <TableCell sx={{ width: 250 }}>{row?.employee?.name || ''}</TableCell>
        <TableCell sx={{ width: 150 }} align="right">
          {row?.total_price_gift ? currencyFormatter(row?.total_price_gift.toString()) : 0}
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        {row.order_status_id !== STATUSES.exported && (
          <>
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
              }}
            >
              <Iconify icon="eva:edit-fill" />
              Sửa
            </MenuItem>
          </>
        )}

        {row.order_status_id === STATUSES.created_sale_receipt && (
          <MenuItem
            onClick={() => {
              onExportRow();
            }}
          >
            <Iconify icon="mdi:home-export-outline" />
            Xuất kho
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onViewRow();
          }}
        >
          <Iconify icon="eva:eye-outline" />
          Chi tiết
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
