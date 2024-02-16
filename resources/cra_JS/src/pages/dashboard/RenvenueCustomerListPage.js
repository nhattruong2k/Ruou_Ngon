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
import { getRenvenueCustomer } from '../../redux/slices/screenReport';
import { getParties } from '../../redux/slices/parties';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// section
import RenvenueCustomerTableToolbar from '../../sections/@dashboard/renvenue-customer/list/RenvenueCustomerTableToolbar';
import { useSnackbar } from '../../components/snackbar';

import AnalyticsParties from '../../sections/@dashboard/renvenue-customer/AnalyticsParties';
import TableSkeleton from '../../sections/@dashboard/renvenue-customer/TableSkeleton';

export default function RenvenueCustomerListPage() {
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

  const { renvenueCustomer, isLoading, dataPaging } = useSelector((state) => state.screenReport);

  const parties = useSelector((state) => state.parties.parties);

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
      party: selectedOptions
    };

    dispatch(getRenvenueCustomer(params));
  }, [dispatch, filterName, rowsPerPage, filterStartDate, filterEndDate, page, selectedOptions]);

  useEffect(() => {
    dispatch(getParties({}));
  }, [dispatch]);


  const exportExcel = (queryParams) => {
    setLoadingBtnSave(true);
    try {
      const objParams = {
        name: filterName,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
        party: selectedOptions
      }
      axios.get(`export-excel-party-reports`, {
        params: objParams,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoDoanhThuKhachHang-${moment().format('YYMMDDHHmm')}.xlsx`);
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
        <title> Doanh thu theo khách hàng</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Doanh thu theo KH"
          links={[
            {
              name: 'Báo cáo',
            },
            { name: 'Doanh thu theo khách hàng' },
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
          <RenvenueCustomerTableToolbar
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
            statusOptions={parties}
            setSelectedPaties={setSelectedOptions}
            onResetFilter={handleResetFilter}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            {
              !isLoading ? (
                <AnalyticsParties
                  chart={{
                    categories: renvenueCustomer.map((i) => i.name),
                    series: [
                      {
                        type: 'Week',
                        data: [
                          { name: 'Doanh thu', data: renvenueCustomer.map((i) => i.total_payment_by_party) },
                          { name: 'Doanh số', data: renvenueCustomer.map((i) => i.total_order_by_party) },

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