import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../pages/style/style.css';
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  Typography,
  Autocomplete,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  TableContainer,
  Drawer,
  Button,
} from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import Iconify from '../../../components/iconify';
import { useDispatch, useSelector } from '../../../redux/store';
import Scrollbar from '../../../components/scrollbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import UserPermistionRsb from './UserPermistionRsb';
import axios from '../../../utils/axios';
import AutocompleteEditor from '../../../pages/cell-editor/AutocompleteEditor';

// ----------------------------------------------------------------------

UserPermistionAddNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPrice: PropTypes.object,
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function currencyFormatter(params) {
  return formatNumber(params.value);
}

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const listPriceTypeApplyStore = ['vehicle', 'good', 'service', 'checking_daily'];
const listPriceTypeApplyProvice = ['tax'];
const listPriceTypeApplyEmployee = ['license_plate_service'];

// enables pagination in the grid
const pagination = true;

// sets 10 rows per page (default is 100)
const paginationPageSize = 10;

const priceTypes = [
  {
    id: 1,
    value: 'vehicle',
  },
  {
    id: 2,
    value: 'good',
  },
  {
    id: 3,
    value: 'tax',
  },
  {
    id: 4,
    value: 'service',
  },
  {
    id: 5,
    value: 'license_plate_service',
  },
  {
    id: 6,
    value: 'checking_daily',
  },
];

export default function UserPermistionAddNewForm({
  isEdit = false,
  priceType,
  currentPrice,
  refetchData,
  title,
  onClose,
}) {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrg);

  const provinces = useSelector((state) => state.geographic.provinces);

  const employees = useSelector((state) => state.employee.employees);

  const [loading, setLoading] = useState(false);

  const refSubmitButtom = useRef();

  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD HH:mm'));

  const [thruDate, setThuDate] = useState(moment().format('YYYY-MM-DD HH:mm'));

  const [priceItems, setPriceItems] = useState([]);

  const [internalValue, setInternalValue] = useState([]);

  const [importExcel, setImportExcel] = useState(false);

  const NewPriceSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const [defaultColDef, setDefaultColDef] = useState({
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    floatingFilter: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPrice?.name || '',
      from_date: currentPrice?.from_date || moment().format('YYYY-MM-DD'),
      thru_date: currentPrice?.thru_date || moment().format('YYYY-MM-DD'),
      internal_org: currentPrice?.internal_orgs || [],
      active_flag: currentPrice?.active_flag || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPrice]
  );

  const methods = useForm({
    resolver: yupResolver(NewPriceSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentPrice) {
      setInternalValue(currentPrice.internal_orgs);
      setFromDate(currentPrice.from_date);
      setThuDate(currentPrice.thru_date);
      handleDataGrid(currentPrice.price_items);
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(currentPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPrice]);

  const handleDataGrid = (rowData) => {
    const dataTable = rowData.map((item) => {
      return {
        id: item.id,
        code: item?.vehicle?.code || '',
        name: item?.vehicle?.name || '',
        price: item?.price || '',
        comment: item.comment,
      };
    });

    setPriceItems(dataTable);
  };

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const addItem = () => {
    let newItems = {
      code: '',
      name: '',
      price: 0,
      comment: '',
    };

    if (priceType === 'license_plate_service') {
      newItems = {
        district_name: '',
        province_name: '',
        price_with_car: 0,
        price_without_car: 0,
      };
    }
    const res = gridRef.current.api.applyTransaction({
      add: [newItems],
    });

    setTimeout(() => {
      onStarEdittCell();
    }, 300);
  };

  const onStarEdittCell = (field = 'code') => {
    const lastRowIndex = gridRef.current.api.getLastDisplayedRow();
    gridRef.current.api.setFocusedCell(lastRowIndex, field);
    gridRef.current.api.startEditingCell(lastRowIndex, field);
  };

  const getRowData = useCallback(() => {
    const rowData = [];
    gridRef.current.api.forEachNode((node) => {
      rowData.push(node.data);
    });
    return rowData;
  }, []);

  const hanldeFormData = (formData) => {
    const rowData = getRowData();
    let newFormData = {
      ...formData,
      import_excel: importExcel,
      from_date: moment(fromDate).format('YYYY-MM-DD HH:mm:ss'),
      thru_date: moment(thruDate).format('YYYY-MM-DD HH:mm:ss'),
      active_flag: 1,
      price_item: rowData,
      productable_type: priceType,
      price_type_id: priceTypes.find(({ value }) => value === priceType)?.id || null,
    };
    if (priceType === 'tax') {
      newFormData = {
        ...formData,
        import_excel: importExcel,
        from_date: moment(fromDate).format('YYYY-MM-DD'),
        thru_date: moment(thruDate).format('YYYY-MM-DD'),
        productable_type: priceType,
        price_item: rowData,
        price_province: internalValue,
        price_type_id: priceTypes.find(({ value }) => value === priceType)?.id || null,
      };
    } else if (priceType === 'license_plate_service') {
      newFormData = {
        ...formData,
        import_excel: importExcel,
        from_date: moment(fromDate).format('YYYY-MM-DD'),
        thru_date: moment(thruDate).format('YYYY-MM-DD'),
        productable_type: priceType,
        price_item: rowData,
        price_employee_id: internalValue?.id || '',
        price_type_id: priceTypes.find(({ value }) => value === priceType)?.id || null,
      };
    }

    return newFormData;
  };

  const onSubmit = async (formData) => {
    try {
      const newFormData = hanldeFormData(formData);

      if (!isEdit) {
        await axios.post('price', newFormData);
      } else {
        await axios.put(`price/${newFormData.id}`, newFormData);
      }

      reset(currentPrice);
      setInternalValue([]);
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      refetchData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  return (
    <>
      <UserPermistionRsb
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
      />
      <Divider />
      <Scrollbar>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <RHFAutocomplete
                  sx={{ pb: 3 }}
                  name="province_id"
                  multiple
                  options={provinces.map((option) => option)}
                  size="small"
                  value={internalValue}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setInternalValue(newValue);
                    setValue('province_id', newValue.id);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Chọn user*" />}
                />
                <RHFAutocomplete
                  name="province_id"
                  multiple
                  options={provinces.map((option) => option)}
                  size="small"
                  value={internalValue}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setInternalValue(newValue);
                    setValue('province_id', newValue.id);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Chọn role*" />}
                />
                <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
                  <button hidden={1} ref={refSubmitButtom} type={'submit'} />
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Scrollbar>
    </>
  );
}
