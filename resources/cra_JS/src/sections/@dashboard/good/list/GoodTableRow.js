import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Avatar, Link, ListItemText, Box, Typography } from '@mui/material';
// utils
import { currencyFormatter } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { HOST_ASSETS_URL } from '../../../../config';
// ----------------------------------------------------------------------

GoodTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function GoodTableRow(
  { row,
    selected,
    onSelectRow,
    onDeleteRow,
    onEditRow,
    onViewRow,
    tableActiveRow
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

  const handleShowColumn = (column) => {
    const data = tableActiveRow.find((item) => item.id === column);
    return data?.hide || false;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell className={handleShowColumn('name') ? 'table-cell-hide' : ''} sx={{ display: 'flex', alignItems: 'center' }}  >
          <Avatar
            alt={row?.name || ''}
            src={`${HOST_ASSETS_URL}storage/__good_photos__/${row?.photo}`}
            variant="rounded"
            sx={{ width: 64, height: 64, mr: 2 }}
          />

          <ListItemText
            disableTypography
            primary={
              <Typography
                noWrap
                color="inherit"
                variant="subtitle2"
              >
                {row?.name || ''}
              </Typography>
            }
            secondary={
              <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
                {row?.good_category?.name || ''}
              </Box>
            }
          />
        </TableCell>


        <TableCell className={handleShowColumn('code') ? 'table-cell-hide' : ''}>{row?.code || ''}</TableCell>
        <TableCell className={handleShowColumn('good_category') ? 'table-cell-hide' : ''}>{row?.good_category?.name || ''}</TableCell>
        <TableCell className={handleShowColumn('unit_of_measure') ? 'table-cell-hide' : ''}>{row?.unit_of_measure?.name || ''}</TableCell>
        <TableCell className={handleShowColumn('producer') ? 'table-cell-hide' : ''}>{row?.producer || ''}</TableCell>
        <TableCell className={handleShowColumn('product_area') ? 'table-cell-hide' : ''}>{row?.product_area || ''}</TableCell>
        <TableCell className={handleShowColumn('origin') ? 'table-cell-hide' : ''}>{row?.origin || ''}</TableCell>
        <TableCell className={handleShowColumn('apllelation') ? 'table-cell-hide' : ''}>{row?.apllelation || ''}</TableCell>
        <TableCell className={handleShowColumn('season') ? 'table-cell-hide' : ''}>{row?.season || ''}</TableCell>
        <TableCell className={handleShowColumn('grape') ? 'table-cell-hide' : ''}>{row?.grape || ''}</TableCell>
        <TableCell className={handleShowColumn('volume') ? 'table-cell-hide' : ''} align="right">{row?.volume || ''}</TableCell>
        <TableCell className={handleShowColumn('alcohol_level') ? 'table-cell-hide' : ''} align="right">{row?.alcohol_level || ''}</TableCell>
        <TableCell className={handleShowColumn('price') ? 'table-cell-hide' : ''} align="right">{currencyFormatter(row?.price || 0)}</TableCell>
        <TableCell className={handleShowColumn('max_discount_rate') ? 'table-cell-hide' : ''} align="right">{row?.max_discount_rate || ''}</TableCell>

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
