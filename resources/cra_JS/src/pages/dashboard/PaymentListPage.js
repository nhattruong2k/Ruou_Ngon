import { Helmet } from 'react-helmet-async';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableContainer,
  Tabs,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import axios from '../../utils/axios';
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from '../../components/table';
// sections
import PaymentTableRow from '../../sections/@dashboard/payment-order-multiple/list/PaymentTableRow';
import PaymentTableToolbar from '../../sections/@dashboard/payment-order-multiple/list/PaymentTableToolbar';
import { getPayment } from '../../redux/slices/paymentOrder';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số chứng từ',
    id: 'code',
    minWidth: 160
  },
  {
    label: 'Ngày chứng từ',
    id: 'date',
    minWidth: 160
  },
  {
    label: 'Tên khách hàng',
    id: 'party_name',
    minWidth: 180,
  },
  {
    label: 'Mã khách hàng',
    id: 'party_code',
    minWidth: 140,
  },
  {
    label: 'Người tạo phiếu',
    id: 'user_name',
    minWidth: 180,
  },
  {
    label: 'Tổng tiền',
    id: 'total_amount',
    align: 'right',
    minWidth: 180,
  },
  {
    label: 'File đính kèm',
    id: 'attachment',
    minWidth: 180,
  },
  {
    label: 'Trạng thái',
    id: 'payment_status',
    minWidth: 160,
  },
  {
    id: '',
  },
];

export default function PaymentListPage() {
  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const gridRef = useRef();

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

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [checked, setChecked] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentParty, setCurrentParty] = useState(null);

  const [rowSelected, setRowSelected] = useState(0);

  const [tableData, setTableData] = useState([]);

  const { payments, paymentStatus, isLoading, dataPaging } = useSelector((state) => state.paymentOrder);

  const isFiltered = filterStatus !== 'all' || filterName !== '' || (!!filterStartDate && !!filterEndDate);

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  useEffect(() => {
    dispatch(
      getPayment({
        filter_name: filterName,
        filter_status: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  }, [dispatch, filterName, filterStatus, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(payments);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getPayment({
        filter_name: filterName,
        filter_status: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  };

  const updatedPaymentStatus = [...paymentStatus];

  updatedPaymentStatus.unshift({
    id: 'all',
    name: 'Tất cả',
    count: paymentStatus?.reduce((accumulator, item) => {
      return accumulator + Number(item.count);
    }, 0),
  });

  const TABS = updatedPaymentStatus.map((item) => ({
    value: item.id,
    label: item.name,
    color: (item.id === 1 && 'warning') || (item.id === 2 && 'success') || (item.id === 3 && 'error') || 'info',
    count: item.count,
  }));

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

  const addItem = (id) => {
    navigate(PATH_DASHBOARD.paymentMultipleOrder.create);
  };

  const handleDeleteRows = async (selected) => {
    try {
      await axios.post('payment-multiple-orders/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');
      setSelected([]);
      refetchData();
    } catch (error) {
      handleCloseConfirm();
      enqueueSnackbar(error.message, { variant: 'error', autoHideDuration: 5000 });
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  const handleEditRow = (id) => {
    navigate(PATH_DASHBOARD.paymentMultipleOrder.edit(id));
  };

  return (
    <>
      <Helmet>
        <title> Danh sách thanh toán | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="DS thanh toán"
          links={[
            {
              name: 'QLTT',
            },
            {
              name: 'DS thanh toán',
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
              Tạo thanh toán
            </Button>,
          ]}
        />

        <Card>
          {isLoading && (
            <Box className={'c-box__loading_v2'}>
              <CircularProgress className={'c-box__loading__icon'} />
            </Box>
          )}
          <Tabs value={filterStatus} onChange={handleFilterStatus} sx={{ px: 2, bgcolor: 'background.neutral' }}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label color={tab.color} sx={{ mr: 1 }}>
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <PaymentTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterEndDate={filterEndDate}
            checked={checked}
            onFilterName={handleFilterName}
            optionsService={[]}
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
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                  {(isLoading ? [...Array(rowsPerPage)] : tableData).map((row, index) =>
                    row ? (
                      <PaymentTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ) : (
                      !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    )
                  )}
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
