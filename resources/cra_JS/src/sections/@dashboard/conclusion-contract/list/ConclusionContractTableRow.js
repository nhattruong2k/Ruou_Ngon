import PropTypes from 'prop-types';
import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils
import moment from 'moment';
import { currencyFormatter } from '../../../../utils/formatNumber';
import { STATUSES } from '../../../../utils/constant';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

ConclusionContractTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function ConclusionContractTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, onViewRow, onConfirmRow, }) {

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const CLUSION_CONTRACT = [
    { id: 1, label: 'Hợp đồng sản phẩm', value: 1 },
    { id: 2, label: 'Hợp đồng du lịch', value: 2 }
  ]

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
        <TableCell>{row?.party?.name}</TableCell>
        <TableCell>{row?.party?.code}</TableCell>
        <TableCell>
          {CLUSION_CONTRACT?.find(item => item.id === row?.type_id)?.label}
        </TableCell>
        <TableCell>{moment(row?.date).format('DD/MM/YYYY') || ''}</TableCell>
        <TableCell>{row?.finish_day ? moment(row?.finish_day).format('DD/MM/YYYY') : ''}</TableCell>
        <TableCell>{row?.code}</TableCell>
        <TableCell align="right">{row?.amount ? currencyFormatter(row?.amount.toString()) : 0}</TableCell>
        <TableCell>{row?.comment}</TableCell>
        <TableCell sx={{ width: 180 }}>
          <Label variant="soft" color={row.status_id === 1 ? 'warning' : 'success'} sx={{ textTransform: 'capitalize' }}>
            {row.status_id === 1 ? 'Chờ duyệt' : 'Đã duyệt'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        {(row.status_id === STATUSES.pending) && (
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
                handleClosePopover();
                onEditRow();
              }}
            >
              <Iconify icon="eva:edit-fill" />
              Sửa
            </MenuItem>
          </>
        )}

        {row.status_id === STATUSES.pending && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onConfirmRow();
            }}
          >
            <Iconify icon="eva:checkmark-square-outline" />
            Xét Duyệt
          </MenuItem>
        )}
        {row.status_id === STATUSES.confirm && (
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
                handleClosePopover();
                onViewRow();
              }}
            >
              <Iconify icon="eva:eye-outline" />
              Xem Chi tiết
            </MenuItem>
          </>
        )}
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