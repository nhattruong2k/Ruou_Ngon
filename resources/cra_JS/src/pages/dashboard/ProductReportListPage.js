import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Stack, Card, Table, TableBody, Container, TableContainer, Typography, TableRow, TableCell } from '@mui/material';
import moment from 'moment';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useTable, TableNoData, TableSkeleton, TableHeadCustom, TablePaginationCustom } from '../../components/table';
import Scrollbar from '../../components/scrollbar';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// section
import { ProductTableToolbar, ProductTableRow, TotalProductReport } from '../../sections/@dashboard/product-report/list';
import { useSnackbar } from '../../components/snackbar';
import { getInternalOrg } from '../../redux/slices/internalOrg';
import { getProductReports } from '../../redux/slices/good';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Kho',
    id: 'warehouse',
    minWidth: 160,
  },
  {
    label: 'Loại sản phẩm',
    id: 'product_type',
    minWidth: 160,
  },
  {
    label: 'Nhóm sản phẩm',
    id: 'product_groups',
    minWidth: 160,
  },
  {
    label: 'Mã sản phẩm',
    id: 'code',
    minWidth: 160,
  },
  {
    label: 'Tên sản phẩm',
    id: 'good_name',
    minWidth: 120,
  },
  {
    label: 'Số lượng',
    id: 'quatily',
    minWidth: 120,
    align: 'right'
  },
  {
    label: 'Doanh số',
    id: 'sale',
    minWidth: 180,
    align: 'right'
  },
];

export default function ProductReportListPage() {
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

  const [filterCategory, setFilterCategory] = useState('');

  const dispatch = useDispatch();

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const { products, isLoading, dataPaging } = useSelector((state) => state.good.product);

  const [tableData, setTableData] = useState([]);

  const denseHeight = dense ? 60 : 80;

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [filterWarehouse, setFilterWarehouse] = useState('all');

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      setTableData(products);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(getInternalOrg());
  }, []);

  const handleResetFilter = () => {
    setFilterName('');
    setFilterCategory('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterWarehouse('all');
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterCategory = (event) => {
    setPage(0);
    setFilterCategory(event.target.value);
  };

  const isFiltered =
    filterName !== '' ||
    filterCategory !== '' ||
    filterWarehouse !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const isNotFound = (!tableData.length && !!filterName && !!filterCategory) || (!isLoading && !tableData.length);

  const refetchData = () => {
    dispatch(
      getProductReports({
        filter_name: filterName,
        filter_category: filterCategory,
        rows_per_page: rowsPerPage,
        filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
        filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
        filter_warehouse: filterWarehouse,
        page: page + 1,
      })
    );
  };

  useEffect(() => {
    const params = {
      filter_name: filterName,
      filter_category: filterCategory,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate,
      filter_end_date: filterEndDate,
      filter_warehouse: filterWarehouse,
      page: page + 1,
    };

    dispatch(getProductReports(params));
  }, [dispatch, filterName, filterCategory, rowsPerPage, filterWarehouse, filterStartDate, filterEndDate, page]);

  const handleFilterWarehouse = (event) => {
    setPage(0);
    setFilterWarehouse(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Báo cáo doanh số theo sản phẩm</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Doanh số theo sản phẩm"
          links={[
            {
              name: 'Báo cáo',
            },
            { name: 'Doanh số theo sản phẩm' },
          ]}
        />
        <Card>
          <ProductTableToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            filterCategory={filterCategory}
            onFilterCategory={handleFilterCategory}
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
                      <ProductTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                      />
                    ) : (
                      !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    )
                  )}

                  {/* <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} /> */}
                  <TableNoData isNotFound={isNotFound} />
                  {/* <TotalProductReport
                    allProducts={allProducts}
                    isLoading={isLoading}
                  /> */}
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
