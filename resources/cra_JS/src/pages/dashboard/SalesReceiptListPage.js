import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableContainer,
  Tabs,
  Tooltip,
} from '@mui/material';
// redux
import moment from 'moment';
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import { getSaleReceipt } from '../../redux/slices/saleReceipt';
import { getInternalOrg } from '../../redux/slices/internalOrg';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from '../../components/table';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import ConfirmDialog from '../../components/confirm-dialog';
// sections
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
import { SaleReceiptTableRow, SaleReceiptTableToolbar } from '../../sections/@dashboard/sales-receipt/list';
import PrintPage from '../../sections/@dashboard/sales-receipt/OrderDetail/PrintPage';
import SalesReceiptOrderRefundForm from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderRefundForm';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số chứng từ',
    id: 'code',
    minWidth: 160,
  },
  {
    label: 'Ngày chứng từ',
    id: 'date_code',
    minWidth: 160,
  },
  {
    label: 'Mã khách hàng',
    id: 'party_code',
    minWidth: 160,
  },
  {
    label: 'Tên khách hàng',
    id: 'party_name',
    minWidth: 160,
  },
  {
    label: 'Nhóm khách hàng',
    id: 'party_type',
    minWidth: 160,
  },
  {
    label: 'Người bán',
    id: 'employee',
    minWidth: 160,
  },
  {
    label: 'Tổng tiền',
    id: 'total_price',
    align: 'right',
    minWidth: 160,
  },
  {
    label: 'Trạng thái',
    id: 'status',
    minWidth: 160,
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function WarehouseExportPage() {
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

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { salesReceipt, isLoading, dataPaging, quantityForStatusTab } = useSelector((state) => state.saleReceipt);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const [tableData, setTableData] = useState([]);

  const [filterCode, setFilterCode] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [isEdit, setIsEdit] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [loadingPrint, setLoadingPrint] = useState(false);

  const [dataPrint, setDataPrint] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(null);

  const [loadingRefund, setLoadingRefund] = useState(false);

  const TABS = [
    { value: 'all', label: 'Tất cả', color: 'info', count: quantityForStatusTab?.all || 0 },
    { value: 'pending', label: 'Chờ duyệt', color: 'success', count: quantityForStatusTab?.pending || 0 },
    { value: 'payment', label: 'Thanh toán', color: 'warning', count: quantityForStatusTab?.payment || 0 },
    {
      value: 'pendingExportWarehouse',
      label: 'Chờ xuất kho',
      color: 'error',
      count: quantityForStatusTab?.pending_export_warehouse || 0,
    },
    {
      value: 'exportWarehouse',
      label: 'Xuất kho',
      color: 'secondary',
      count: quantityForStatusTab?.export_warehouse || 0,
    },
  ];

  useEffect(() => {
    const params = {
      filter_code: filterCode,
      status_tab: filterStatus,
      rows_per_page: rowsPerPage,
      page: page + 1,
      filter_warehouse: filterService,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
    };

    dispatch(getSaleReceipt(params));
  }, [dispatch, filterCode, filterStatus, filterStartDate, filterEndDate, filterService, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(salesReceipt);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(getInternalOrg());
  }, []);

  const refetchData = () => {
    dispatch(
      getSaleReceipt({
        filter_code: filterCode,
        status_tab: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
        filter_warehouse: filterService,
        filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
        filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
      })
    );
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered =
    filterCode !== '' ||
    filterService !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const isNotFound = (!tableData.length && !!filterCode) || (!isLoading && !tableData.length);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterCode = (event) => {
    setPage(0);
    setFilterCode(event.target.value);
  };

  const handleDeleteRows = async (selected) => {
    try {
      await axios.post('rm-sales-receipt', {
        ids: selected,
      });

      enqueueSnackbar('Xóa thành công!');

      refetchData();
      setSelected([]);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      handleCloseConfirm();
    }
  };

  const handleEditRow = (id) => {
    setIsEdit(true);
    navigate(PATH_DASHBOARD.salesReceipt.edit(id, 'edit'));
  };

  const handleConfirmRow = (id) => {
    setIsEdit(true);
    navigate(PATH_DASHBOARD.salesReceipt.edit(id, 'confirm'));
  };

  const handleExportRow = (id) => {
    setIsEdit(true);
    navigate(PATH_DASHBOARD.salesReceipt.edit(id, 'export'));
  };

  const handlePaymentRow = (id) => {
    setIsEdit(true);
    navigate(PATH_DASHBOARD.salesReceipt.payment(id, 'payment'));
  };

  const handleViewRow = (id) => {
    setIsEdit(true);
    // navigate(PATH_DASHBOARD.salesReceipt.edit(id, 'view'));
    navigate(PATH_DASHBOARD.salesReceipt.payment(id, 'view'));
  };

  const handleResetFilter = () => {
    setFilterCode('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterService('all');
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
    setSelected([]);
    // handleResetFilter();
  };

  const handleRefundRow = (id) => {
    setOpenDrawer(true);
    setIsEdit(false);
    setLoadingRefund(true);
    axios.post('get-sale-receipt-by-id', { id }).then((response) => {
      setCurrentOrder(response?.data?.data);
      setLoadingRefund(false);
    });
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  useEffect(() => {
    if (dataPrint) {
      setLoadingPrint(false);
      const divToPrint = document.getElementById('print-page');
      const newWin = window.open('');
      newWin.document.open();
      newWin.document.write(divToPrint.outerHTML);
      newWin.document.close();
      const checkReadyState = setInterval(() => {
        if (newWin.document.readyState === 'complete') {
          clearInterval(checkReadyState);
          newWin.print();
          newWin.close();
        }
      }, 100);
      setDataPrint(null);
    }
  }, [dataPrint]);

  return (
    <>
      <Helmet>
        <title> Danh sách đơn hàng | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        {loadingPrint ||
          (loadingRefund && (
            <Box className={'c-box__loading'}>
              <CircularProgress className={'c-box__loading__icon'} />
            </Box>
          ))}
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Đơn bán hàng"
          links={[
            {
              name: 'Bán hàng',
            },
            { name: 'Đơn hàng bán' },
          ]}
          action={
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              variant="contained"
              to={PATH_DASHBOARD.salesReceipt.create}
              component={RouterLink}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>
          }
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
                md: 800,
              },
            },
          }}
        >
          <SalesReceiptOrderRefundForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentOrder={currentOrder}
            internalOrgs={internalOrgs}
          />
        </Drawer>

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
          <SaleReceiptTableToolbar
            filterCode={filterCode}
            onFilterCode={handleFilterCode}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            onFilterService={handleFilterService}
            optionsService={internalOrgs}
            filterStartDate={filterStartDate}
            filterEndDate={filterEndDate}
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
                      <SaleReceiptTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row.id)}
                        onConfirmRow={() => handleConfirmRow(row.id)}
                        onExportRow={() => handleExportRow(row.id)}
                        onPaymentRow={() => handlePaymentRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onRefundRow={() => handleRefundRow(row.id)}
                        setLoadingPrint={(active) => setLoadingPrint(active)}
                        setDataPrint={setDataPrint}
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
      <PrintPage data={dataPrint} />
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content={
          <>
            Bạn có chắc chắn muốn xóa <strong> {selected.length} </strong> mục này?
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
