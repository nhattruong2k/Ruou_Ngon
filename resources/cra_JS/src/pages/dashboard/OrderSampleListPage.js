import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Drawer,
  Tooltip,
  TableBody,
  Divider,
  Container,
  IconButton,
  TableContainer,
} from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import axios from '../../utils/axios';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

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
// sections
import OrderSampleTableRow from '../../sections/@dashboard/order-samples/list/OrderSampleTableRow';
import OrderSampleTableToolbar from '../../sections/@dashboard/order-samples/list/OrderSampleTableToolbar';

import OrderSampleForm from '../../sections/@dashboard/order-samples/OrderSampleForm';
import { getOrderSamples } from '../../redux/slices/orderSample';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Tên khách hàng',
    id: 'name',
    width: 220,
    minWidth: 220,
  },
  {
    label: 'Mã khách hàng',
    id: 'code',
    minWidth: 160,
  },
  {
    label: 'Ghi chú',
    id: 'comment',
    minWidth: 220,
  },
  {
    id: '',
  },

];

export default function OrderSampleListPage() {

  const { themeStretch } = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

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

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [checked, setChecked] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentData, setCurrentData] = useState(null);

  const [tableData, setTableData] = useState([]);

  const { orderSamples, isLoading, dataPaging } = useSelector((state) => state.orderSample);

  const isFiltered = filterStatus !== 'all' || filterName !== '' || (!!filterStartDate && !!filterEndDate);

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  useEffect(() => {
    dispatch(
      getOrderSamples({
        filter_name: filterName,
        rows_per_page: rowsPerPage,
        page: page + 1
      })
    );
  }, [dispatch, filterName, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(orderSamples);
    }
  }, [isLoading]);


  const refetchData = () => {
    dispatch(
      getOrderSamples({
        filter_name: filterName,
        rows_per_page: rowsPerPage,
        page: page + 1
      })
    );
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentData(null);
  };

  const handleDeleteRows = async (selected) => {

    try {
      const response = await axios.post('order-samples/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');
      setSelected([])
      refetchData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentData({
      ...row,
    });
  };

  return (
    <>
      <Helmet>
        <title> Đơn hàng mẫu | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Đơn hàng mẫu"
          links={[
            {
              name: 'Bán hàng',
            },
            {
              name: 'Đơn hàng mẫu',
            },
          ]}
          action={[
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              onClick={addItem}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>
          ]}
        />

        <Drawer
          open={openDrawer}
          anchor={'right'}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              width: {
                xs: 1,
                sm: 480,
                md: 900,
              },
            },
          }}
        >
          <Divider />
          <Scrollbar>
            <OrderSampleForm
              currentData={currentData}
              onClose={handleCloseDetails}
              isEdit={isEdit}
              refetchData={refetchData}

            />
          </Scrollbar>
        </Drawer>

        <Card>

          <OrderSampleTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterEndDate={filterEndDate}
            checked={checked}
            onFilterName={handleFilterName}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
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
                <Tooltip title="Xóa">
                  <IconButton color="primary" onClick={handleOpenConfirm}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Tooltip>
              }
            />
            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
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
                />

                <TableBody>
                  {(isLoading ? [...Array(rowsPerPage)] : tableData)
                    .map((row, index) =>
                      row ? (
                        <OrderSampleTableRow
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
    </>
  );
}

// --------------------------------------------------------------------
