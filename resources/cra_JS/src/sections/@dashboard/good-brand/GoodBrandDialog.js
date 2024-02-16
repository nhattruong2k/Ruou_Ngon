import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect } from 'react';
// @mui
import { Stack, Dialog, DialogActions, Button, IconButton, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
// components
import { useSnackbar } from '../../../components/snackbar';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

GoodBrandDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.func,
  goodBrands: PropTypes.object,
};
export default function GoodBrandDialog({ open, onCloseDialog, goodBrands, refetchData }) {
  const gridRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [defaultColDef, setDefaultColDef] = useState({
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  });
  const columnDefs = [
    {
      headerName: 'Tên',
      field: 'name',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
      onCellValueChanged: (param) => {
        console.log(param);
      },
    },
  ];
  const addItem = () => {
    const newItems = {};
    const res = gridRef.current.api.applyTransaction({
      add: [newItems],
      addIndex: 0,
    });
  };

  const getRowData = useCallback(() => {
    const rowData = [];
    gridRef.current.api.forEachNode((node) => {
      rowData.push(node.data);
    });
    return rowData;
  }, []);

  const onSave = async () => {
    const rowData = getRowData();
    const formData = rowData.filter((item) => item.id === undefined);
    try {
      if (formData && !hasEmptyElement(formData)) {
        const response = await axios.post('good-brands', formData);
        enqueueSnackbar('Create success!');
        refetchData();
      } else {
        enqueueSnackbar('Thông tin nhãn hiệu không đuợc rỗng', { variant: 'error' });
      }
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const hasEmptyElement = (obj) => {
    return obj.some((item) => {
      if (item.name === null || item.name === undefined) {
        return true;
      }
      if (typeof item.name === 'string' && item.name.trim() === '') {
        return true;
      }
      if (Object.keys(item.name).length === 0) {
        return true;
      }
      return false;
    });
  };

  const getSelectedRowData = () => {
    const selectedData = gridRef.current.api.getSelectedRows();
    return selectedData;
  };

  const onDelete = async () => {
    try {
      const itemDetele = [];

      const itemSelected = getSelectedRowData();

      if (itemSelected.length === 0) return;

      itemSelected.forEach((item) => {
        if (item?.id) {
          itemDetele.push(item);
        }
      });

      const response = await axios.post(`remove-good-brand`, {
        items: itemDetele,
      });

      enqueueSnackbar('Delete success!');
      gridRef.current.api.applyTransaction({ remove: itemSelected });
      refetchData();
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onCloseDialog}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2.5, px: 3 }}>
        <Typography variant="h6"> Thông tin nhãn hiệu </Typography>
        <IconButton
          aria-label="close"
          onClick={onCloseDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Stack sx={{ p: 2 }}>
        <div
          className="ag-theme-alpine"
          style={{
            height: 250,
            width: '100%',
          }}
        >
          <AgGridReact
            headerHeight={'46'}
            defaultColDef={defaultColDef}
            rowData={goodBrands}
            rowSelection={'multiple'}
            ref={gridRef}
            animateRows={'true'}
            columnDefs={columnDefs}
            stopEditingWhenCellsLoseFocus={'true'}
            singleClickEdit={'true'}
          >
            <></>
          </AgGridReact>
        </div>
        <Divider />
        <DialogActions>
          <Button size="small" onClick={addItem} sx={{ alignSelf: 'flex-end' }}>
            Add New
          </Button>
          <Button size="small" onClick={onSave} sx={{ alignSelf: 'flex-end' }}>
            Save
          </Button>
          <Button size="small" color="error" onClick={onDelete} sx={{ alignSelf: 'flex-end' }}>
            Delete
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}