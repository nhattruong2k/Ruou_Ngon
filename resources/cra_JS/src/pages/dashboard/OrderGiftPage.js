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

import { getOrderGift } from '../../redux/slices/orderGift';
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
import { OrderGiftTableRow, OrderGiftTableToolbar } from '../../sections/@dashboard/order-gift/list';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số chứng từ',
    id: 'code',
  },
  {
    label: 'Ngày chứng từ',
    id: 'date_code',
  },
  {
    label: 'Mã khách hàng',
    id: 'party_code',
  },
  {
    label: 'Tên khách hàng',
    id: 'party_name',
  },
  {
    label: 'Người bán',
    id: 'employee',
  },
  {
    label: 'Tổng tiền',
    id: 'total_price',
    align: 'right'
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

  const { orderGifts, isLoading, dataPaging, quantityForStatusTab } = useSelector((state) => state.orderGift);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const [tableData, setTableData] = useState([]);

  const [filterCode, setFilterCode] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [filterStatus, setFilterStatus] = useState('all');

  const TABS = [
    { value: 'all', label: 'Tất cả', color: 'info', count: quantityForStatusTab?.all || 0 },
    { value: 'created', label: 'Xuất kho', color: 'warning', count: quantityForStatusTab?.created || 0 },
    { value: 'exported', label: 'Đã xuất kho', color: 'success', count: quantityForStatusTab?.exported || 0 },
  ];

  useEffect(() => {
    const params = {
      filter_code: filterCode,
      status_tab: filterStatus,
      rows_per_page: rowsPerPage,
      page: page + 1,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
    };

    dispatch(getOrderGift(params));
  }, [dispatch, filterCode, filterStatus, filterStartDate, filterEndDate, filterService, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(orderGifts);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(getInternalOrg());
  }, []);

  const handleResetFilter = () => {
    setFilterCode('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterService('all');
  };

  const isFiltered =
    filterCode !== '' ||
    filterStatus !== 'all' ||
    filterService !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const refetchData = () => {
    dispatch(
      getOrderGift({
        filter_code: filterCode,
        status_tab: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
        filter_start_date: filterStartDate
          ? moment(filterStartDate).format('YYYY-MM-DD')
          : moment().subtract(30, 'd').format('YYYY-MM-DD'),
        filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
      })
    );
  };

  const denseHeight = dense ? 60 : 80;

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
      await axios.post('rm-order-gift', {
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
    navigate(PATH_DASHBOARD.orderGift.edit(id, 'edit'));
  };

  const handleExportRow = (id) => {
    navigate(PATH_DASHBOARD.orderGift.edit(id, 'export'));
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.orderGift.edit(id, 'view'));
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
    setSelected([]);
    handleResetFilter();
  };

  return (
    <>
      <Helmet>
        <title> Danh sách đơn hàng tặng | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Đơn hàng tặng"
          links={[
            {
              name: 'Bán hàng',
            },
            { name: 'DS hàng tặng' },
          ]}
          action={
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              variant="contained"
              to={PATH_DASHBOARD.orderGift.create}
              component={RouterLink}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>
          }
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
          <OrderGiftTableToolbar
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
                      <OrderGiftTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row.id)}
                        onExportRow={() => handleExportRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
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
