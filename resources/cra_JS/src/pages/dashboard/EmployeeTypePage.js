import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import sumBy from 'lodash/sumBy';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../style/style.css';
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
  Typography,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// utils
import { fTimestamp } from '../../utils/formatTime';
// _mock_
import { _invoices } from '../../_mock/arrays';
// components
import Label from '../../components/label';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

import {
  useTable,
  getComparator,
  TableSelectedAction,
} from '../../components/table';
// sections
import { EmployeeTableRow, EmployeeTableToolbar } from '../../sections/@dashboard/employee/list';
import EmployeeToolbar from '../../sections/@dashboard/employee/EmployeeSbrToolbar';
import EmployeeNewEditForm from '../../sections/@dashboard/employee/EmployeeAddNewAndEditForm';
// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'all',
  'full stack development',
  'backend development',
  'ui design',
  'ui/ux design',
  'front end development',
];

const columnDefs = [{
  headerName: 'Tên nhân viên',
  field: 'name',
  minWidth: 200,
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: true,
  checkboxSelection: true,
  filter: 'agTextColumnFilter',
  cellStyle: {
    cursor: 'pointer'
  }
},
{
  minWidth: 200,
  headerName: 'Mã nhân viên',
  field: 'code',
  cellEditor: 'agSelectCellEditor',
  filter: 'agSetColumnFilter',
  filterParams: { applyMiniFilterWhileTyping: true },
},
{
  minWidth: 200,
  headerName: 'Nhóm nhân viên',
  field: 'employee_type_name',
  cellEditor: 'agSelectCellEditor',
  filter: 'agSetColumnFilter',
  filterParams: { applyMiniFilterWhileTyping: true },
},
{
  minWidth: 170,
  headerName: 'Ngày vào làm',
  cellEditor: 'agSelectCellEditor',
  filter: 'agSetColumnFilter',
  field: 'hire_date'
},
{
  minWidth: 170,
  headerName: 'Date of birth',
  cellEditor: 'agSelectCellEditor',
  filter: 'agSetColumnFilter',
  field: 'date_of_birth'
},
{
  minWidth: 170,
  headerName: 'CCCD',
  filter: 'agTextColumnFilter',
  field: 'identification_number'
},
{
  minWidth: 170,
  headerName: 'Ngày cấp',
  cellEditor: 'agSelectCellEditor',
  filter: 'agSetColumnFilter',
  field: 'identification_issue_date'
},
{
  minWidth: 180,
  headerName: 'Ngày hết hạn',
  filter: 'agTextColumnFilter',
  field: 'identification_issue_expire'
},
{
  minWidth: 180,
  headerName: 'Nơi cấp',
  filter: 'agTextColumnFilter',
  field: 'identification_issue_place'
},
{
  minWidth: 150,
  filter: 'agTextColumnFilter',
  headerName: 'Địa chỉ nhà',
  field: 'address'
},
{
  minWidth: 170,
  filter: 'agTextColumnFilter',
  headerName: 'Trình độ',
  field: 'qualification'
},
{
  minWidth: 170,
  filter: 'agTextColumnFilter',
  headerName: 'Số điện thoại',
  field: 'phone'
}
]

const TABLE_HEAD = [
  { id: 'name', label: 'Tên nhân viên', align: 'left' },
  { id: 'code', label: 'Mã nhân viên', align: 'left'},
  { id: 'employee_type_name', label: 'Nhóm nhân viên', align: 'left' },
  { id: 'hire_date', label: 'Hire date', align: 'left' },
  { id: 'sex', label: 'Giới tính', align: 'left'},
  { id: 'date_of_birth', label: 'Ngày sinh', align: 'left'},
  { id: 'indentification_number', label: 'Cmt/passport/hc', align: 'left'},
  { id: 'indentification_issue_date', label: 'Ngày phát hành', align: 'left'},
  { id: 'indentification_expire_date', label: 'Ngày hết hạn', align: 'left'},
  { id: 'indentification_issue_place', label: 'Nơi cấp', align: 'left'},
//   { id: 'qualification', label: 'Trình độ', align: 'left'},
//   { id: 'phone', label: 'SDT', align: 'left'},
//   { id: 'address', label: 'Địa chỉ', align: 'left'}
//   { id: 'property', label: 'Thuộc tính mở rộng', align: 'left'}
];

// ----------------------------------------------------------------------

export default function EmployeeTypePage() {
  const theme = useTheme();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

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
  } = useTable({ defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState(_invoices);

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterStatus !== 'all' || filterName !== '' || filterService !== 'all' || (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const getLengthByStatus = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalPriceByStatus = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalPrice'
    );

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: tableData.length },
    { value: 'all', label: 'Active', color: 'info', count: tableData.length },
    { value: 'Probation', label: 'Probation', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'paid', label: 'Quited', color: 'success', count: getLengthByStatus('paid') }
  ];

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

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const handleDeleteRow = (id) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteRows = (selected) => {
    const deleteRows = tableData.filter((row) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === dataFiltered.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleEditRow = (id) => {
    navigate(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.invoice.view(id));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Helmet>
        <title> Employee type: List | Odinbi</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Danh sách nhân viên"
          links={[
            {
              name: 'Trang chủ',
            },
            {
              name: 'Nhân viên',
            },
            {
              name: 'Danh sách',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              onClick={toggleDrawer(true)}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Tạo mới
            </Button>
          }
        />

        <Drawer open={openDrawer} anchor={'right'} onClose={toggleDrawer(false)} PaperProps={{sx: {width: 800}}}>
          <EmployeeToolbar />
          <Divider />
          <Scrollbar>
          <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
              p: 2.5
              }}
              >
              <Typography variant="subtitle1"> Thêm thông tin nhân viên </Typography>
          </Stack>

          <EmployeeNewEditForm />
          </Scrollbar>
        </Drawer>

        <Card>
        <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
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
          <EmployeeTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            optionsService={SERVICE_OPTIONS}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterService={handleFilterService}
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
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="ic:round-send" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="eva:printer-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
            <div
            className="ag-theme-alpine"
            style={{
              height: 550,
              width: '100%',
            }}
          >
            <AgGridReact headerHeight={'56'} rowSelection={'multiple'} defaultColDef={defaultColDef} rowData={[]} columnDefs={columnDefs}  pagination={'true'}>
              <></>
            </AgGridReact>
          </div>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
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
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  }

  if (filterService !== 'all') {
    inputData = inputData.filter((invoice) => invoice.items.some((c) => c.service === filterService));
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (invoice) =>
        fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
        fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
