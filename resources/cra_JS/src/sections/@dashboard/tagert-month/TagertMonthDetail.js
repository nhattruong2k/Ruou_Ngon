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
import { currencyFormatter, formatPriceNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import TagertMonthDialog from './TagertMonthDialog';

const TABLE_HEAD = [
  {
    label: 'Tên nhân viên',
    id: 'name',
    width: 185,
  },
  {
    label: 'Mã nhân viên',
    id: 'code',
    width: 150,
  },
  {
    label: 'Mục tiêu',
    id: 'tagerts',
    width: 210,
    align: 'right'
  },
  {
    id: '',
    width: 25,
  },
];

const TagertMonthDetail = forwardRef(({ employeesData, isEdit, sumTarget }, ref) => {
  const { control, setValue, getValues, watch } = useFormContext();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'tagertMonths',
  });

  const valueForm = watch();

  const { enqueueSnackbar } = useSnackbar();

  const [employeeSelected, setEmployeeSelected] = useState([]);

  const [openFrom, setOpenFrom] = useState(false);

  const updateEmployeeSelected = (employee, type, index) => {
    if (type === 'remove') {
      setEmployeeSelected((prevEmployees) => prevEmployees.filter((item) => item.id !== employee.employee_id));
      remove(index);
      sumTarget(valueForm?.tagertMonths.filter((item) => item.employee_id !== employee.employee_id));
    } else {
      setEmployeeSelected((prevEmployees) => [...prevEmployees, employee]);
      append({
        employee_id: employee.id,
        name: employee.name,
        code: employee.code,
        tagerts: '',
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
    setEmployeeSelected([]);
  };

  const setEmployeeList = (employees) => {
    const tagertValues = [];
    const tagetMonthConvert = employees?.tagert_users.map((_item, index) => {
      tagertValues.push({
        employee_id: _item.user_id,
        name: _item.user.name,
        code: _item.user.code,
        tagerts: _item.tagerts,
      });
      return _item.user;
    });
    setEmployeeSelected(tagetMonthConvert);
    setValue('tagertMonths', tagertValues);
  };

  useImperativeHandle(ref, () => ({
    handleOpenFrom,
    clearForm,
    setEmployeeList,
  }));

  return (
    <>
      <Box>
        <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={'medium'} sx={{ minWidth: 600 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {fields.map((row, index) => (
                    <TableRow key={row?.employee_id}>
                      <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                        {row?.name || ''}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                        {row?.code || ''}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }}>
                        <RHFTextField
                          size="small"
                          name={`tagertMonths[${index}].tagerts`}
                          onChange={(e) => {
                            const tagertValue = e.target.value ? formatPriceNumber(e.target.value) : 0;
                            setValue(`tagertMonths[${index}].tagerts`, tagertValue);
                            sumTarget();
                          }}
                          sx={{ maxWidth: { md: 220 } }}
                          InputLabelProps={{ shrink: true }}
                          typeinput="price"
                          className="input-number-text-align-right"
                        />
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px dashed rgb(241, 243, 244) !important' }} align="right">
                        <IconButton aria-label="delete" onClick={() => updateEmployeeSelected(row, 'remove', index)}>
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
        <TagertMonthDialog
          open={openFrom}
          onClose={handleCloseFrom}
          employeesData={employeesData}
          selected={employeeSelected}
          onSelect={updateEmployeeSelected}
        />
      </Box>
    </>
  );
});

export default TagertMonthDetail;
