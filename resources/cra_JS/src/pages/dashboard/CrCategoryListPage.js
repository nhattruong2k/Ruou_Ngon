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

import { getCrCategories } from '../../redux/slices/crCategory';

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
import CategoryNewEditForm from '../../sections/@dashboard/CR-category/CategoryAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
import { CategoryToolbar, CategoryTableRow } from '../../sections/@dashboard/CR-category/list';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Tên',
    id: 'name',
    minWidth: 200,
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function CrCategoryListPage() {
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

  const { customerCareTypes, workCategories, orderTypes, isLoading, dataPaging } = useSelector((state) => state.crCategory);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState('care');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentCategory, setCurrentCategory] = useState({});

  const [pagePagination, setPagePagination] = useState(0);

  const [nameCurrentTab, setNameCurrentTab] = useState('');

  useEffect(() => {
    const params = {
      name: filterName,
      rows_per_page: rowsPerPage,
      page: page + 1,
      currentTab: filterStatus
    };

    dispatch(getCrCategories(params));
  }, [dispatch, filterName, page, rowsPerPage, filterStatus]);

  useEffect(() => {
    if (!isLoading) {
      getValueByCategory(filterStatus);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getCrCategories({
        name: filterName,
        rows_per_page: rowsPerPage,
        page: page + 1,
        currentTab: filterStatus
      })
    );
  };

  const denseHeight = dense ? 60 : 80;

  const isFiltered = filterName !== '';

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  const TABS = [
    { value: 'care', label: 'Hình thức CSKH', color: 'info', count: dataPaging.customerCareTypes?.total || 0 },
    // { value: 'work', label: 'Danh sách công việc', color: 'success', count: dataPaging.workCategories?.total || 0 },
    // { value: 'orderType', label: 'Phân loại nhập xuất', color: 'warning', count: dataPaging.orderTypes?.total || 0 },
  ];

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
    setFilterStatus(newValue);
    getValueByCategory(newValue);
    setFilterName('');
  };

  const getValueByCategory = (currentTab) => {
    switch (currentTab) {
      case 'care':
        setTableData(customerCareTypes);
        setPagePagination(dataPaging?.customerCareTypes?.total);
        setNameCurrentTab(getNameCurrentTab(currentTab));
        break;
      case 'work':
        setTableData(workCategories);
        setPagePagination(dataPaging?.workCategories?.total);
        setNameCurrentTab(getNameCurrentTab(currentTab));
        break;
      case 'orderType':
        setTableData(orderTypes);
        setPagePagination(dataPaging?.orderTypes?.total);
        setNameCurrentTab(getNameCurrentTab(currentTab));
        break;

      default:
        break;
    }
  }

  const getNameCurrentTab = (currentTab) => {
    const { label } = TABS.find(tabEle => tabEle.value === currentTab);

    return label;
  }

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('cr-categories/0', {
        ids: selected,
        currentTab: filterStatus,
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
    setCurrentCategory({
      ...row,
    });
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentCategory(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };
  return (
    <>
      <Helmet>
        <title>Danh mục | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Hình thức CSKH"
          links={[
            {
              name: 'Hệ thống',
            },
            { name: `${nameCurrentTab}` },
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
          <CategoryNewEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentCategory={currentCategory}
            filterStatus={filterStatus}
          />
        </Drawer>

        <Card>
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
          <CategoryToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            onResetFilter={handleResetFilter}
            isFiltered={isFiltered}
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
              <Table size={dense ? 'small' : 'medium'}>
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
                      <CategoryTableRow
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
