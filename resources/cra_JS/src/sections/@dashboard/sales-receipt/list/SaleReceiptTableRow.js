import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
// utils
import { currencyFormatter } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import Label from '../../../../components/label';
import { STATUSES } from '../../../../utils/constant';
// import PrintPage from '../OrderDetail/PrintPage';
import axios from '../../../../utils/axios';

// ----------------------------------------------------------------------

SaleReceiptTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  isExportTransfer: PropTypes.bool,
};

export default function SaleReceiptTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onConfirmRow,
  onExportRow,
  onPaymentRow,
  onViewRow,
  onRefundRow,
  setLoadingPrint,
  setDataPrint,
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

  const handlePrint = async (id) => {
    setLoadingPrint(true);
    await axios.post('get-sale-receipt-by-id', { id }).then((response) => {
      setDataPrint(response?.data?.data);
    });
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ width: 180 }}>{row?.code || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.date || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.party?.code || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.party?.name || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.party?.party_type?.name || ''}</TableCell>
        <TableCell sx={{ width: 180 }}>{row?.employee?.name || ''}</TableCell>
        <TableCell sx={{ width: 180 }} align="right">
          {row?.total_price ? currencyFormatter(row?.total_price.toString()) : 0}
        </TableCell>
        <TableCell sx={{ width: 180 }}>
          <Label variant="soft" color="info" sx={{ textTransform: 'capitalize' }}>
            {row?.order_status?.name || ''}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        {(row.order_status_id === STATUSES.created_sale_receipt ||
          row.order_status_id === STATUSES.pending_sale_receipt) && (
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

        {(row.order_status_id === STATUSES.created_sale_receipt ||
          row.order_status_id === STATUSES.pending_sale_receipt ||
          row.order_status_id === STATUSES.reject_sale_receipt) && (
          <MenuItem
            onClick={() => {
              onEditRow();
            }}
          >
            <Iconify icon="eva:edit-fill" />
            Sửa
          </MenuItem>
        )}

        {row.order_status.id === STATUSES.pending_sale_receipt && (
          <MenuItem
            onClick={() => {
              onConfirmRow();
            }}
          >
            <Iconify icon="eva:checkmark-square-outline" />
            Duyệt
          </MenuItem>
        )}
        {(row.order_status.id === STATUSES.created_sale_receipt ||
          row.order_status.id === STATUSES.confirm_sale_receipt ||
          row.order_status.id === STATUSES.paying_sale_receipt ||
          (!row.status_order_after_export.paid &&
            !row.status_order_after_export.refunded &&
            row.order_status.id === STATUSES.exported)) && (
          <MenuItem
            onClick={() => {
              onPaymentRow();
            }}
          >
            <PaidIcon />
            Thanh Toán
          </MenuItem>
        )}
        {(row.order_status.id === STATUSES.created_sale_receipt ||
          row.order_status.id === STATUSES.confirm_sale_receipt ||
          row.order_status.id === STATUSES.paying_sale_receipt ||
          row.order_status.id === STATUSES.success_payment) && (
          <MenuItem
            onClick={() => {
              onExportRow();
            }}
          >
            <Iconify icon="mdi:home-export-outline" />
            Xuất kho
          </MenuItem>
        )}
        {/* {(row.order_status.id === STATUSES.exported && !row.status_order_after_export.paid) && ( */}
        {/*   <MenuItem */}
        {/*     onClick={() => { */}
        {/*       onRefundRow(); */}
        {/*       handleClosePopover(); */}
        {/*     }} */}
        {/*   > */}
        {/*     <Iconify icon="heroicons:receipt-refund" /> */}
        {/*     Trả hàng */}
        {/*   </MenuItem> */}
        {/* )} */}
        <MenuItem
          onClick={() => {
            onViewRow();
          }}
        >
          <Iconify icon="eva:eye-outline" />
          Chi tiết
        </MenuItem>
        <MenuItem
          onClick={() => {
            handlePrint(row.id);
          }}
        >
          <Iconify icon="mingcute:print-line" />
          In phiếu
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
