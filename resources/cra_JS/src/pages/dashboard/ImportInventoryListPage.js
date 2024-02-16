import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, Table, TableBody, Container, TableContainer, Box, CircularProgress } from '@mui/material';
import moment from 'moment';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useTable, TableNoData, TableSkeleton, TableHeadCustom, TablePaginationCustom } from '../../components/table';
import Scrollbar from '../../components/scrollbar';
import { getInventories } from '../../redux/slices/screenReport';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// section
import { ImportInventoryTableRow, ImportInventoryTableToolbar } from '../../sections/@dashboard/import-inventory/list';
import { useSnackbar } from '../../components/snackbar';
import { getInternalOrg } from '../../redux/slices/internalOrg';
import '../style/style.css';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Kho',
    id: 'warehouse',
    minWidth: 180,
  },
  {
    label: 'Mã vật tư',
    id: 'good_code',
    minWidth: 140,
  },
  {
    label: 'Tên vật tư',
    id: 'good_name',
    minWidth: 160,
  },
  {
    label: 'Đơn vị tính',
    id: 'unit',
    minWidth: 140,
  },
  {
    label: 'Tồn đầu kỳ',
    id: 'begin_inventory',
    align: 'right',
    minWidth: 140,
  },
  {
    label: 'Nhập trong kỳ',
    id: 'import',
    align: 'right',
    minWidth: 140,
  },
  {
    label: 'Xuất trong kỳ',
    id: 'export',
    align: 'right',
    minWidth: 140,
  },
  {
    label: 'Tồn cuối kỳ',
    id: 'end_inventory',
    align: 'right',
    minWidth: 140,
  },
];

export default function DebtsListPage() {
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
    defaultRowsPerPage: 10,
  });

  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const [filterName, setFilterName] = useState('');

  const dispatch = useDispatch();

  const { inventories, isLoading, dataPaging } = useSelector((state) => state.screenReport);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const loadingInternal = useSelector((state) => state.internalOrg.isLoading);

  const [tableData, setTableData] = useState([]);

  const denseHeight = dense ? 60 : 80;

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [filterWarehouse, setFilterWarehouse] = useState('all');

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      setTableData(inventories);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(getInternalOrg());
  }, []);

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterWarehouse('all');
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const isFiltered =
    filterName !== '' ||
    filterWarehouse !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  const refetchData = () => {
    dispatch(
      getInventories({
        filter_name: filterName,
        rows_per_page: rowsPerPage,
        filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
        filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
        filter_warehouse: filterWarehouse,
        page: page + 1,
      })
    );
  };

  useEffect(() => {
    if (filterWarehouse) {
      const params = {
        filter_name: filterName,
        rows_per_page: rowsPerPage,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
        filter_warehouse: filterWarehouse,
        page: page + 1,
      };

      dispatch(getInventories(params));
    }
  }, [dispatch, filterName, rowsPerPage, filterWarehouse, filterStartDate, filterEndDate, page]);

  const exportExcel = (queryParams) => {
    setLoadingBtnSave(true);
    try {
      const objParams = {
        name: filterName,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
      };
      axios
        .get(`exportExcel-customer`, {
          params: objParams,
          method: 'GET',
          responseType: 'blob', // important
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `LichSuChamSocKhachHang-${moment().format('YYMMDDHHmm')}.xlsx`);
          document.body.appendChild(link);
          link.click();
          refetchData();
          setLoadingBtnSave(false);
          enqueueSnackbar('Tải file thành công!');
        });
      setLoadingBtnSave(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  const handleFilterWarehouse = (event) => {
    setPage(0);
    setFilterWarehouse(event.target.value);
  };

  const onDetailRow = (id) => {
    const formatStartDate = filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : '';
    const formatEndDate = filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : '';

    navigate(
      PATH_DASHBOARD.debts.detail(
        `${id}?filter_start_date=${formatStartDate}&filter_end_date=${formatEndDate}&filter_warehouse=${filterWarehouse}`
      )
    );
  };

  return (
    <>
      <Helmet>
        <title>Xuất nhập tồn | Rượu ngon</title>
      </Helmet>

      {loadingInternal && (
        <Box className={'c-box__loading'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Xuất nhập tồn"
          links={[
            {
              name: 'Báo cáo',
            },
            { name: 'Xuất nhập tồn' },
          ]}
        // action={
        //   <Button
        //     key={'keyitem1'}
        //     sx={{ mr: 1 }}
        //     size="small"
        //     onClick={exportExcel}
        //     variant="contained"
        //     startIcon={
        //       loadingBtnSave ? (
        //         <CircularProgress style={{ color: 'white' }} size={24} />
        //       ) : (
        //         <Iconify icon="eva:file-text-fill" />
        //       )
        //     }
        //     disabled={loadingBtnSave}
        //   >
        //     Xuất Excel
        //   </Button>
        // }
        />
        <Card>
          <ImportInventoryTableToolbar
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
            filterWarehouse={filterWarehouse}
            onFilterWarehouse={handleFilterWarehouse}
            onResetFilter={handleResetFilter}
            optionsWarehouse={internalOrgs}
            isFiltered={isFiltered}
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
                  {(isLoading ? [...Array(rowsPerPage)] : tableData).map((row, index) =>
                    row ? (
                      <ImportInventoryTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onDetailRow={() => onDetailRow(row.id)}
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
  );
}
