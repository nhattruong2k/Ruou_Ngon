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

import { getPartyTypes } from '../../redux/slices/partyTypes';

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
import { PartyTypesToolbar, PartyTypesTableRow } from '../../sections/@dashboard/Party-types/list';
import PartyTypesAddNewAndEditForm from '../../sections/@dashboard/Party-types/PartyTypesAddNewAndEditForm';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Tên loại khách hàng',
    id: 'name',
    minWidth: 200,
    width: 200
  },
  {
    id: '',
  },
];

// ----------------------------------------------------------------------

export default function PartyTypesListPage() {
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

  const { partyTypes, isLoading, dataPaging } = useSelector((state) => state.partyTypes);

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterStatus, setFilterStatus] = useState('care');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentPartyTypes, setcurrentPartyTypes] = useState({});

  const [nameCurrentTab, setNameCurrentTab] = useState('');

  useEffect(() => {
    const params = {
      name: filterName,
      rows_per_page: rowsPerPage,
      page: page + 1,
    };
    dispatch(getPartyTypes(params));
  }, [dispatch, filterName, page, rowsPerPage]);
  useEffect(() => {
    if (!isLoading) {
      setTableData(partyTypes);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getPartyTypes({
        name: filterName,
        rows_per_page: rowsPerPage,
        page: page + 1,
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

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('partyTypes/0', {
        ids: selected,
        _method: 'DELETE',
      });
      enqueueSnackbar(response.data.data.message, response.data.data.status ? '' : { variant: 'error' });

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
    setcurrentPartyTypes({
      ...row,
    });
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setcurrentPartyTypes(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };
  return (
    <>
      <Helmet>
        <title>Phân loại khách hàng | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="PL khách hàng"
          links={[
            {
              name: 'Hệ thống',
            },
            {
              name: 'PL khách hàng',
            },
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
          <PartyTypesAddNewAndEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            currentPartyTypes={currentPartyTypes}
            filterStatus={filterStatus}
          />
        </Drawer>

        <Card>
          <PartyTypesToolbar
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
                      <PartyTypesTableRow
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
            count={dataPaging?.total || 0}
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
