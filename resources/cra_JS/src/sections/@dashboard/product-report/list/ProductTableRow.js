import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { TableRow, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils

// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { currencyFormatter } from '../../../../utils/formatNumber';

ProductTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};

export default function ProductTableRow({ row, selected }) {
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
        <TableCell>{row?.internal_org_name || ''}</TableCell>
        <TableCell>{row?.category_name || ''}</TableCell>
        <TableCell>{row?.category_parent_name || ''}</TableCell>
        <TableCell>{row?.code || ''}</TableCell>
        <TableCell>{row?.name || ''}</TableCell>
        <TableCell align="right">
          <Typography>
            {row?.total_quantity || 0}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>
            {currencyFormatter(row?.total_price || '')}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
}
