import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  Drawer,
} from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import { getPermissions } from '../../redux/slices/permission';
import { getRoles } from '../../redux/slices/role';
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
import NewEditForm from '../../sections/@dashboard/role/AddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
import Toolbar from '../../sections/@dashboard/role/list/Toolbar';
import ViewTableRow from '../../sections/@dashboard/role/list/ViewTableRow';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'STT',
    id: 'id',
    width: 15,
  },
  {
    label: 'Tên vai trò',
    id: 'name',
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function RoleListPage() {
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

  const dispatch = useDispatch();

  const { permissions, screens } = useSelector((state) => state.permission);

  const { roles, isLoading } = useSelector((state) => state.role);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentPermistion, setCurrentPermistion] = useState({});

  const [pagePagination, setPagePagination] = useState(0);

  useEffect(() => {
    const params = {
      name: filterName,
      screen: filterStatus
    };

    dispatch(getRoles(params));
  }, [dispatch, filterName, filterStatus]);

  useEffect(() => {
    dispatch(getPermissions({}));
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(roles);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getRoles({
        name: filterName,
        screen: filterStatus
      })
    );
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered = filterName !== '';

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

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(event.target.value);

  };

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('rm-category', {
        ids: selected,
        currentTab: filterStatus
      });

      enqueueSnackbar('Xóa thành công!');

      refetchData();
      setSelected([]);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentPermistion({
      ...row,
    });
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentPermistion(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };
  return (
    <>
      <Helmet>
        <title>Danh sách vai trò | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Danh sách vai trò"
          links={[
            {
              name: 'Phân quyền',
            },
            { name: 'Vai trò' },
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
          <NewEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentPermistion={currentPermistion}
            filterStatus={filterStatus}
            permissions={permissions}
            screens={screens}
          />
        </Drawer>

        <Card>

          <Toolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            onResetFilter={handleResetFilter}
            isFiltered={isFiltered}
            optionsService={screens}
            filterStatus={filterStatus}
            screens={screens}
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
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                />

                <TableBody>
                  {(isLoading ? [...Array(rowsPerPage)] : tableData).map((row, index) =>
                    row ? (
                      <ViewTableRow
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

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={pagePagination || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
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
