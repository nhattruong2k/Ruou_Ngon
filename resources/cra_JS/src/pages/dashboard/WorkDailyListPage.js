import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Card, Table, Button, Tooltip, TableBody, Container, IconButton, TableContainer, Drawer, CircularProgress, MenuItem } from '@mui/material';
import moment from 'moment';
import useResponsive from '../../hooks/useResponsive';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import { getEmployees } from '../../redux/slices/employee';
import { getDailyWorks } from '../../redux/slices/dailywork';
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
import MenuPopover from '../../components/menu-popover';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import ConfirmDialog from '../../components/confirm-dialog';
// sections
import { WorkDailyTableRow, WorkDailyTableToolbar } from '../../sections/@dashboard/work-daily/list';
import WorkDailyAddNewAndEditForm from '../../sections/@dashboard/work-daily/WorkDailyAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Nhân viên báo cáo',
    id: 'name',
    width: 220
  },
  {
    label: 'Ngày báo cáo',
    id: 'date',
  },
  // {
  //   label: 'Danh sách công việc',
  //   id: 'work_category',
  // },
  {
    label: 'Nội dung công việc',
    id: 'status',
  },
  {
    id: '',
  },
];

export default function WorkDailyListPage() {
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

  const isMobile = useResponsive('down', 'sm');

  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const employees = useSelector((state) => state.employee.employees);

  const { dailyworks, workCategories, dataPaging, isLoading } = useSelector((state) => state.dailywork);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterService, setFilterService] = useState('all');

  const [openDrawer, setOpenDrawer] = useState(false);

  const [openExcel, setOpenExcel] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentWorkDaily, setCurrentWorkDaily] = useState({});

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  useEffect(() => {
    const params = {
      name: filterName,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate,
      filter_end_date: filterEndDate,
      page: page + 1
    };

    dispatch(getDailyWorks(params));
  }, [dispatch, filterName, filterStartDate, filterEndDate, page, rowsPerPage]);

  useEffect(() => {

    if (!isLoading) {
      setTableData(dailyworks);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!employees.length) dispatch(getEmployees({}));
  }, [employees]);

  const refetchData = () => {
    dispatch(getDailyWorks({
      name: filterName,
      rows_per_page: rowsPerPage,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
      page: page + 1
    }));
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered =
    filterName !== '' ||
    filterStartDate !== null ||
    filterEndDate !== null ||
    !!filterStatus.length;

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
      const response = await axios.post('daily-works/0', {
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
    setCurrentWorkDaily({
      ...row,
    });
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.eCommerce.view(paramCase(id)));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterStatus([]);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentWorkDaily(null);
  };

  const exportExcel = (queryParams) => {
    setLoadingBtnSave(true);
    try {
      const objParams = {
        name: filterName,
        filter_start_date: filterStartDate,
        filter_end_date: filterEndDate,
      }
      axios.get(`exportExcel-workDaily`, {
        params: objParams,
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bao-cao-cong-viec-${moment().format('YYMMDDHHmm')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        setLoadingBtnSave(false);
        enqueueSnackbar('Tải file thành công!');
      })
      setLoadingBtnSave(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      setLoadingBtnSave(false);
    }
  }

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <Helmet>
        <title> Nhân viên báo cáo | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>

        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Nhân viên báo cáo"
          links={[
            {
              name: 'Báo cáo'
            },
            { name: 'DS công việc' },
          ]}
          action={
            isMobile
              ?
              <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
              :
              [
                <Button
                  key={'keyitem2'}
                  sx={{ mr: 1 }}
                  size="small"
                  onClick={exportExcel}
                  variant="contained"
                  startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify icon="eva:file-text-fill" />}
                  disabled={loadingBtnSave}
                >
                  Xuất Excel
                </Button>,
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
              ]
          }
        />
        <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 160 }}>
          <MenuItem
            onClick={() => {
              handleClosePopover();
              exportExcel();
            }}
          >
            <Iconify icon="eva:file-text-fill" />
            Xuất Excel
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              addItem();
            }}
          >
            <Iconify icon="eva:plus-fill" />
            Thêm mới
          </MenuItem>
        </MenuPopover>
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
          <WorkDailyAddNewAndEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentWorkDaily={currentWorkDaily}
            workCategories={workCategories}
            employees={employees}

          />
        </Drawer>

        <Card>
          <WorkDailyTableToolbar
            filterName={filterName}
            filterStatus={filterStatus}
            onFilterName={handleFilterName}
            onFilterStatus={handleFilterStatus}
            isFiltered={isFiltered}
            onResetFilter={handleResetFilter}
            filterService={filterService}
            optionsService={workCategories}
            onFilterService={handleFilterService}
            filterStartDate={filterStartDate}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            filterEndDate={filterEndDate}
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
                  {(isLoading ? [...Array(rowsPerPage)] : tableData)
                    .map((row, index) =>
                      row ? (
                        <WorkDailyTableRow
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
