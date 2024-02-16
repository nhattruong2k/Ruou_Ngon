import PropTypes from 'prop-types';
import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils
import { stringDate } from '../../../../utils/formatTime';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { FUNCTIONS, STATUSES } from '../../../../utils/constant';

// ----------------------------------------------------------------------

ImportWarehouseTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  filterType: PropTypes.number,
};

export default function ImportWarehouseTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onViewRow,
  filterType,
  onConfirmRow,
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

  const handleDeleteRow = () => {
    onDeleteRow();
    handleCloseConfirm();
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
        <TableCell>{stringDate(row?.date)}</TableCell>
        <TableCell>{row?.warehouse?.name || ''}</TableCell>
        {(filterType === 3 || filterType === FUNCTIONS.import_refund) && <TableCell>{row?.order_reference?.code || ''}</TableCell>}
        {filterType === 3 && <TableCell>{row?.order_reference?.order_items[0]?.internal_org?.name || ''}</TableCell>}

        <TableCell>{row?.function?.name || ''}</TableCell>
        <TableCell align="right">{row?.total_quantity || ''}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              ((row?.order_status_id === 1 || row?.order_status_id === STATUSES.pending_sale_receipt) && 'warning') ||
              'success'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {row?.order_status?.name || ''}
          </Label>
        </TableCell>
        <TableCell>{row?.comment || ''}</TableCell>
        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        {row?.order_status_id !== STATUSES.refund_sale_receipt && (
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
        )}
        {(row?.order_status_id === STATUSES.pending_sale_receipt || row?.order_status_id === STATUSES.confirm_sale_receipt) && (
          <MenuItem
            onClick={() => {
              onConfirmRow();
              handleClosePopover();
            }}
          >
            {row?.order_status_id === STATUSES.confirm_sale_receipt &&
              <>
                <Iconify icon="eva:eye-outline" /> Duyệt
              </>
            }
            {row?.order_status_id === STATUSES.pending_sale_receipt &&
              <>
                <Iconify icon="eva:checkmark-square-outline" /> Duyệt
              </>
            }
          </MenuItem>
        )}
        {(row?.order_status_id !== STATUSES.pending_sale_receipt &&
          row?.order_status_id !== STATUSES.confirm_sale_receipt &&
          row?.order_status_id !== STATUSES.refund_sale_receipt) && (
            <MenuItem
              onClick={() => {
                onEditRow();
                handleClosePopover();
              }}
            >
              <Iconify icon="eva:edit-fill" />
              Sửa
            </MenuItem>
          )}
        {row?.order_status_id === STATUSES.refund_sale_receipt && (
          <MenuItem
            onClick={() => {
              onViewRow();
              handleClosePopover();
            }}
          >
            <Iconify icon="eva:eye-outline" />
            Chi tiết
          </MenuItem>
        )}
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content="Bạn có chắc chắn muốn xóa phiếu này?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRow}>
            Xóa
          </Button>
        }
      />
    </>
  );
}
