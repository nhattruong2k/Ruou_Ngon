import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, TextField, IconButton, Table, TableBody, TableRow, TableCell, CircularProgress, TableContainer } from '@mui/material';

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
import { currencyFormatter, formatPriceNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import ConclusionContractDialog from './ConclusionContractDialog';

const TABLE_HEAD = [
  {
    label: 'Tên sản phẩm',
    id: 'name',
    width: 200,
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
    label: 'Số lượng',
    id: 'quantity',
    width: 120,
  },
  {
    label: 'Số lượng / tháng',
    id: 'quantity_monthly',
    width: 160,
  },
  {
    id: '',
  },
];

const ConclustionContractDetail = forwardRef(
  ({ goodData, isEdit, isConfirm, isView, disabledInput, loadingDetail }, ref) => {
    const { control, setValue, getValues, watch } = useFormContext();

    const { fields, update, append, remove, prepend } = useFieldArray({
      control,
      name: 'good',
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
          price: good.price,
          quantity: 0,
          quantity_monthly: 0,
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

    const setGoodContractList = (goods) => {
      const conclusionContractValues = [];
      const conclusionContractConvert = goods?.contract_goods.map((_item, index) => {
        conclusionContractValues.push({
          good_id: _item.good_id,
          name: _item.good.name,
          code: _item.good.code,
          price: _item.good.price,
          quantity: _item.quantity,
          quantity_monthly: _item.quantity_monthly,
        });
        return _item.good;
      });
      setGoodSelected(conclusionContractConvert);
      setValue('good', conclusionContractValues);
    };

    useImperativeHandle(ref, () => ({
      handleOpenFrom,
      clearForm,
      setGoodContractList,
    }));

    return (
      <>
        {(loadingDetail) && (
          <Box className={'c-box__loading_v2'}>
            <CircularProgress className={'c-box__loading__icon'} />
          </Box>
        )}
        <Box>
          <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={'medium'} sx={{ minWidth: 650 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />
                  <TableBody>
                    {fields.map((row, index) => (
                      <TableRow key={row?.good_id}>
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
                            name={`good[${index}].quantity`}
                            disabled={disabledInput.quantity}
                            onChange={(e) => {
                              const tagertValue = e.target.value || 0;
                              setValue(`good[${index}].quantity`, tagertValue);
                            }}
                            sx={{ maxWidth: { md: 220 } }}
                            InputLabelProps={{ shrink: true }}
                            typeinput="number"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                          <RHFTextField
                            size="small"
                            name={`good[${index}].quantity_monthly`}
                            disabled={disabledInput.quantity_monthly}
                            onChange={(e) => {
                              const targetMonthValue = e.target.value || 0;
                              const quantity = getValues(`good[${index}].quantity`);
                              if (Number(targetMonthValue) > Number(quantity)) {
                                enqueueSnackbar('Số lượng sản phẩm hàng tháng không được vượt quá số lượng sản phẩm', {
                                  variant: 'error',
                                });
                                setValue(`good[${index}].quantity_monthly`, quantity);
                              } else {
                                setValue(`good[${index}].quantity_monthly`, targetMonthValue);
                              }
                            }}
                            sx={{ maxWidth: { md: 220 } }}
                            InputLabelProps={{ shrink: true }}
                            typeinput="number"
                          />
                        </TableCell>
                        {!isConfirm && !isView && (
                          <>
                            <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }} align="right">
                              <IconButton aria-label="delete" onClick={() => updateGoodSelected(row, 'remove', index)}>
                                <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
                              </IconButton>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Stack>
          <ConclusionContractDialog
            open={openFrom}
            onClose={handleCloseFrom}
            goodData={goodData}
            selected={goodSelected}
            onSelect={updateGoodSelected}
          />
        </Box>
      </>
    )
  });

export default ConclustionContractDetail;
