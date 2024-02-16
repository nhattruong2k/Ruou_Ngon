import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import '../style/style.css';
import { getWarehouseExport } from '../../redux/slices/warehouseExport';
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
import { WarehouseExportTableRow, WareHouseTableToolbar } from '../../sections/@dashboard/warehouse-export/list';
import WarehouseExportAddNewAndEditForm from '../../sections/@dashboard/warehouse-export/WarehouseExportAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
import { getInternalOrg } from '../../redux/slices/internalOrg';
import Label from '../../components/label';
import { FUNCTIONS } from '../../utils/constant';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số chứng từ',
    id: 'code',
    minWidth: 180,
  },
  {
    label: 'Ngày chứng từ',
    id: 'date_code',
    minWidth: 180,
  },
  {
    label: 'Kho xuất',
    id: 'warehouse_export',
    minWidth: 200,
  },
  {
    label: 'Kho nhập',
    id: 'warehouse_import',
    minWidth: 200,
  },
  {
    label: 'Loại xuất',
    id: 'type',
    minWidth: 160,
  },
  {
    label: 'trạng thái',
    id: 'status',
    minWidth: 160,
  },
  {
    label: 'Người xuất',
    id: 'employee',
    minWidth: 160,
  },
  {
    label: 'Số lượng',
    id: 'quantity',
    minWidth: 160,
    align: 'right'
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

  const { id } = useParams();

  const [filterStatus, setFilterStatus] = useState('all');

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { warehouseExports, typeExports, orderStatus, isLoading, dataPaging } = useSelector(
    (state) => state.warehouseExport
  );

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const [tableData, setTableData] = useState([]);

  const [filterCode, setFilterCode] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentOrder, setCurrentOrder] = useState({});

  const [filterTypeExport, setFilterTypeExport] = useState(FUNCTIONS.export_orther);

  const [headerTable, setHeaderTable] = useState(TABLE_HEAD.filter((item) => item.id !== 'warehouse_import'));

  const TABS = typeExports.map((typeExport) => ({
    value: typeExport.id,
    label: typeExport.name,
    color: 'success',
    count: typeExport.count,
  }));

  useEffect(() => {
    const params = {
      filter_code: filterCode,
      function_id: filterTypeExport,
      rows_per_page: rowsPerPage,
      page: page + 1,
      filter_warehouse: filterService,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
      filter_status: filterStatus,
    };

    dispatch(getWarehouseExport(params));
  }, [
    dispatch,
    filterCode,
    filterTypeExport,
    filterStartDate,
    filterEndDate,
    filterService,
    page,
    rowsPerPage,
    filterStatus,
  ]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(warehouseExports);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(getInternalOrg());
  }, []);

  const refetchData = () => {
    dispatch(
      getWarehouseExport({
        filter_code: filterCode,
        function_id: filterTypeExport,
        rows_per_page: rowsPerPage,
        page: page + 1,
        filter_warehouse: filterService,
        filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
        filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
        filter_status: filterStatus,
      })
    );
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered =
    filterCode !== '' ||
    filterService !== 'all' ||
    filterStatus !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const isNotFound = (!tableData.length && !!filterCode) || (!isLoading && !tableData.length);

  useEffect(() => {
    if (id) {
      getOrderExportById(id);
    }
  }, [id]);

  const getOrderExportById = async (id) => {
    await axios.get(`get-order-export-by-id/${id}`).then((response) => {
      setCurrentOrder(response?.data?.data);
      setOpenDrawer(true);
      setIsEdit(true);
    });
  };

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

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(event.target.value);
  };

  const handleDeleteRows = async (selected) => {
    try {
      await axios.post('warehouse-export/0', {
        ids: selected,
        function_id: filterTypeExport,
        _method: 'DELETE',
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

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentOrder({
      ...row,
    });
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.eCommerce.view(paramCase(id)));
  };

  const handleResetFilter = () => {
    setFilterCode('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterService('all');
    setFilterStatus('all');
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentOrder(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const handleFilterTypeExport = (event, newValue) => {
    setPage(0);
    setFilterTypeExport(newValue);
    setSelected([]);
    if (newValue === FUNCTIONS.export_orther)
      setHeaderTable(TABLE_HEAD.filter((item) => item.id !== 'warehouse_import'));
    else setHeaderTable(TABLE_HEAD);
  };

  return (
    <>
      <Helmet>
        <title> Danh sách xuất kho | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="DS xuất kho"
          links={[
            {
              name: 'Kho',
            },
            { name: 'DS xuất kho' },
          ]}
          action={
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
          <WarehouseExportAddNewAndEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentOrder={currentOrder}
            internalOrgs={internalOrgs}
            typeExports={typeExports}
            filterTypeExport={filterTypeExport}
          />
        </Drawer>

        <Card>
          {isLoading && (
            <Box className={'c-box__loading_v2'}>
              <CircularProgress className={'c-box__loading__icon'} />
            </Box>
          )}
          <Tabs
            value={filterTypeExport}
            onChange={handleFilterTypeExport}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
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
          <WareHouseTableToolbar
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
            filterStatus={filterStatus}
            optionsStatus={orderStatus}
            onFilterStatus={handleFilterStatus}
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
                  headLabel={headerTable}
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
                      <WarehouseExportTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row)}
                        onViewRow={() => handleViewRow(row.name)}
                        isExportTransfer={filterTypeExport === FUNCTIONS.export_transfer}
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
