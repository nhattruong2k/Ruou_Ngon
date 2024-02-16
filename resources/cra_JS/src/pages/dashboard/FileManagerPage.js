import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Stack, Button, Container, Box, CircularProgress, IconButton, MenuItem } from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// utils
import { fTimestamp } from '../../utils/formatTime';
// _mock_
import { _allFiles } from '../../_mock/arrays';
// components
import Iconify from '../../components/iconify';
import ConfirmDialog from '../../components/confirm-dialog';
import { fileFormat, arrType } from '../../components/file-thumbnail';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import { useTable, getComparator } from '../../components/table';
import MenuPopover from '../../components/menu-popover';
import DateRangePicker, { useDateRangePicker } from '../../components/date-range-picker';
// sections
import {
  FileListView,
  FileGridView,
  FileFilterType,
  FileFilterName,
  FileFilterButton,
  FileChangeViewButton,
  FileNewFolderDialog,
} from '../../sections/@dashboard/file';
import { useDispatch, useSelector } from '../../redux/store';
import { getFileManagements } from '../../redux/slices/fileManagements'
// ----------------------------------------------------------------------

const FILE_TYPE_OPTIONS = [
  'folder',
  'txt',
  'zip',
  'audio',
  'image',
  'video',
  'word',
  'excel',
  'powerpoint',
  'pdf',
  'photoshop',
  'illustrator',
];

// ----------------------------------------------------------------------

export default function FileManagerPage() {
  const table = useTable({ defaultRowsPerPage: 10 });
  const navigate = useNavigate();
  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  const { id } = useParams();

  const isMobile = useResponsive('down', 'sm');

  const dispatch = useDispatch();

  const { themeStretch } = useSettingsContext();

  const [view, setView] = useState('list');

  const [filterName, setFilterName] = useState('');

  // const [tableData, setTableData] = useState(_allFiles);
  const [tableData, setTableData] = useState([]);

  const [filterType, setFilterType] = useState([]);

  const [filterTypeSearch, setFilterTypeSearch] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [openNewFolder, setOpenNewFolder] = useState(false);

  const [folderName, setFolderName] = useState('');

  const [openPopover, setOpenPopover] = useState(null);

  const pathMain = [{
    name: 'Quản lý',
    href: PATH_DASHBOARD.fileManager.list,
  }]

  const [pathCustom, setPathCustom] = useState(pathMain);

  const { files, isLoading, dataPaging, path } = useSelector((state) => state.fileManagement);

  useEffect(() => {
    let typeArr = [];
    if (filterType.length) {
      filterType.forEach((item) => {
        const current = (arrType(item));
        typeArr = [...typeArr, ...current];
      })
    }
    const params = {
      name: filterName,
      folder_id: id,
      type: typeArr,
      rows_per_page: table.rowsPerPage,
      page: table.page + 1
    };
    dispatch(getFileManagements(params));
  }, [dispatch, filterName, id, table.page, filterTypeSearch]);

  useEffect(() => {
    if (!isLoading) {
      setTableData(files);
      const pathFolder = path.map((item, index) => ({
        name: item.name,
        href: PATH_DASHBOARD.fileManager.viewFolder(item.id),
      }));
      const mergedArray = [...pathMain, ...pathFolder];
      setPathCustom(mergedArray);
    }
  }, [isLoading]);

  const setViewFolder = (row) => {
    navigate(PATH_DASHBOARD.fileManager.viewFolder(row.id));
  }

  const refetchData = () => {
    let typeArr = [];
    if (filterType.length) {
      filterType.forEach((item) => {
        const current = (arrType(item));
        typeArr = [...typeArr, ...current];
      })
    }
    const params = {
      name: filterName,
      folder_id: id,
      type: typeArr,
      rows_per_page: table.rowsPerPage,
      page: table.page + 1
    };
    dispatch(getFileManagements(params));
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterType,
    filterStartDate: startDate,
    filterEndDate: endDate,
    isError: !!isError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound =
    (!tableData.length && !!filterName) ||
    (!tableData.length && !!filterType)

  const isFiltered = !!filterName || !!filterType.length;

  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleFilterName = (event) => {
    table.setPage(0);
    setFilterName(event.target.value);
  };

  const handleChangeStartDate = (newValue) => {
    table.setPage(0);
    onChangeStartDate(newValue);
  };

  const handleChangeEndDate = (newValue) => {
    table.setPage(0);
    onChangeEndDate(newValue);
  };

  const handleFilterType = (type) => {
    const checked = filterType.includes(type) ? filterType.filter((value) => value !== type) : [...filterType, type];

    table.setPage(0);
    setFilterType(checked);
  };

  const handleDeleteItem = (id) => {
    const { page, setPage, setSelected } = table;
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteItems = (selected) => {
    const { page, rowsPerPage, setPage, setSelected } = table;
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

  const handleClearAll = () => {
    if (onResetPicker) {
      onResetPicker();
    }
    setFilterName('');
    setFilterType([]);
    setFilterTypeSearch([]);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  const handleOpenNewFolder = () => {
    setOpenNewFolder(true);
  };

  const handleCloseNewFolder = () => {
    setOpenNewFolder(false);
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
        <title> Quản lý hồ sơ | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
        {isLoading && (
          <Box className={'c-box__loading_v2'}>
            <CircularProgress className={'c-box__loading__icon'} />
          </Box>
        )}
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Quản lý hồ sơ"
          links={[
            {
              name: 'Bán hàng',

            },
            { name: 'Quản lý hồ sơ' },
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
                  key="btn1"
                  sx={{ mr: 1 }}
                  variant="contained"
                  startIcon={<Iconify icon="ph:folder-fill" />}
                  onClick={handleOpenNewFolder}
                >
                  Tạo thư mục
                </Button>,
                <Button
                  key="btn2"
                  variant="contained"
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  onClick={handleOpenUploadFile}
                >
                  Tải lên
                </Button>
              ]

          }
        />
        <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 160 }}>
          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenNewFolder();
            }}
          >
            <Iconify icon="ph:folder-fill" />
            Tạo thư mục
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenUploadFile();
            }}
          >
            <Iconify icon="eva:cloud-upload-fill" />
            Tải lên
          </MenuItem>
        </MenuPopover>
        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack spacing={1} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} sx={{ width: 1 }}>
            <FileFilterName filterName={filterName} onFilterName={handleFilterName} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {/* <>
                <FileFilterButton
                  isSelected={!!isSelectedValuePicker}
                  startIcon={<Iconify icon="eva:calendar-fill" />}
                  onClick={onOpenPicker}
                >
                  {isSelectedValuePicker ? shortLabel : 'Select Date'}
                </FileFilterButton>

                <DateRangePicker
                  variant="calendar"
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStartDate={handleChangeStartDate}
                  onChangeEndDate={handleChangeEndDate}
                  open={openPicker}
                  onClose={onClosePicker}
                  isSelected={isSelectedValuePicker}
                  isError={isError}
                />
              </> */}

              <FileFilterType
                filterType={filterType}
                onFilterType={handleFilterType}
                optionsType={FILE_TYPE_OPTIONS}
                onReset={() => {
                  setFilterType([]);
                  setFilterTypeSearch([])
                }}
                onSaveFilter={() => setFilterTypeSearch(filterType)}
              />

              {isFiltered && (
                <Button
                  variant="soft"
                  color="error"
                  onClick={handleClearAll}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Làm mới
                </Button>
              )}
            </Stack>
          </Stack>

          {/* <FileChangeViewButton value={view} onChange={handleChangeView} /> */}
        </Stack>
        <Box
          sx={{
            p: 1, mb: 3, borderRadius: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
          }}
        >

          <CustomBreadcrumbs
            sx={{ mb: 0, ml: 1 }}
            links={
              pathCustom
            }
          />
        </Box>

        <FileListView
          table={table}
          tableData={tableData}
          dataFiltered={tableData}
          onDeleteRow={handleDeleteItem}
          isNotFound={isNotFound}
          onOpenConfirm={handleOpenConfirm}
          setViewFolder={setViewFolder}
          refetchData={refetchData}
          dataPaging={dataPaging}
        />
      </Container>

      <FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} refetchData={refetchData} folderId={id} />

      <FileNewFolderDialog
        open={openNewFolder}
        refetchData={refetchData}
        onClose={handleCloseNewFolder}
        title="Tạo mới thư mục"
        onCreate={() => {
          setFolderName('');
        }}
        folderName={folderName}
        onChangeFolderName={(event) => setFolderName(event.target.value)}
        folderId={id}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems(table.selected);
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

function applyFilter({ inputData, comparator, filterName, filterType, filterStartDate, filterEndDate, isError }) {

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter((file) => file.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1);
  }

  if (filterType.length) {
    inputData = inputData.filter((file) => filterType.includes(fileFormat(file.type)));
  }

  if (filterStartDate && filterEndDate && !isError) {
    inputData = inputData.filter(
      (file) =>
        fTimestamp(file.dateCreated) >= fTimestamp(filterStartDate) &&
        fTimestamp(file.dateCreated) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
