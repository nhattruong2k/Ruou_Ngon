import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import {
  Box,
  Stack,
  Button,
  Divider,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';

import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
// utils
import axios from '../../../utils/axios';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import GoodListDialog from './GoodListDialog';
import { currencyFormatter, formatPriceNumber } from '../../../utils/formatNumber';

const TABLE_HEAD = [
  {
    label: 'Tên sản phẩm',
    id: 'name',
    width: 150,
  },
  {
    label: 'Mã sản phẩm',
    id: 'code',
    width: 150,
  },
  {
    label: 'Đơn giá',
    id: 'price',
    width: 115,
  },
  {
    label: 'Chiết khấu',
    id: 'discount',
    align: 'right',
    width: 150,
  },
  {
    label: 'Đơn giá sau CK',
    id: 'unit_price_after_discount',
    align: 'right',
    width: 250,
  },
  {
    id: '',
    width: 25,
  },
];

const GoodDetail = forwardRef(({ goodData, isEdit }, ref) => {
  const { control, setValue, getValues } = useFormContext();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'goods',
  });

  const { enqueueSnackbar } = useSnackbar();

  const [goodSelected, setGoodSelected] = useState([]);

  const [openFrom, setOpenFrom] = useState(false);

  const updateGoodSelected = (good, type, index) => {
    if (type === 'remove') {
      setGoodSelected((prevGoods) => prevGoods.filter((item) => item.id !== good.good_id));
      remove(index);
    } else {
      setGoodSelected((prevGoods) => [...prevGoods, good]);
      append({
        good_id: good.id,
        name: good.name,
        code: good.code,
        discount: '',
        price: good.price,
      });
    }
  };

  const handleOpenFrom = () => {
    setOpenFrom(true);
  };

  const handleCloseFrom = () => {
    setOpenFrom(false);
  };

  const clearForm = () => {
    setGoodSelected([]);
  };

  const setGoodList = (goods) => {
    const goodValues = [];
    const goodConvert = goods.order_item_samples?.map((_item, index) => {
      const priceAfterDiscount = (_item.good.price * _item.discount) / 100;

      goodValues.push({
        good_id: _item.good.id,
        name: _item.good.name,
        code: _item.good.code,
        discount: _item.percent_discount,
        price: _item.good.price,
        price_after_discount: _item.discount,
      });

      return _item.good;
    });
    setGoodSelected(goodConvert);
    setValue('goods', goodValues);
  };

  useImperativeHandle(ref, () => ({
    handleOpenFrom,
    clearForm,
    setGoodList,
  }));

  const handleTotalPriceAfterDiscount = (price, discount, key) => {
    const priceDiscount = (price * discount) / 100 || 0;
    const priceAfterDiscount = price - priceDiscount;
    setValue(key, priceAfterDiscount ? currencyFormatter(priceAfterDiscount) : '');
  };

  return (
    <Box>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={'medium'} sx={{ minWidth: 850 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {fields.map((row, index) => (
                  <TableRow key={row?.id}>
                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                      {row?.name || ''}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                      {row?.code || ''}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }} align="right">
                      {row?.price ? currencyFormatter(row?.price) : ''}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                      <RHFTextField
                        size="small"
                        name={`goods[${index}].discount`}
                        defaultValue={row?.id}
                        onChange={(e) => {
                          const discount = e.target.value ? e.target.value : 0;
                          if (discount > 100) {
                            setValue(`goods[${index}].discount`, '');
                            setValue(`goods[${index}].id`, row?.id);
                            handleTotalPriceAfterDiscount(row?.price, 0, `goods[${index}].price_after_discount`);
                          } else {
                            setValue(`goods[${index}].discount`, e.target.value ? e.target.value : '');
                            setValue(`goods[${index}].id`, row?.id);
                            handleTotalPriceAfterDiscount(
                              row?.price,
                              e.target.value,
                              `goods[${index}].price_after_discount`
                            );
                          }
                        }}
                        sx={{ maxWidth: { md: 220 } }}
                        InputLabelProps={{ shrink: true }}
                        type="number"
                        className="input-number-text-align-right"
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                      <RHFTextField
                        size="small"
                        typeinput="price"
                        name={`goods[${index}].price_after_discount`}
                        onChange={(e) => {
                          const price = formatPriceNumber(row?.price);
                          let priceDiscount = formatPriceNumber(e.target.value !== '' ? e.target.value : 0);
                          let discount = '0';

                          if (priceDiscount > price) {
                            enqueueSnackbar('Số tiền chiết khấu vượt quá đơn giá', { variant: 'error' });

                            priceDiscount = row?.price;
                            discount = '0';

                            setValue(`goods[${index}].price_after_discount`, currencyFormatter(priceDiscount));
                            setValue(`goods[${index}].discount`, discount);
                          } else {
                            discount = ((price - priceDiscount) / price) * 100;

                            setValue(`goods[${index}].price_after_discount`, currencyFormatter(priceDiscount));
                            setValue(`goods[${index}].discount`, parseFloat(discount.toFixed(2)));
                          }
                        }}
                        sx={{ maxWidth: { md: 220 } }}
                        InputLabelProps={{ shrink: true }}
                        className="input-number-text-align-right"
                      />
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }} align="right">
                      <IconButton aria-label="delete" onClick={() => updateGoodSelected(row, 'remove', index)}>
                        <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Stack>

      <GoodListDialog
        open={openFrom}
        onClose={handleCloseFrom}
        goodData={goodData}
        selected={goodSelected}
        onSelect={updateGoodSelected}
      />
    </Box>
  );
});

export default GoodDetail;
