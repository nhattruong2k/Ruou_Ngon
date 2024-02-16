import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
// @mui
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
  Tab,
  Tabs,
} from '@mui/material';
//
import { getConclusionContract } from '../../redux/slices/conclusionContract';
import {
  ConclusionContractTableRow,
  ConclusionContractTableToolbar,
} from '../../sections/@dashboard/conclusion-contract/list';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

// components
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../components/table';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import ConfirmDialog from '../../components/confirm-dialog';
// sections
import ConclusionContractNewEditForm from '../../sections/@dashboard/conclusion-contract/ConclusionContractNewEditForm';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  {
    label: 'Khách hàng',
    id: 'party.name',
  },
  {
    label: 'Mã khách hàng',
    id: 'party.code',
  },
  {
    label: 'Loại hợp đồng',
    id: 'type_id',
  },
  {
    label: 'Ngày bắt đầu',
    id: 'date',
  },
  {
    label: 'Ngày hoàn thành',
    id: 'finish_day',
  },
  {
    label: 'Số hợp đồng',
    id: 'code',
  },
  {
    label: 'Tiền cọc',
    id: 'amount',
    align: 'right'
  },
  {
    label: 'ghi chú',
    id: 'comment',
  },
  {
    label: 'Trạng thái',
    id: 'status',
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function ConclusionContractListPage() {
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

  const { id } = useParams();

  const dispatch = useDispatch();

  const [filterName, setFilterName] = useState('');

  const [filterDate, setFilterDate] = useState(moment().format('YYYY'));

  const [openDrawer, setOpenDrawer] = useState(false);

  const [tableData, setTableData] = useState([]);

  const [filterCode, setFilterCode] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [isEdit, setIsEdit] = useState(false);

  const [isConfirm, setIsConfirm] = useState(false);

  const [isView, setIsView] = useState(false);

  const [filterStatus, setFilterStatus] = useState('contract_good');

  const [loadingPrint, setLoadingPrint] = useState(false);

  const [dataPrint, setDataPrint] = useState(null);

  const [currentConclusionContract, setCurrentConclusionContract] = useState({});

  const { contracts, isLoading, dataPaging } = useSelector((state) => state.conclusionContract);

  const TABS = [
    { value: 'contract_good', label: 'Hợp đồng sản phẩm', color: 'info' },
    { value: 'contract_travel', label: 'Hợp đồng du lịch', color: 'success' },
  ];

  useEffect(() => {
    const params = {
      filter_code: filterCode,
      status_tab: filterStatus,
      rows_per_page: rowsPerPage,
      page: page + 1,
      filter_contract: filterService,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
    };

    dispatch(getConclusionContract(params));
  }, [dispatch, filterCode, filterStatus, filterStartDate, filterEndDate, filterService, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(contracts);
    }
  }, [isLoading]);

  const handleResetFilter = () => {
    setFilterCode('');
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterService('all');
  };

  const isFiltered =
    filterCode !== '' ||
    filterService !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const refetchData = () => {
    dispatch(
      getConclusionContract({
        filter_code: filterCode,
        status_tab: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
        filter_contract: filterService,
        filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
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
      await axios.post('rm-conclusion-contract', {
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

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setIsConfirm(false);
    setIsView(false);
    setCurrentConclusionContract({
      ...row,
    });
  };

  const handleConfirmRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(false);
    setIsConfirm(true);
    setIsView(false);
    setCurrentConclusionContract({
      ...row,
    });
  };

  const handleViewRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(false);
    setIsConfirm(false);
    setIsView(true);
    setCurrentConclusionContract({
      ...row,
    });
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
    setSelected([]);
  };

  const addItem = () => {
    setCurrentConclusionContract({});
    setOpenDrawer(true);
    setIsEdit(false);
    setIsConfirm(false);
    setIsView(false);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      <Helmet>
        <title> Hợp đồng | Rượu Ngon</title>
      </Helmet>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Hợp đồng"
          links={[
            {
              name: 'Bán hàng',
              href: '#',
            },
            { name: 'Hợp đồng' },
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
        <Card>
          <Tabs value={filterStatus} onChange={handleFilterStatus} sx={{ px: 2, bgcolor: 'background.neutral' }}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          <ConclusionContractTableToolbar
            filterCode={filterCode}
            onFilterCode={handleFilterCode}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            onFilterService={handleFilterService}
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
                      <ConclusionContractTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row)}
                        onConfirmRow={() => handleConfirmRow(row)}
                        onViewRow={() => handleViewRow(row)}
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
          <ConclusionContractNewEditForm
            isEdit={isEdit}
            isView={isView}
            isConfirm={isConfirm}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentConclusionContract={currentConclusionContract}
          />
        </Drawer>
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
