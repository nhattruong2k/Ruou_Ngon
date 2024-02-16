import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Button, Card, Container, Drawer, IconButton, Table, TableBody, TableContainer, Tooltip } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

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
import { OrganiztionTableRow, OrganiztionTableToolbar } from '../../sections/@dashboard/organization/list';
import OrganizationAddNewAndEditForm from '../../sections/@dashboard/organization/OrganizationAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------
import { PAGES_ID } from '../../utils/constant';
import { usePermission } from '../../auth/usePermission';
import { resetWards } from '../../redux/slices/geographicBoundaries';

const TABLE_HEAD1 = [
  { id: 'name', label: 'Product', align: 'left' },
  { id: 'createdAt', label: 'Create at', align: 'left' },
  { id: 'inventoryType', label: 'Status', align: 'center', width: 180 },
  { id: 'price', label: 'Price', align: 'right' },
  { id: '' },
];
const TABLE_HEAD = [
  {
    label: 'Tên tổ chức',
    id: 'name',
    minWidth: 220,
  },
  {
    label: 'Mã tổ chức',
    id: 'code',
    minWidth: 150,
  },
  {
    label: 'Địa chỉ ',
    id: 'address',
    minWidth: 200,
  },
  {
    label: 'Phường (Xã)',
    id: 'ward_name',
    minWidth: 200,
  },
  {
    label: 'Quận (Huyện)',
    id: 'district_name',
    minWidth: 200,
  },
  {
    label: 'Tỉnh (Thành Phố)',
    id: 'province_name',
    minWidth: 200,
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
    defaultRowsPerPage: 10,
  });

  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { internalOrgs, isLoading, dataPaging } = useSelector((state) => state.internalOrg);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentInternalOrg, setCurentInternalOrg] = useState({});

  const userPermissions = usePermission(PAGES_ID.internal_orgs);

  useEffect(() => {
    const params = {
      name: filterName,
      internal_org_type_id: filterService,
      rows_per_page: rowsPerPage,
      page: page + 1,
    };
    dispatch(getInternalOrg(params));
  }, [dispatch, filterName, filterService, page, rowsPerPage]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(internalOrgs);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getInternalOrg({
        name: filterName,
        internal_org_type_id: filterService,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  };

  const dataFiltered = [];

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 60 : 80;

  const isFiltered = filterName !== '' || !!filterStatus.length;

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
    if (userPermissions.isDelete) {
      try {
        const response = await axios.post('internal-orgs/0', {
          ids: selected,
          _method: 'DELETE',
        });

        enqueueSnackbar('Xóa thành công!');

        refetchData();
        setSelected([]);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Bạn không có quyền xóa dữ liệu này', { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    if (userPermissions.isEdit) {
      setOpenDrawer(true);
      setIsEdit(true);
      setCurentInternalOrg({
        ...row,
      });
    } else {
      enqueueSnackbar('Bạn không có quyền thêm cập nhật', { variant: 'error' });
    }
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.eCommerce.view(paramCase(id)));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus([]);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    if (userPermissions.isCreate) {
      setOpenDrawer(true);
      setIsEdit(false);
      setCurentInternalOrg(null);
    } else {
      enqueueSnackbar('Bạn không có quyền thêm mới', { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title> Danh sách tổ chức | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Danh sách tổ chức"
          links={[
            {
              name: 'Hệ thống',
            },
            { name: 'Tổ chức' },
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
            dispatch(resetWards());
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
          <OrganizationAddNewAndEditForm
            currentInternalOrg={currentInternalOrg}
            internalOrgs={internalOrgs}
            isEdit={isEdit}
            onClose={() => {
              dispatch(resetWards());
              setOpenDrawer(false);
            }}
            refetchData={refetchData}
          />
        </Drawer>

        <Card>
          <OrganiztionTableToolbar
            filterName={filterName}
            filterStatus={filterStatus}
            onFilterName={handleFilterName}
            onFilterStatus={handleFilterStatus}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            optionsService={[]}
            onFilterService={handleFilterService}
            isLoading={isLoading}
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
                <Tooltip title="Delete">
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
                      <OrganiztionTableRow
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
