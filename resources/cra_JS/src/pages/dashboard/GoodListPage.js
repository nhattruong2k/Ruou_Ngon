import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
// @mui
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  Drawer,
  Stack,
  CircularProgress,
  Dialog,
  Box,
  DialogActions
} from '@mui/material';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import axios from '../../utils/axios';
import { useSnackbar } from '../../components/snackbar';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

// hooks
import useResponsive from '../../hooks/useResponsive';

import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustomFilter,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../components/table';

import { PATH_DASHBOARD } from '../../routes/paths';

import Label from '../../components/label';
// sections
import { GoodTableRow, GoodTableToolbar } from '../../sections/@dashboard/good/list';
import GoodAddNewAndEditForm from '../../sections/@dashboard/good/GoodAddNewAndEditForm';
import { getGoods } from '../../redux/slices/good';
import GoodPDF from '../../sections/@dashboard/good/details/GoodPDF';
import { COOKIE_TABLE_COLUMN } from '../../utils/constant';

const TABLE_HEAD = [
  {
    label: 'Sản phẩm',
    id: 'name',
    width: 220,
  },
  {
    label: 'Mã sản phẩm',
    id: 'code',
    minWidth: 140,
  },
  {
    label: 'Loại sản phẩm',
    id: 'good_category',
    minWidth: 140,
  },
  {
    label: 'Đơn vị tính',
    id: 'unit_of_measure',
    minWidth: 140,
  },
  {
    label: 'Nhà sản xuất',
    id: 'producer',
    minWidth: 150,
  },
  {
    label: 'Vùng sản xuất',
    id: 'product_area',
    minWidth: 150,
  },
  {
    label: 'Quốc gia',
    id: 'origin',
    minWidth: 140,
  },
  {
    label: 'Appellation, Denomination',
    id: 'apllelation',
    minWidth: 220,
  },
  {
    label: 'Niên vụ',
    id: 'season',
    minWidth: 160,
  },
  {
    label: 'Giống nho',
    id: 'grape',
    minWidth: 160,
  },
  {
    label: 'Dung tích (ml)',
    id: 'volume',
    minWidth: 140,
    align: 'right'
  },
  {
    label: 'Nồng độ cồn (acl/vol)',
    id: 'alcohol_level',
    minWidth: 220,
    align: 'right'
  },
  {
    label: 'Giá (vnđ)',
    id: 'price',
    minWidth: 140,
    align: 'right'
  },
  {
    label: 'Tỷ lệ chiêt khấu tối đa (%)',
    id: 'max_discount_rate',
    minWidth: 220,
    align: 'right'
  },
  {
    id: '',
    align: 'right'
  },
];

export default function GoodListPage() {
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
    //
    Cookies,
    tableActiveRow,
    setTableActiveRow,
    isFilterColumn,
    cookieTableName
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultRowsPerPage: 10,
    defaultCookieTableName: COOKIE_TABLE_COLUMN.good,
    defaultIsFilterColumn: true,
    defaultDense: true
  });

  const isMobile = useResponsive('down', 'sm');

  const theme = useTheme();

  const goodDetailRef = useRef();

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const [filterName, setFilterName] = useState('');

  const [filterOriginName, setOriginName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const [currentGood, setCurrentGood] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isLoadingPriceList, setIsLoadingPriceList] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [goodPriceList, setGoodPriceList] = useState([]);

  const { goods, unitOfMeasures, goodBrands, goodCategories, dataPaging, isLoading } = useSelector(
    (state) => state.good
  );

  const [tableData, setTableData] = useState([]);

  const [openDialogGoodBrand, setOpenDialogGoodBrand] = useState(false);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterOriginName,
  });

  const denseHeight = dense ? 60 : 80;

  const isFiltered =
    // filterStatus !== 'all' ||
    filterName !== '' ||
    filterOriginName !== '' ||
    filterService !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  // const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

  useEffect(() => {
    dispatch(
      getGoods({
        // filter_name: filterName,
        filter_good_type: filterService,
        // rows_per_page: rowsPerPage,
        // page: page + 1,
        // origin: filterOriginName,
      })
    );
  }, [dispatch, filterService]);
  // [dispatch, filterName, filterService, page, rowsPerPage, filterOriginName]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(goods);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getGoods({
        // filter_name: filterName,
        filter_good_type: filterService,
        // rows_per_page: rowsPerPage,
        // page: page + 1,
        // origin: filterOriginName,
      })
    );
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentGood(null);
  };

  const handleOpenDetail = async (selected) => {
    setIsLoadingPriceList(true);
    const response = await axios.post('get-good-by-goodCategory', { ids: selected })
      .then((response) => {
        setIsLoadingPriceList(false);
        const gooodByCategory = response?.data?.data;
        console.log(gooodByCategory);
        setGoodPriceList(gooodByCategory);
        handleOpenDialog();
      }).catch((error) => {
        setIsLoadingPriceList(false);
      });

  }

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('goods/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');

      refetchData();
      setSelected([]);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
    setOriginName('');
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentGood({
      ...row,
    });
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Helmet>
        <title> Danh sách sản phẩm | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Danh sách sản phẩm"
          links={[
            {
              name: 'Bán hàng',
            },
            {
              name: 'Sản phẩm',
            },
          ]}
          action={[
            selected.length > 0 && (<Button
              sx={{ mr: 1 }}
              size="small"
              key="btn1"
              onClick={() => handleOpenDetail(selected)}
              variant="contained"
              startIcon={isLoadingPriceList ? <CircularProgress style={{ width: 20, height: 20, }} /> : <Iconify icon="solar:tag-price-linear" />}
              disabled={isLoadingPriceList}
            >
              Xuất báo giá
            </Button>),
            <Button
              sx={{ mr: 1 }}
              size="small"
              key="btn2"
              onClick={addItem}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>,
          ]}
        />

        <Drawer
          open={openDrawer}
          anchor={'right'}
          onClose={() => {
            setOpenDrawer(false);
          }}
          PaperProps={{
            sx: {
              width: {
                xs: 1,
                sm: 480,
                md: 700,
              },
            },
          }}
        >
          <Scrollbar>
            <GoodAddNewAndEditForm
              onClose={closeDrawer}
              currentGood={currentGood}
              goodCategories={goodCategories}
              unitOfMeasures={unitOfMeasures}
              goodBrands={goodBrands}
              refetchData={refetchData}
              isEdit={isEdit}
              showDialogGoodBrand={() => {
                setOpenDialogGoodBrand(true);
              }}
            />
          </Scrollbar>
        </Drawer>
        {/* <GoodBrandDialog
          open={openDialogGoodBrand}
          refetchData={refetchData}
          goodBrands={goodBrands}
          onCloseDialog={() => {
            setOpenDialogGoodBrand(false);
          }}
        /> */}
        <Card>
          <GoodTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterService={filterService}
            filterEndDate={filterEndDate}
            // handleChange={handleFilterChange}
            onFilterName={handleFilterName}
            optionsService={goodCategories}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterService={handleFilterService}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
            onOriginName={(newValue) => {
              setPage(0);
              setOriginName(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Xóa">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustomFilter
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  Cookies={Cookies}
                  onTableActiveRow={(value) => { setTableActiveRow(value) }}
                  theme={theme}
                  cookieTableName={cookieTableName}
                  isFilterColumn={isFilterColumn}
                />

                <TableBody>
                  {/* {(isLoading ? [...Array(rowsPerPage)] : tableData).map((row, index) =>
                    row ? (
                      <GoodTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row)}
                      />
                    ) : (
                      !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    )
                  )} */}
                  {(isLoading ? [...Array(rowsPerPage)] : dataFiltered)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) =>
                      row ? (
                        <GoodTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRows([row.id])}
                          onEditRow={() => handleEditRow(row)}
                          tableActiveRow={tableActiveRow}
                        />
                      ) : (
                        !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                      )
                    )}
                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={dataFiltered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content={
          <>
            Bạn chắc chắn muốn xóa <strong> {selected.length} </strong> mục này?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Xóa
          </Button>
        }
      />

      <Dialog fullScreen open={openDialog}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              zIndex: 9,
              padding: '12px !important',
              boxShadow: (theme) => theme.customShadows.z8,
            }}
          >
            <Tooltip title="Close">
              <IconButton color="inherit" onClick={handleCloseDialog}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Tooltip>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <GoodPDF invoice={goodPriceList} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}



// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filterName, filterOriginName }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter((product) => product.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      || product.code.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterOriginName) {
    inputData = inputData.filter((product) => (product?.origin || '').toLowerCase().indexOf(filterOriginName.toLowerCase()) !== -1);
  }

  return inputData;
}
const CustomTablePaginationActions = ({ count, page, rowsPerPage, onPageChange }) => {
  const pageCount = Math.ceil(count / rowsPerPage);

  return (
    <div>
      {Array.from({ length: pageCount }, (_, index) => (
        <button key={index} onClick={() => onPageChange(index)}>
          {index + 1}
        </button>
      ))}
    </div>
  );
};