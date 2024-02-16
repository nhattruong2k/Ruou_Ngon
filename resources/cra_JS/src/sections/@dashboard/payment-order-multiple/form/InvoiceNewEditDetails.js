import sum from 'lodash/sum';
import { useCallback, useEffect, useState } from 'react';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// utils
import { currencyFormatter, formatPriceNumber, fCurrency } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import { RHFSelect, RHFTextField } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  { id: 1, name: 'full stack development', price: 90.99 },
  { id: 2, name: 'backend development', price: 80.99 },
  { id: 3, name: 'ui design', price: 70.99 },
  { id: 4, name: 'ui/ux design', price: 60.99 },
  { id: 5, name: 'front end development', price: 40.99 },
];

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails({
  row,
  keyItem,
  remainingAmount,
  setRemainingAmount,
  currentPayment,
  isEdit,
}) {
  const { control, setValue, watch, resetField } = useFormContext();

  const values = watch();

  const [showDetail, setShowDetail] = useState(false);

  const [objectTotal, setObjectTotal] = useState({});

  useEffect(() => {
    const totalPaid = row?.payment_items?.reduce(
      (accumulatorPaid, itemPaid) => accumulatorPaid + Number(itemPaid.amount),
      0
    );

    const {
      totalOrder,
      totalPaidPayment,
      totalOrderRemaining,
      totalPayment,
      detailTotalOrder,
      detailTotalDiscount,
      detailTotalVAT,
    } = row?.order_items?.reduce(
      (accumulator, item) => {
        const detailTotalOrder = item.price * item.quantity;
        const detailTotalDiscount = detailTotalOrder - item.discount * item.quantity;
        const detailTotalVAT = detailTotalOrder * (item.vat_rate / 100);
        const totalOrder = detailTotalOrder + detailTotalVAT - detailTotalDiscount;
        const totalOrderRemaining = totalOrder;
        const totalPayment = totalOrder;

        return {
          totalOrder: accumulator.totalOrder + totalOrder,
          totalPaidPayment: totalPaid,
          totalOrderRemaining: accumulator.totalOrderRemaining + totalOrderRemaining,
          totalPayment: accumulator.totalPayment + totalPayment,
          detailTotalOrder: accumulator.detailTotalOrder + detailTotalOrder,
          detailTotalDiscount: accumulator.detailTotalDiscount + detailTotalDiscount,
          detailTotalVAT: accumulator.detailTotalVAT + detailTotalVAT,
        };
      },
      {
        totalOrder: 0,
        totalPaidPayment: 0,
        totalOrderRemaining: 0,
        totalPayment: 0,
        detailTotalOrder: 0,
        detailTotalDiscount: 0,
        detailTotalVAT: 0,
      }
    );

    let autoTotalPayment = totalPayment - totalPaidPayment;

    if (isEdit) {
      const filterPayment = currentPayment?.payment_items.filter((item) => row?.id === item.order_id);
      const totalPaid = filterPayment?.reduce(
        (accumulatorPaid, itemPaid) => accumulatorPaid + Number(itemPaid.amount),
        0
      );
      autoTotalPayment = totalPaid;
    } else if (remainingAmount && remainingAmount > 0) {
      if (autoTotalPayment >= remainingAmount) {
        autoTotalPayment = remainingAmount;
        setRemainingAmount(0);
      } else {
        setRemainingAmount(remainingAmount - autoTotalPayment);
      }
    } else autoTotalPayment = 0;

    setObjectTotal({
      total_order: totalOrder,
      total_paid_payment: totalPaidPayment,
      total_order_remaining: totalOrderRemaining - totalPaidPayment,
      total_payment: autoTotalPayment,
      detail_total_order: detailTotalOrder,
      detail_total_discount: detailTotalDiscount,
      detail_total_vat: detailTotalVAT,
    });

    setValue(`items[${keyItem}].total_payment`, autoTotalPayment);
    setValue(`items[${keyItem}].total_order_remaining`, totalOrderRemaining - totalPaidPayment);
    setValue(`items[${keyItem}].order_id`, row?.id);
  }, [setValue, row, remainingAmount]);

  const handleShow = () => {
    setShowDetail(!showDetail);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        <Stack alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField
              size="small"
              name={`items[${keyItem}].code`}
              value={row?.code}
              label="Mã đơn hàng"
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_order`}
              label="Tổng tiền (VNĐ)"
              value={currencyFormatter(objectTotal?.total_order || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_paid_payment`}
              label="Đã thanh toán (VNĐ)"
              placeholder="0"
              value={currencyFormatter(objectTotal?.total_paid_payment || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_order_remaining`}
              label="Còn lại (VNĐ)"
              placeholder="0"
              value={currencyFormatter(objectTotal?.total_order_remaining || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_payment`}
              label="Tiền thanh toán (VNĐ)"
              placeholder="0"
              value={currencyFormatter(objectTotal?.total_payment || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{ mt: 3 }}
        spacing={2}
        direction={{ xs: 'column-reverse', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Button
          size="small"
          startIcon={showDetail ? <Iconify icon="eva:minus-fill" /> : <Iconify icon="eva:plus-fill" />}
          onClick={handleShow}
          sx={{ flexShrink: 0 }}
        >
          Chi tiết đơn hàng
        </Button>
      </Stack>
      {showDetail && (
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Scrollbar >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Mã sản phẩm</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ minWidth: 110 }}>Đơn vị</TableCell>
                  <TableCell align='right' sx={{ minWidth: 120 }}>Số lượng</TableCell>
                  <TableCell align='right' sx={{ minWidth: 160 }}>Đơn giá</TableCell>
                  <TableCell align='right' sx={{ minWidth: 160 }}>Chiết khấu (%)</TableCell>
                  <TableCell align='right' sx={{ minWidth: 160 }}>Thành tiền</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {row?.order_items?.map((item, index) => (
                  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="right">{index + 1}</TableCell>
                    <TableCell>{item?.good?.code}</TableCell>
                    <TableCell>{item?.good?.name}</TableCell>
                    <TableCell>{item?.good?.unit_of_measure?.name}</TableCell>
                    <TableCell align="right">{item?.quantity}</TableCell>
                    <TableCell align="right">{currencyFormatter(Number(item?.price))}</TableCell>
                    <TableCell align="right">{parseFloat(item?.percent_discount)}</TableCell>
                    <TableCell align="right">{currencyFormatter(Number(item?.price) * Number(item?.quantity))}</TableCell>
                    {/* <TableCell align="right">{currencyFormatter(Number(item?.price) * (Number(item?.discount) / 100))}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
          <Stack direction="row" justifyContent="flex-end">
            <Typography>Tổng tiền hàng :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(objectTotal?.detail_total_order || 0)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Typography>VAT:</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>{row?.vat_rate || 0.0}%</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Typography>Tiền thuế GTGT :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(objectTotal?.detail_total_vat || 0)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Tổng chiết khấu :</Typography>
            <Typography
              sx={{ textAlign: 'right', color: 'red', width: 120, ...(values.discount && { color: 'error.main' }) }}
            >
              - {currencyFormatter(objectTotal?.detail_total_discount || 0)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography variant="h6">Tổng cộng tiền thanh toán :</Typography>
            <Typography variant="h6" sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(objectTotal?.total_order || 0)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Số tiền đã thanh toán :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(objectTotal?.total_paid_payment || 0) || 0}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Số tiền thanh toán :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(objectTotal?.total_payment || 0) || 0}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Số tiền còn lại :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>
              {currencyFormatter(
                (objectTotal?.total_order || 0) -
                (objectTotal?.total_paid_payment || 0) -
                (objectTotal?.total_payment || 0)
              ) || 0}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Công nợ cũ :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>_</Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Typography>Công nợ mới :</Typography>
            <Typography sx={{ textAlign: 'right', width: 120 }}>_</Typography>
          </Stack>
        </Stack>
      )}
      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
    </Box >
  );
}
