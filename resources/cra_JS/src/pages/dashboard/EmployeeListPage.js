import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Card, Table, Button, Tooltip, TableBody, Container, IconButton, TableContainer, Drawer } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import { getEmployees } from '../../redux/slices/employee';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
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
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import ConfirmDialog from '../../components/confirm-dialog';
// sections
import { EmployeeTableRow, EmployeeTableToolbar } from '../../sections/@dashboard/employee/list';
import EmployeeNewEditForm from '../../sections/@dashboard/employee/EmployeeAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------
const STATUS = [
  { id: 1, name: 'Hoạt động' },
  { id: 0, name: 'Ngừng hoạt động' },
]

const TABLE_HEAD = [
  {
    label: 'Tên nhân viên',
    id: 'name',
    minWidth: 220
  },
  {
    label: 'Mã nhân viên',
    id: 'code',
    minWidth: 160,
  },
  {
    label: 'Tài khoản',
    id: 'username',
    minWidth: 160,
  },
  {
    label: 'Email',
    id: 'email',
    minWidth: 160,
  },
  {
    label: 'Số ĐT',
    id: 'phone',
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

export default function EcommerceProductListPage() {
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
  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { employees, isLoading, dataPaging } = useSelector((state) => state.employee);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState({});

  useEffect(() => {
    const params = {
      name: filterName,
      employee_status_id: filterService,
      rows_per_page: rowsPerPage,
      page: page + 1
    };

    dispatch(getEmployees(params));
  }, [dispatch, filterName, filterService, page, rowsPerPage]);

  useEffect(() => {

    if (!isLoading) {
      setTableData(employees);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(getEmployees({
      name: filterName,
      internal_org_type_id: filterService,
      rows_per_page: rowsPerPage,
      page: page + 1
    }));
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered = filterName !== '' || !!filterStatus.length || filterService !== 'all';

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

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

  const handleFilterStatus = (event) => {
    setPage(0);
    setFilterStatus(event.target.value);
  };

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('employees/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');

      refetchData();
      setSelected([])
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentEmployee({
      ...row,
    });
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.eCommerce.view(paramCase(id)));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus([]);
    setFilterService('all');
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentEmployee(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };
  return (
    <>
      <Helmet>
        <title> Danh sách nhân viên | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Danh sách nhân viên"
          links={[
            {
              name: 'Hệ thống',
            },
            { name: 'Nhân viên' },
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
                md: 700,
              },
            },
          }}
        >
          <EmployeeNewEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentEmployee={currentEmployee}
          />
        </Drawer>

        <Card>
          <EmployeeTableToolbar
            filterName={filterName}
            filterStatus={filterStatus}
            onFilterName={handleFilterName}
            onFilterStatus={handleFilterStatus}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            optionsService={STATUS}
            onFilterService={handleFilterService}
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
                  {(isLoading ? [...Array(rowsPerPage)] : tableData)
                    .map((row, index) =>
                      row ? (
                        <EmployeeTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRows([row.id])}
                          onEditRow={() => handleEditRow(row)}
                          onViewRow={() => handleViewRow(row.name)}
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
