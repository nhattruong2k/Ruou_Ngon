import { Helmet } from 'react-helmet-async';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableContainer,
  Tabs,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store';
// _mock_
import axios from '../../utils/axios';
import { PARTY_TYPE } from '../../utils/constant';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from '../../components/table';
// sections
import { PartiesTableToolbar, PartyTableRow } from '../../sections/@dashboard/parties/list';
import PartiesAddNewEditForm from '../../sections/@dashboard/parties/PartiesAddNewEditForm';
import { getParties } from '../../redux/slices/parties';
import { useSnackbar } from '../../components/snackbar';
import Label from '../../components/label';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Tên khách hàng',
    id: 'name',
    minWidth: 220,
    width: 220,
  },
  {
    label: 'Mã khách hàng',
    id: 'code',
    minWidth: 170,
  },
  {
    label: 'Nhóm khách hàng',
    id: 'party_type_id',
    minWidth: 170,
  },
  {
    label: 'Số điện thoại',
    id: 'phone',
    minWidth: 170,
  },
  {
    label: 'Địa chỉ',
    id: 'address',
    minWidth: 200,
  },
  {
    id: '',
  },
];

export default function PartiesListPage() {
  const { themeStretch } = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const gridRef = useRef();

  const { id } = useParams();

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

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterPartyType, setFilterPartyType] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [checked, setChecked] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [currentParty, setCurrentParty] = useState(null);

  const [rowSelected, setRowSelected] = useState(0);

  const [tableData, setTableData] = useState([]);

  const { parties, partyTypes, isLoading, dataPaging } = useSelector((state) => state.parties);

  const isFiltered =
    filterStatus !== 'all' || filterName !== '' || filterPartyType !== 'all' || (!!filterStartDate && !!filterEndDate);

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!tableData.length && !!filterName) || (!isLoading && !tableData.length);

  useEffect(() => {
    dispatch(
      getParties({
        filter_name: filterName,
        party_type_id: filterPartyType,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  }, [dispatch, filterPartyType, filterName, page, rowsPerPage]);

  useEffect(() => {
    if (id) {
      getPartiesById(id);
    }
  }, [id]);

  const getPartiesById = async (id) => {
    await axios.get(`get-party-by-id/${id}`).then((response) => {
      setCurrentParty(response?.data?.data);
      setOpenDrawer(true);
      setIsEdit(true);
    });
  };

  useEffect(() => {
    if (!isLoading) {
      setTableData(parties);
    }
  }, [isLoading]);

  const refetchData = () => {
    dispatch(
      getParties({
        filter_name: filterName,
        party_type_id: filterPartyType,
        rows_per_page: rowsPerPage,
        page: page + 1,
      })
    );
  };

  let totalAll = 0;
  const TABS = partyTypes.map((partyType) => {
    totalAll += partyType.parties_count;
    return {
      value: partyType.id,
      label: partyType.name,
      color: 'success',
      count: partyType.parties_count,
    };
  });

  TABS.unshift({
    value: 'all',
    label: 'Tất cả',
    color: 'success',
    count: totalAll || 0,
  });

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

  const handleFilterPartyType = (event, newValue) => {
    setPage(0);
    setFilterPartyType(newValue);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentParty(null);
  };

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('parties/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');
      setSelected([]);
      refetchData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterPartyType('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  const handleEditRow = (row) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentParty({
      ...row,
    });
  };

  return (
    <>
      <Helmet>
        <title> Danh sách khách hàng | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="DS khách hàng"
          links={[
            {
              name: 'Hệ thống',
            },
            {
              name: 'DS khách hàng',
            },
          ]}
          action={[
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              onClick={addItem}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>,
          ]}
        />

        <Drawer
          open={openDrawer}
          anchor={'right'}
          onClose={toggleDrawer(false)}
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
          <Divider />
          <Scrollbar>
            <PartiesAddNewEditForm
              currentParties={currentParty}
              onClose={handleCloseDetails}
              isEdit={isEdit}
              refetchData={refetchData}
              partyTypes={partyTypes}
            />
          </Scrollbar>
        </Drawer>

        <Card>
          {isLoading && (
            <Box className={'c-box__loading_v2'}>
              <CircularProgress className={'c-box__loading__icon'} />
            </Box>
          )}
          <Tabs value={filterPartyType} onChange={handleFilterPartyType} sx={{ px: 2, bgcolor: 'background.neutral' }}>
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
          <PartiesTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterPartyType={filterPartyType}
            filterEndDate={filterEndDate}
            checked={checked}
            onFilterName={handleFilterName}
            optionsService={partyTypes}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterPartyType={handleFilterPartyType}
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
                      <PartyTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRows([row.id])}
                        onEditRow={() => handleEditRow(row)}
                      // onViewRow={() => handleViewRow(row.name)}
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

// --------------------------------------------------------------------
