import PropTypes from 'prop-types';
import * as Yup from 'yup';
import React, { useEffect, useRef, useState, useMemo } from 'react';

// form
import { useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../pages/style/style.css';
import { Box, Card, Grid, Stack, Divider, TextField, TableContainer, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';

// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFCheckbox,
  RHFSwitch,
  RHFRadioGroup,
} from '../../../components/hook-form';
import axios from '../../../utils/axios';
import WarehouseExportSbrToolbar from './WarehouseExportSbrToolbar';
import Iconify from '../../../components/iconify';
import { dispatch, useSelector } from '../../../redux/store';
import { getEmployees } from '../../../redux/slices/employee';
import { getGoods } from '../../../redux/slices/good';
import WarehouseExportDetail from './WarehouseExportDetail';
import { FUNCTIONS, STATUSES } from '../../../utils/constant';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

WarehouseExportAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentOrder: PropTypes.object,
  internalOrgs: PropTypes.array,
  typeExports: PropTypes.array,
};

export default function WarehouseExportAddNewAndEditForm({
  isEdit = false,
  refetchData,
  onClose,
  currentOrder,
  internalOrgs,
  typeExports,
  filterTypeExport,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const refSubmitButton = useRef();

  const employees = useSelector((state) => state.employee.employees);

  const goods = useSelector((state) => state.good.goods);

  const [isApproved, setIsApproved] = useState(false);

  const [internalOrgExport, setInternalOrgExport] = useState({});

  const [dateChosen, setDateChosen] = useState(moment().format('YYYY-MM-DD'));

  const [internalOrgImport, setInternalOrgImport] = useState({});

  const [typeExport, setTypeExport] = useState({});

  const [employeeCreate, setEmployeeCreate] = useState(user);

  const [codeExport, setCodeExport] = useState('');

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [triggerClickAdd, setTriggerClickAdd] = useState(0);

  const [totalQuantity, setTotalQuantity] = useState(0);

  const [isSuccess, setIsSuccess] = useState(false);

  const defaultValues = useMemo(
    () => ({
      date: currentOrder?.date || moment().format('YYYY-MM-DD'),
      export_warehouse: currentOrder?.order_items[0]?.internal_org || null,
      import_warehouse: currentOrder?.order_child_reference?.order_items[0]?.internal_org || null,
      typeExport: currentOrder?.function || null,
      comment: currentOrder?.comment || '',
      quantity: currentOrder?.total_quatity || 0,
      code: currentOrder?.code || '',
      status: currentOrder?.order_status_id,
      employee: currentOrder?.employee || user,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrder]
  );

  const NewExportWareHouseSchema = Yup.object().shape({
    date: Yup.string().required('Chọn ngày chứng từ'),
    export_warehouse: Yup.object().required('Chọn kho xuất').nullable(true),
    typeExport: Yup.object().required('Chọn loại xuất').nullable(true),
    employee: Yup.object().required('Chọn người xuất').nullable(true),
    import_warehouse: Yup.object()
      .when('typeExport', {
        is: (type) => type?.id === FUNCTIONS.export_transfer,
        then: Yup.object().required('Chọn kho nhận'),
      })
      .nullable(true),
  });

  const methods = useForm({
    resolver: yupResolver(NewExportWareHouseSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentOrder) {
      setDateChosen(currentOrder?.date);
      setCodeExport(currentOrder?.code);
      setEmployeeCreate(currentOrder?.employee);
      setTotalQuantity(currentOrder?.total_quantity);
      setTypeExport(currentOrder?.function);
      setInternalOrgImport(currentOrder?.order_child_reference?.warehouse);
      if (currentOrder?.order_status_id === STATUSES.success || currentOrder?.order_status_id === STATUSES.confirm) {
        setIsSuccess(true);
      } else setIsSuccess(false);

      const itemOrderItems = currentOrder.order_items.map((element) => ({
        order_item_id: element.id,
        good_code: element?.good,
        good_name: element?.good?.name,
        good_unit: element?.good.unit_of_measure?.name,
        quantity: element?.quantity,
      }));
      setTimeout(() => {
        setValue('items', itemOrderItems);
      }, 10);
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(currentOrder);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentOrder]);

  useEffect(() => {
    if (!employees.length) dispatch(getEmployees({}));

    if (!goods.length) dispatch(getGoods({}));
  }, [employees, goods]);

  const addItem = () => {
    setTriggerClickAdd((triggerClickAdd) => triggerClickAdd + 1);
  };

  const onSave = (type = null) => {
    if (type) {
      setValue('status', STATUSES.confirm);
    }
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const newOrderExport = formData?.items
      ? formData?.items.filter((item) => item.good_code !== null && item.quantity)
      : [];
    if (newOrderExport.length) {
      try {
        const orderItems = formData.items.map((item) => ({
          id: item.order_item_id,
          good_id: item.good_code.id,
          quantity: Number(item.quantity),
        }));

        const newFormData = {
          function_id: formData?.typeExport?.id || null,
          function_code: formData?.typeExport?.code || null,
          export_warehouse_id: formData?.export_warehouse?.id || null,
          import_warehouse_id: formData?.import_warehouse?.id || null,
          date: moment(formData?.date).format('YYYY-MM-DD') || '',
          employee_id: formData?.employee?.id || null,
          order_items: orderItems || [],
          comment: formData?.comment || '',
          status: formData?.status,
          order_child_reference: currentOrder?.order_child_reference || null,
        };

        if (!isEdit) {
          await axios.post('warehouse-export', newFormData);
          enqueueSnackbar('Thêm phiếu xuất thành công!');
          onClose();
          refetchData();
          // reset(defaultValues);
        } else {
          await axios
            .put(`warehouse-export/${currentOrder.id}`, newFormData)
            .then((response) => {
              const { notEnoughGoods } = response?.data?.data;
              if (notEnoughGoods) {
                enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
              }
            })
            .catch((error) => {
              enqueueSnackbar(error.data.message, { variant: 'error' });
              setLoadingBtnSave(false);
            });
          enqueueSnackbar('Cập nhập phiếu xuất thành công!');
          onClose();
          refetchData();
        }
        // reset(currentOrder);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Vui lòng chọn chi tiết mặt hàng cần xuất', { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  const addQuantity = () => {
    setTotalQuantity(values.items.reduce((total, item) => total + Number(item.quantity), 0));
  };

  return (
    <>
      <WarehouseExportSbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        isApproved={isApproved}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật phiếu xuất kho' : 'Thêm phiếu xuất kho'}
        isSuccess={isSuccess}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3, boxShadow: 'none' }}>
              <Box
                rowGap={3}
                sx={{ pb: 3 }}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField
                  size="small"
                  name="code"
                  value={codeExport}
                  label="Số chứng từ"
                  InputProps={{
                    readOnly: true,
                    disabled: true,
                  }}
                />
                <DatePicker
                  label="Ngày chứng từ"
                  value={dateChosen}
                  name="date"
                  disabled={isSuccess}
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('date', newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                    setDateChosen(newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
                <RHFAutocomplete
                  name="export_warehouse"
                  autoHighlight
                  disabled={isSuccess}
                  options={internalOrgs.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('export_warehouse', newValue);
                    setInternalOrgExport(newValue);
                    setValue('import_warehouse', null);
                    setInternalOrgImport(null);
                    setValue('items', []);
                    setTotalQuantity(0);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.export_warehouse)}
                      helperText={errors.export_warehouse?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn kho xuất*"
                    />
                  )}
                />
                <RHFAutocomplete
                  name="typeExport"
                  autoHighlight
                  // disabled={isSuccess}
                  options={typeExports.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('typeExport', newValue);
                    setTypeExport(newValue);

                    if (newValue.id === FUNCTIONS.export_transfer) setCodeExport(`XC${moment().format('YYMM')}-0000`);
                    else setCodeExport(`PX${moment().format('YYMM')}-0000`);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  disabled={isEdit}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.typeExport)}
                      helperText={errors.typeExport?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn loại xuất*"
                    />
                  )}
                />

                {typeExport.id === FUNCTIONS.export_transfer && (
                  <>
                    <RHFAutocomplete
                      name="import_warehouse"
                      autoHighlight
                      disabled={isSuccess}
                      options={internalOrgs.filter((item) => item.id !== internalOrgExport?.id).map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        setValue('import_warehouse', newValue);
                        setInternalOrgImport(newValue);

                        if (isEdit) {
                          setValue('items', []);
                          setTotalQuantity(0);
                        }
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      getOptionLabel={(option) => option.name || ''}
                      renderInput={(params) => (
                        <TextField
                          error={Boolean(errors.import_warehouse)}
                          helperText={errors.import_warehouse?.message}
                          {...params}
                          fullWidth
                          size="small"
                          label="Chọn kho nhập*"
                        />
                      )}
                    />
                  </>
                )}
                <RHFAutocomplete
                  name="employee"
                  autoHighlight
                  value={employeeCreate}
                  // disabled={isSuccess}
                  disabled
                  options={employees.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('employee', newValue);
                    setEmployeeCreate(newValue);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.employee)}
                      helperText={errors.employee?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn người xuất*"
                    />
                  )}
                />
                <RHFTextField
                  value={totalQuantity}
                  size="small"
                  name="quantity"
                  label="Số lượng*"
                  disabled={isSuccess}
                  inputProps={{
                    readOnly: true,
                    disabled: true,
                  }}
                />
              </Box>
              <RHFTextField size="small" disabled={isSuccess} name="comment" label="Lý do" />
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    mt: 3,
                  }}
                >
                  <div>
                    <Typography variant="h4" component="h2">
                      Chi tiết
                    </Typography>
                  </div>
                  <div>
                    {!isSuccess && (
                      <Button
                        sx={{ mr: 1 }}
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={addItem}
                      >
                        Thêm
                      </Button>
                    )}
                  </div>
                </Stack>

                <WarehouseExportDetail
                  triggerClickAdd={triggerClickAdd}
                  goods={goods}
                  addQuantity={addQuantity}
                  currentOrder={currentOrder}
                  functionId={filterTypeExport}
                  isSuccess={isSuccess}
                />
              </Box>
              <button hidden={1} ref={refSubmitButton} type={'submit'} />
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
