import { Helmet } from 'react-helmet-async';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableContainer,
  Tabs,
  Tooltip,
} from '@mui/material';
import moment from 'moment';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import '../style/style.css';
import axios from '../../utils/axios';
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
import { ImportWarehouseTableRow, ImportWarehouseTableToolbar } from '../../sections/@dashboard/import-warahouse/list';
import ImportWarehouseAddNewEditForm from '../../sections/@dashboard/import-warahouse/ImportWarehouseAddNewEditForm';
import { getOrderImportBuy } from '../../redux/slices/importWarehouse';
import { getInternalOrg } from '../../redux/slices/internalOrg';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
import { FUNCTIONS, STATUSES } from '../../utils/constant';
import { PATH_DASHBOARD } from '../../routes/paths';
import SalesReceiptOrderRefundForm from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderRefundForm';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số CT nhập',
    id: 'code',
    width: 200,
    minWidth: 200,
  },
  {
    label: 'Ngày chứng từ',
    id: 'name',
    minWidth: 160,
  },
  {
    label: 'Kho nhập',
    id: 'warehouse_import',
    minWidth: 200,
  },
  {
    label: 'Số CT bán hàng',
    id: 'code_sale_receipt',
    minWidth: 160,
  },
  {
    label: 'Số CT xuất',
    id: 'code_export',
    width: 200,
    minWidth: 200,
  },
  {
    label: 'Kho xuất',
    id: 'warehouse_export',
    minWidth: 200,
  },
  {
    label: 'Loại nhập',
    id: 'function_id',
    minWidth: 160,
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    minWidth: 160,
    align: 'right',
  },
  {
    label: 'Trạng thái',
    id: 'status',
    minWidth: 160,
  },
  {
    label: 'Lý do',
    id: 'comment',
    minWidth: 220,
  },
  {
    id: '',
  },
];

export default function ImportWarehouseListPage() {
  const { themeStretch } = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

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

  const navigate = useNavigate();

  const [tableHead, setTableHead] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterInternal, setFilterInternal] = useState('all');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterType, setFilterType] = useState(1);

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [openDrawer, setOpenDrawer] = useState(false);

  const [checked, setChecked] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(null);

  const [rowSelected, setRowSelected] = useState(0);

  const [tableData, setTableData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const { orders, functions, orderStatus, isLoadingImportWarehouse, dataPaging } = useSelector(
    (state) => state.importWarehouse
  );

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const isFiltered =
    filterStatus !== 'all' ||
    filterName !== '' ||
    filterInternal !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!tableData.length && !!filterName) || (!isLoadingImportWarehouse && !tableData.length);

  useEffect(() => {
    if (id) {
      getOrderImportById(id);
    }
  }, [id]);

  const getOrderImportById = async (id) => {
    await axios.get(`get-order-import-by-id/${id}`).then((response) => {
      setCurrentOrder(response?.data?.data);
      setOpenDrawer(true);
      setIsEdit(true);
    });
  };

  useEffect(() => {
    dispatch(
      getOrderImportBuy({
        filter_name: filterName,
        function_id: filterType,
        rows_per_page: rowsPerPage,
        order_status_id: filterStatus,
        page: page + 1,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
        filter_warehouse: filterInternal,
      })
    );
  }, [
    dispatch,
    filterType,
    filterName,
    page,
    rowsPerPage,
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterInternal,
  ]);

  useEffect(() => {
    if (filterType === 3) {
      const TABLEHEAD = TABLE_HEAD.filter((item) => item.id !== 'code_sale_receipt');
      setTableHead(TABLEHEAD);
    } else if (filterType === FUNCTIONS.import_refund) {
      const TABLEHEAD = TABLE_HEAD.filter((item) => item.id !== 'code_export' && item.id !== 'warehouse_export');
      setTableHead(TABLEHEAD);
    } else {
      const TABLEHEAD = TABLE_HEAD.filter(
        (item) => item.id !== 'code_export' && item.id !== 'warehouse_export' && item.id !== 'code_sale_receipt'
      );
      setTableHead(TABLEHEAD);
    }
  }, [filterType]);

  useEffect(() => {
    dispatch(getInternalOrg({}));
  }, []);

  useEffect(() => {
    if (!isLoadingImportWarehouse) {
      setTableData(orders);
    }
  }, [isLoadingImportWarehouse]);

  const refetchData = () => {
    dispatch(
      getOrderImportBuy({
        filter_name: filterName,
        function_id: filterType,
        rows_per_page: rowsPerPage,
        order_status_id: filterStatus,
        page: page + 1,
      })
    );
  };

  const TABS = functions.map((item) => ({
    value: item.id,
    label: item.name,
    color: 'success',
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
    setFilterStatus(event.target.value);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterType = (event, newValue) => {
    setPage(0);
    setFilterType(newValue);
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
    setCurrentOrder(null);
  };

  const handleDeleteRows = async (selected) => {
    let isvald = true;
    selected.forEach((element) => {
      const filter = orders.filter(
        (item) =>
          item.id === element && item.order_status_id >= 2 && item.order_status_id !== STATUSES.pending_sale_receipt
      );
      if (filter.length > 0) {
        isvald = false;
      }
    });
    if (isvald) {
      try {
        const response = await axios.post('order-import-warehouses/0', {
          ids: selected,
          _method: 'DELETE',
        });

        enqueueSnackbar('Xóa thành công!');
        setSelected([]);
        refetchData();
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Không thể xóa phiếu nhập đã xác nhận hoặc đã duyệt! Vui lòng kiểm tra lại.', {
        variant: 'error',
      });
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    // setFilterType(1);
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentOrder({
      ...row,
    });
  };

  const handleConfirmRow = async (row) => {
    navigate(PATH_DASHBOARD.refundOrder.edit(row?.id));
    // setIsEdit(true);
    // setIsLoading(true);

    // await axios.post('get-order-refund-by-id', { id: row.id }).then((response) => {
    //   const dataResponse = response?.data?.data;
    //   const orderRefundItems = dataResponse.order_refund.order_items;
    //   const orderSaleReceiptItems = dataResponse.order_sale_receipt.order_items;

    //   const newOrderItems = orderRefundItems.map((itemRefund) => {
    //     const { quantity } = orderSaleReceiptItems.filter(
    //       (itemSaleReceipt) => itemSaleReceipt.good_id === itemRefund.good_id
    //     )[0];
    //     return {
    //       ...itemRefund,
    //       quantity,
    //       quantityRefund: itemRefund.quantity,
    //     };
    //   });

    //   const dataCurrentOrder = {
    //     ...dataResponse.order_refund,
    //     order_items: newOrderItems,
    //     codeSaleReceipt: dataResponse.order_sale_receipt?.code,
    //   };

    //   setCurrentOrder(dataCurrentOrder);
    //   setOpenDrawer(true);
    //   setIsLoading(false);
    // });
  };

  const handleViewRow = async (row) => {
    setIsEdit(true);
    setIsLoading(true);

    await axios.post('get-order-refund-by-id', { id: row.id }).then((response) => {
      const dataResponse = response?.data?.data;
      const orderRefundItems = dataResponse.order_refund.order_items;
      const orderSaleReceiptItems = dataResponse.order_sale_receipt.order_items;

      const newOrderItems = orderRefundItems.map((itemRefund) => {
        const { quantity } = orderSaleReceiptItems.filter(
          (itemSaleReceipt) => itemSaleReceipt.good_id === itemRefund.good_id
        )[0];
        return {
          ...itemRefund,
          quantity,
          quantityRefund: itemRefund.quantity,
        };
      });

      const dataCurrentOrder = {
        ...dataResponse.order_refund,
        order_items: newOrderItems,
        codeSaleReceipt: dataResponse.order_sale_receipt?.code,
      };

      setCurrentOrder(dataCurrentOrder);
      setOpenDrawer(true);
      setIsLoading(false);
    });
  };

  return (
    <>
      <Helmet>
        <title> Danh sách nhập kho | Rượu ngon</title>
      </Helmet>

      {isLoading && (
        <Box className={'c-box__loading'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="DS nhập kho"
          links={[
            {
              name: 'Kho',
            },
            {
              name: 'DS Nhập kho',
            },
          ]}
          action={[
            filterType !== 3 && filterType !== FUNCTIONS.import_refund && (
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
            ),
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
                md: 800,
              },
            },
          }}
        >
          <Divider />
          <Scrollbar>
            {currentOrder?.order_status_id === STATUSES.pending_sale_receipt ||
              currentOrder?.order_status_id === STATUSES.refund_sale_receipt ? (
              <SalesReceiptOrderRefundForm
                isEdit={isEdit}
                refetchData={refetchData}
                onClose={handleCloseDetails}
                currentOrder={currentOrder}
              />
            ) : (
              <ImportWarehouseAddNewEditForm
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                onClose={handleCloseDetails}
                isEdit={isEdit}
                refetchData={refetchData}
                functions={functions}
                filterType={filterType}
              />
            )}
          </Scrollbar>
        </Drawer>

        <Card>
          {isLoadingImportWarehouse && (
            <Box className={'c-box__loading_v2'}>
              <CircularProgress className={'c-box__loading__icon'} />
            </Box>
          )}

          <Tabs value={filterType} onChange={handleFilterType} sx={{ px: 2, bgcolor: 'background.neutral' }}>
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
          <ImportWarehouseTableToolbar
            filterService={filterStatus}
            filterName={filterName}
            isFiltered={isFiltered}
            filterType={filterType}
            filterEndDate={filterEndDate}
            checked={checked}
            onFilterService={handleFilterStatus}
            onFilterName={handleFilterName}
            optionsService={orderStatus}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterType={handleFilterType}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
            internalOrgs={internalOrgs}
            onFilterInternal={(newValue) => {
              setFilterInternal(newValue?.target?.value || 'all');
            }}
            filterWarehouse={filterInternal}
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
                  headLabel={tableHead}
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
                  {(isLoadingImportWarehouse ? [...Array(rowsPerPage)] : tableData).map((row, index) =>
                    row ? (
                      <ImportWarehouseTableRow
                        filterType={filterType}
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row)}
                        onConfirmRow={() => handleConfirmRow(row)}
                        onViewRow={() => handleViewRow(row)}
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
