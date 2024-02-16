import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { TableRow, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils

// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { currencyFormatter } from '../../../../utils/formatNumber';

DebtsTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDetailRow: PropTypes.func,
};

export default function DebtsTableRow({ row, selected, onDetailRow }) {
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{row?.employee?.name || ''}</TableCell>
        <TableCell>{row?.code || ''}</TableCell>
        <TableCell>{row?.name || ''}</TableCell>
        <TableCell align="right">{row?.debt_limit ? currencyFormatter(row?.debt_limit.toString()) : 0}</TableCell>
        <TableCell align="right">{row?.remain_price ? currencyFormatter(row?.remain_price.toString()) : 0}</TableCell>
        <TableCell align="right">
          {row?.due_debt?.undue_debt ? currencyFormatter(row?.due_debt?.undue_debt.toString()) : 0}
        </TableCell>
        <TableCell align="right">
          <Typography sx={{ color: row?.due_debt?.overdue_debt > 0 ? 'red' : '#212B36' }}>
            {row?.due_debt?.overdue_debt ? currencyFormatter(row?.due_debt?.overdue_debt.toString()) : 0}
          </Typography>
        </TableCell>
        <TableCell align="right" sx={{ color: row?.due_debt?.doubtful_debt > 0 ? 'red' : '#212B36' }}>
          {row?.due_debt?.doubtful_debt ? currencyFormatter(row?.due_debt?.doubtful_debt.toString()) : 0}
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

        <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
          <MenuItem
            onClick={() => {
              onDetailRow();
              handleClosePopover();
            }}
          >
            <Iconify icon="eva:eye-outline" />
            Chi tiết
          </MenuItem>
        </MenuPopover>
      </TableRow>
    </>
  );
}
