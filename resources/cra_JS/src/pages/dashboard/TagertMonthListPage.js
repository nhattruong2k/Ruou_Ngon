import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Card, Table, Button, Tooltip, TableBody, Container, IconButton, TableContainer, Drawer } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import { getTagert } from '../../redux/slices/tagertMonth';
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
import { TagertMonthTableRow, TagertMonthTableToolbar } from '../../sections/@dashboard/tagert-month/list';
import TagertMonthNewEditForm from '../../sections/@dashboard/tagert-month/TagertMonthAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  {
    label: 'STT',
    id: 'serial',
    width: 20,
  },
  {
    label: 'Tháng',
    id: 'month',
    width: 120,
    minWidth: 120,
  },
  {
    label: 'Ngày tạo',
    id: 'user.name',
    width: 180,
    minWidth: 180,
  },
  {
    label: 'Người tạo',
    id: 'user.code',
    width: 200,
    minWidth: 200,
  },
  {
    label: 'Tổng mục tiêu (vnđ)',
    id: 'total_target',
    width: 200,
    minWidth: 200,
    align: 'right'
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function TagertMonthListPage() {
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

  const { tagerts, isLoading, dataPaging } = useSelector((state) => state.tagertMonth);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [filterDate, setFilterDate] = useState(moment().format('YYYY'));

  const [currentTagertMonth, setcurrentTagertMonth] = useState({});

  const refetchData = () => {
    dispatch(
      getTagert({
        name: filterName,
        filter_date: filterDate ? moment(filterDate).format('YYYY') : null,
        filter_month: filterStatus,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  };

  useEffect(() => {
    const params = {
      filter_date: filterDate ? moment(filterDate).format('YYYY') : null,
      filter_month: filterStatus,
      rows_per_page: rowsPerPage,
      page: page + 1,
    };

    dispatch(getTagert(params));
  }, [dispatch, filterName, filterDate, page, rowsPerPage, filterStatus]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(tagerts);
    }
  }, [isLoading]);

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  const isFiltered = filterName !== '' || !!filterStatus.length || !!filterDate || filterService !== 'all';

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
      const response = await axios.post('tagert-month/0', {
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
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setcurrentTagertMonth({
      ...row,
    });
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.tagertMonth.view(paramCase(id)));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterDate(null);
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
    setcurrentTagertMonth(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      <Helmet>
        <title> Mục tiêu tháng | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Mục tiêu tháng"
          links={[
            {
              name: 'Bán hàng',
            },
            { name: 'Mục tiêu tháng' },
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
          <TagertMonthNewEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentTagertMonth={currentTagertMonth}
          />
        </Drawer>

        <Card>
          <TagertMonthTableToolbar
            filterName={filterName}
            filterMonth={filterStatus}
            onFilterName={handleFilterName}
            // onFilterMonth={handleFilterStatus}
            onFilterMonth={(value) => {
              setFilterStatus(value);
            }}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            onFilterService={handleFilterService}
            filterDate={filterDate}
            onFilterDate={(newValue) => {
              setFilterDate(newValue);
            }}
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
                      <TagertMonthTableRow
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
