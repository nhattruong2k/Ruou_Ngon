import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Card, Table, Button, Tooltip, TableBody, Container, IconButton, TableContainer, Drawer, CircularProgress } from '@mui/material';
import moment from 'moment';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
import {
  useTable,
  TablePaginationCustom,
} from '../../components/table';
import Iconify from '../../components/iconify';
import { getRenvenueEmployee } from '../../redux/slices/screenReport';
import { getEmployees } from '../../redux/slices/employee';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// section
import RenvenueTableToolbar from '../../sections/@dashboard/renvenue-employee/list/RenvenueTableToolbar';
import { useSnackbar } from '../../components/snackbar';

import AnalyticsEmployee from '../../sections/@dashboard/renvenue-employee/AnalyticsEmployee';
import TableSkeleton from '../../sections/@dashboard/renvenue-employee/TableSkeleton';

export default function RenvenueEmployeeListPage() {
  const {
    dense,
    page,
    rowsPerPage,
    setPage,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultRowsPerPage: 10
  });

  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const [filterName, setFilterName] = useState('');

  const [selectedOptions, setSelectedOptions] = useState('');

  const dispatch = useDispatch();

  const { renvenueEmployee, isLoading, dataPaging } = useSelector((state) => state.screenReport);

  const employees = useSelector((state) => state.employee.employees);

  const denseHeight = dense ? 60 : 80;

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const isFiltered = filterName !== '' || (!!filterStartDate && !!filterEndDate);

  useEffect(() => {
    const params = {
      name: filterName,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate,
      filter_end_date: filterEndDate,
      page: page + 1,
      employees: selectedOptions
    };

    dispatch(getRenvenueEmployee(params));
  }, [dispatch, filterName, rowsPerPage, filterStartDate, filterEndDate, page, selectedOptions]);

  useEffect(() => {
    dispatch(getEmployees({}));
  }, [dispatch]);


  const exportExcel = (queryParams) => {
    setLoadingBtnSave(true);
    try {
      const objParams = {
        name: filterName,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
        employees: selectedOptions
      }
      axios.get(`export-excel-employee-reports`, {
        params: objParams,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoDoanhThuNhanVien-${moment().format('YYMMDDHHmm')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        setLoadingBtnSave(false);
        enqueueSnackbar('Tải file thành công!');
      })
      setLoadingBtnSave(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      setLoadingBtnSave(false);
    }
  }

  return (
    <>
      <Helmet>
        <title> Doanh thu theo nhân viên</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Doanh thu theo NV"
          links={[
            {
              name: 'Báo cáo',
            },
            { name: 'Doanh thu theo nhân viên' },
          ]}
          action={
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              onClick={exportExcel}
              variant="contained"
              startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify icon="eva:file-text-fill" />}
              disabled={loadingBtnSave}
            >
              Xuất Excel
            </Button>
          }
        />
        <Card>
          <RenvenueTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            onFilterName={handleFilterName}
            filterStartDate={filterStartDate}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            filterEndDate={filterEndDate}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
            statusOptions={employees}
            setSelectedPaties={setSelectedOptions}
            onResetFilter={handleResetFilter}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            {
              !isLoading ? (
                <AnalyticsEmployee
                  chart={{
                    categories: renvenueEmployee.map((i) => i.name),
                    series: [
                      {
                        type: 'Week',
                        data: [
                          { name: 'Mục tiêu tháng', data: renvenueEmployee.map((i) => i.total_tagert) },
                          { name: 'Doanh thu', data: renvenueEmployee.map((i) => i.total_payment_by_employee) },
                          { name: 'Doanh số', data: renvenueEmployee.map((i) => i.total_order_by_employee) },
                          { name: 'Chi phí', data: renvenueEmployee.map((i) => i.total_order_gift_by_employee) },
                        ],
                      }
                    ],
                  }}
                />
              ) : (
                <TableSkeleton sx={{ height: denseHeight }} />
              )
            }

          </TableContainer>
          <TablePaginationCustom
            count={dataPaging?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>
    </>
  )
}