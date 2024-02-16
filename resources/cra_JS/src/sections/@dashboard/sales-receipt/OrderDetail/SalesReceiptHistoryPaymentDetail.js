import React, { useEffect, useState } from 'react';
// form
// @mui
import { Table, TableBody, TableCell, TableRow, TableContainer, Stack, Box } from '@mui/material';
// utils
import moment from 'moment';
// components
import { TableHeadCustom, TableNoData } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import { currencyFormatter } from '../../../../utils/formatNumber';
import Label from '../../../../components/label';

const TABLE_HEAD = [
  {
    label: 'Mã CT',
    id: 'code',
  },
  {
    label: 'Thời gian',
    id: 'date',
  },
  {
    label: 'Người tạo',
    id: 'employee',
  },
  {
    label: 'Trạng thái',
    id: 'status',
  },
  {
    label: 'Tổng tiền',
    id: 'total_price',
    align: 'right',
  },
  // {
  //   label: 'Đã thanh toán',
  //   id: 'total_paid',
  // },
  {
    label: 'Thanh toán',
    id: 'payment_price',
    align: 'right',
  },
  // {
  //   label: 'Còn lại',
  //   id: 'amount',
  // },

];

export default function SalesReceiptHistoryPaymentDetail({
  currentSaleReceipt,
  infoPaymentEdit,
  isLoading,
  isRefresh,
  setRefresh
}) {

  const [totalPricePayment, setTotalPricePayment] = useState(0);

  const [totalPricePaid, setTotalPricePaid] = useState(0);

  const [paymentItems, setPaymentItems] = useState([]);

  const isNotFound = paymentItems?.length === 0;

  // Get total price payment order
  useEffect(() => {
    const totalPaymentPrice = infoPaymentEdit?.totalPriceOrder + infoPaymentEdit?.totalTaxPrice - infoPaymentEdit?.totalDiscountPriceOrder;
    setTotalPricePayment(totalPaymentPrice);
  }, [infoPaymentEdit, isLoading])

  useEffect(() => {

    // Get history payment of order
    if (currentSaleReceipt?.payment_items && !paymentItems.length && totalPricePayment) {
      getDataRender();
    }

    if (currentSaleReceipt?.payment_items && isRefresh) {
      getDataRender();
    }

  }, [isLoading, currentSaleReceipt, totalPricePayment, isRefresh]);

  const getDataRender = () => {
    let result = 0;

    const listPaymentItem = currentSaleReceipt?.payment_items.map((item, index) => {
      if (item?.payment?.payment_status_id === 2) {
        result += Number(item?.amount || 0);
      }
      return item;
    });
    setTotalPricePaid(result);
    setPaymentItems(listPaymentItem);
  }

  return (
    <TableContainer sx={{ maxHeight: 440 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960, mb: 3 }} stickyHeader aria-label="sticky table">
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {paymentItems.map((item, index) => (
              <TableRow key={`${index}_${item?.id}`} hover>
                <TableCell sx={{ width: 120 }}>
                  {item?.payment?.code}
                </TableCell>
                <TableCell sx={{ width: 130 }}>
                  {item?.payment?.date ? moment(item?.payment?.date).format('DD/MM/YYYY HH:mm') : '-'}

                </TableCell>
                <TableCell sx={{ width: 125 }}>  {item?.payment?.user?.name || '-'}</TableCell>
                <TableCell sx={{ width: 100 }}>

                  <Label
                    variant="soft"
                    color={
                      (item?.payment?.payment_status_id === 1 && 'warning') || (item?.payment?.payment_status_id === 2 && 'success') || 'error'
                    }
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {(item?.payment?.payment_status_id === 1 && 'Chờ Duyệt') || (item?.payment?.payment_status_id === 2 && 'Đã duyệt') || 'Từ chối'}
                  </Label>
                </TableCell>
                <TableCell align="right" sx={{ width: 100 }}>{totalPricePayment ? currencyFormatter(totalPricePayment.toString()) : 0}</TableCell>

                <TableCell align="right" sx={{ width: 100 }}>{currencyFormatter(item.amount.toString()) || '-'}</TableCell>


              </TableRow>
            ))}
            <TableNoData isNotFound={isNotFound} />
          </TableBody>
        </Table>
      </Scrollbar>
      <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', pr: 2 }}>
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Tổng tiền thanh toán</Box>
          <Box sx={{ width: 180, typography: 'subtitle2', textAlign: 'right' }}>
            {totalPricePayment ? currencyFormatter(totalPricePayment.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Tổng tiền đã thanh toán</Box>
          <Box sx={{ width: 180 }}>
            {totalPricePaid ? currencyFormatter(totalPricePaid.toString()) : '-'}
          </Box>
        </Stack>

        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Số tiền còn lại</Box>
          <Box sx={{ width: 180 }}>
            {totalPricePayment ? currencyFormatter((totalPricePayment - totalPricePaid).toString()) : '-'}
          </Box>
        </Stack>
      </Stack>
    </TableContainer>
  );
}
