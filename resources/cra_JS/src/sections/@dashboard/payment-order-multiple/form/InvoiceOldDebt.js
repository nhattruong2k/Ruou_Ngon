import { useEffect, useState } from 'react';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Box, Stack, Divider } from '@mui/material';
// utils
import { currencyFormatter } from '../../../../utils/formatNumber';
// components
import { RHFTextField } from '../../../../components/hook-form';

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

  const [objectTotal, setObjectTotal] = useState({});

  useEffect(() => {
    const totalPrice = row?.total_price;

    let autoTotalPayment = totalPrice;
    if (isEdit) {
      const totalPaidDebt = currentPayment?.payment_old_debts.reduce((total, item) => total + Number(item.amount), 0);

      autoTotalPayment = totalPaidDebt;
    } else if (remainingAmount && remainingAmount > 0) {
      if (autoTotalPayment >= remainingAmount) {
        autoTotalPayment = remainingAmount;
        setRemainingAmount(0);
      } else {
        setRemainingAmount(remainingAmount - autoTotalPayment);
      }
    } else autoTotalPayment = 0;

    setObjectTotal({
      total_remain: totalPrice,
      total_paid: 0,
      total_payment: autoTotalPayment,
    });

    setValue(`items[${keyItem}].total_payment`, autoTotalPayment);
    setValue(`items[${keyItem}].total_order_remaining`, totalPrice);
    setValue(`items[${keyItem}].order_id`, row?.id);
  }, [setValue, row, remainingAmount]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        <Stack alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField
              size="small"
              name={`items[${keyItem}].code`}
              value={row?.code}
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_order_remaining`}
              label="Số tiền còn lại (VNĐ)"
              placeholder="0"
              value={currencyFormatter(objectTotal?.total_remain || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />

            <RHFTextField
              size="small"
              name={`items[${keyItem}].total_payment`}
              label="Số tiền thanh toán (VNĐ)"
              placeholder="0"
              value={currencyFormatter(objectTotal?.total_payment || 0)}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </Stack>
        </Stack>
      </Stack>
      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
    </Box>
  );
}
