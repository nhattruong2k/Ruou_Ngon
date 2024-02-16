import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Card, Table, Button, Tooltip, TableBody, Container, IconButton, TableContainer, Drawer, Stack } from '@mui/material';
import axios from '../../utils/axios';
import { useSnackbar } from '../../components/snackbar';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
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

// sections
import { GoodCategoryTableToolbar, GoodCategoryTableRow } from '../../sections/@dashboard/good-category/list';
import GoodCategoryAddNewAndEditForm from '../../sections/@dashboard/good-category/GoodCategoryAddNewAndEditForm';
import { getGoodCategories } from '../../redux/slices/goodCategory';

const TABLE_HEAD = [
  {
    label: 'Tên loại sản phẩm',
    id: 'name',
    width: 220
  },
  {
    label: 'Mã loại sản phẩm',
    id: 'code',
  },
  {
    label: 'Thuộc loại sản phẩm',
    id: 'good_category',
  },
  {
    label: 'Ghi chú',
    id: 'comment',
  },
  {
    id: '',
  },

];

export default function GoodListPage() {
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

  const dispatch = useDispatch();

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const [currentGoodCategory, setCurrentGoodCategory] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const { goodCategories, isLoading } = useSelector((state) => state.goodCategory);

  const [tableData, setTableData] = useState([]);

  const denseHeight = dense ? 60 : 80;

  const isFiltered = filterStatus !== 'all' || filterName !== '' || filterService !== 'all' || (!!filterStartDate && !!filterEndDate);

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  useEffect(() => {
    dispatch(
      getGoodCategories({
        filter_name: filterName
      })
    );
  }, [dispatch, filterName, filterService]);


  useEffect(() => {

    if (!isLoading) {
      setTableData(goodCategories);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(getGoodCategories({
      filter_name: filterName
    }));
  };

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

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentGoodCategory(null);
  };

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('good-categories/0', {
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

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentGoodCategory({
      ...row,
    });
  };

  return (
    <>
      <Helmet>
        <title> Danh mục sản phẩm | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Danh mục sản phẩm"
          links={[
            {
              name: 'Bán hàng',
            },
            {
              name: 'DM sản phẩm',
            },
          ]}
          action={[
            <Button
              sx={{ mr: 1 }}
              size="small"
              key="btn1"
              onClick={addItem}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>

          ]}
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
          <Scrollbar>
            <GoodCategoryAddNewAndEditForm
              onClose={closeDrawer}
              currentGoodCategory={currentGoodCategory}
              refetchData={refetchData}
              isEdit={isEdit}
            />
          </Scrollbar>
        </Drawer>

        <Card>
          <GoodCategoryTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
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
                        <GoodCategoryTableRow
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
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content={
          <>
            Bạn chắc chắn muốn xóa <strong> {selected.length} </strong> mục này?
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