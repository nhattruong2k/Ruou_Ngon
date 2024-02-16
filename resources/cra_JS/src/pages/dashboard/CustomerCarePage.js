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
import { getDailyWorks } from '../../redux/slices/dailywork';
import { PATH_DASHBOARD } from '../../routes/paths';
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
} from '../../components/table';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getCustomer } from '../../redux/slices/customerCare';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// section
import { CustomerCareTableRow, CustomerCareTableToolbar } from '../../sections/@dashboard/customer-care/list';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Ngày báo cáo',
    id: 'date',
    maxWidth: 5,
  },
  {
    label: 'Hình thức CSKH',
    id: 'history_care',
  },
  {
    label: 'Tên khách hàng',
    id: 'customer',
  },
  {
    label: 'Người tạo',
    id: 'consultant_id',
  },
  {
    label: 'Mô tả',
    id: 'description',
  },
];

export default function CustomerCarePage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
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

  const dispatch = useDispatch();

  const { customerCares, isLoading, dataPaging } = useSelector((state) => state.customerCare);

  const [tableData, setTableData] = useState([]);

  const denseHeight = dense ? 60 : 80;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTableData(customerCares);
    }
  }, [isLoading]);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const isFiltered = filterName !== '' || filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD')|| filterEndDate !== moment().format('YYYY-MM-DD');

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  const refetchData = () => {
    dispatch(getCustomer({
      name: filterName,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
      page: page + 1
    }));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
  };

  useEffect(() => {
    const params = {
      name: filterName,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate,
      filter_end_date: filterEndDate,
      page: page + 1
    };

    dispatch(getCustomer(params));
  }, [dispatch, filterName, rowsPerPage, filterStartDate, filterEndDate, page]);

  const exportExcel = (queryParams) => {
    setLoadingBtnSave(true);
    try {
      const objParams = {
        name: filterName,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
      }
      axios.get(`exportExcel-customer`, {
        params: objParams,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `LichSuChamSocKhachHang-${moment().format('YYMMDDHHmm')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        refetchData();
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
        <title> Lịch sử chăm sóc khác hàng</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Lịch sử CSKH"
          links={[
            {
              name: 'Báo cáo',
            },
            { name: 'Lịch sử CSKH' },
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
          <CustomerCareTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            onFilterName={handleFilterName}
            filterStartDate={filterStartDate}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            filterEndDate={filterEndDate}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                />
                <TableBody>
                  {(isLoading ? [...Array(rowsPerPage)] : tableData)
                    .map((row, index) =>
                      row ? (
                        <CustomerCareTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => onSelectRow(row.id)}
                        />
                      ) : (
                        !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                      )
                    )}

                  {/* <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} /> */}

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={dataPaging?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>
    </>
  )
}