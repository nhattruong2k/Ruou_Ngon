import React, { useEffect, useState } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import { Button, Table, TableBody, TableRow, TableCell } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import Iconify from '../../../../components/iconify';
// utils
// components
import { useSnackbar } from '../../../../components/snackbar';
import { RHFTextField } from '../../../../components/hook-form';
import { TableHeadCustom } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';

const TABLE_HEAD = [
  {
    label: 'Mã sản phẩm',
    id: 'good_code',
    width: 100,
  },
  {
    label: 'Tên sản phẩm',
    id: 'good_name',
    width: 100,
  },
  {
    label: 'Đơn vị tính',
    id: 'unit',
    width: 80,
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    width: 40,
  },
  {
    label: 'Số lượng trả',
    id: 'quantity_refund',
    width: 90,
  },
  {
    id: '',
    width: 40,
  },
];

export default function SaleReceiptOrderRefundDetail({
  triggerClickAdd,
  addQuantity,
  refundItemRemoved,
  isEdit = false,
}) {
  const { control, register, setValue, watch, resetField } = useFormContext();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'items',
  });

  const values = watch();

  useEffect(() => {
    if (triggerClickAdd) {
      handleAdd();
    }
  }, [triggerClickAdd]);

  const handleAdd = () => {
    prepend({
      id: null,
      good_code: null,
      good_name: '',
      good_unit: '',
      quantity: 1,
    });
  };

  const handleOpenConfirm = (key, data) => {
    remove(key);
    if (values?.items) {
      const itemRemoved = values.items.splice(key, 1);
      refundItemRemoved(itemRemoved[0].id);
    }
  };

  return (
    <Scrollbar>
      <Table>
        <TableHeadCustom headLabel={TABLE_HEAD} />

        <TableBody>
          {!isEdit
            ? fields.map((element, index) => (
                <TableRow key={`${index}_${element?.id}`} hover>
                  <TableCell sx={{ width: 20 }}>{element.good_code}</TableCell>
                  <TableCell sx={{ width: 20 }}>{element.good_name}</TableCell>
                  <TableCell sx={{ width: 20 }}>{element.good_unit}</TableCell>
                  <TableCell sx={{ width: 20 }} align="right">{element.quantity}</TableCell>
                  <TableCell sx={{ width: 20 }}>
                    <RHFTextField
                      size="small"
                      name={`items[${index}].quantityRefund`}
                      onChange={(e) => {
                        if (e.target.value > element.quantity) {
                          enqueueSnackbar('Số lượng vượt quá số lượng mua', { variant: 'error' });
                          setTimeout(() => {
                            setValue(`items[${index}].quantityRefund`, 1);
                          }, 500);
                        } else {
                          setValue(`items[${index}].quantityRefund`, e.target.value ? e.target.value : 1);
                        }
                        addQuantity();
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 10 }}>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      color="error"
                      disabled={loadingBtnSave}
                      onClick={() => {
                        handleOpenConfirm(index, element);
                      }}
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            : fields.map((element, index) => (
                <TableRow key={`${index}_${element?.id}`} hover>
                  <TableCell sx={{ width: 50 }}>{element?.good?.code}</TableCell>
                  <TableCell sx={{ width: 50 }}>{element?.good?.name}</TableCell>
                  <TableCell sx={{ width: 50 }}>{element?.good?.unit_of_measure?.name}</TableCell>
                  <TableCell sx={{ width: 50 }}>{element?.quantity}</TableCell>
                  <TableCell sx={{ width: 50 }}>{element?.quantityRefund}</TableCell>
                  <TableCell />
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Scrollbar>
  );
}
