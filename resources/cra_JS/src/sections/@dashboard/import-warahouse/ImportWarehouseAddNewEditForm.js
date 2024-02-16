import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useRef, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Button, Card, Grid, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from '../../../redux/store';
import { useSnackbar } from '../../../components/snackbar';
import Label from '../../../components/label';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../../components/hook-form';
import { getEmployees } from '../../../redux/slices/employee';
import { getInternalOrg } from '../../../redux/slices/internalOrg';
import { getGoods } from '../../../redux/slices/good';
import PartiesRsbToolbar from './ImportWarehouseRsbToolbar';
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';
import ImportWarehouseDetails from './ImportWarehouseDetails';
import Iconify from '../../../components/iconify';
import { FUNCTIONS } from '../../../utils/constant';
// ----------------------------------------------------------------------

ImportWarehouseAddNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentOrder: PropTypes.object,
  handleCloseDetails: PropTypes.func,
  setCurrentOrder: PropTypes.func,
};

const GENDER_OPTION = [
  { label: 'Nam', value: 1 },
  { label: 'Nữ', value: 2 },
  { label: 'Khác', value: 0 },
];

export default function ImportWarehouseAddNewEditForm({
  isEdit = false,
  onClose,
  currentOrder,
  setCurrentOrder,
  refetchData,
  functions,
  filterType,
}) {
  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const refSubmitButtom = useRef();

  const employees = useSelector((state) => state.employee.employees);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  // const orderTransfer = useSelector((state) => state.importWarehouse.orderTransfer);

  const goods = useSelector((state) => state.good.goods);

  const [dateCT, setDateCT] = useState(moment().format('YYYY-MM-DD'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [loadingBtnConfirm, setLoadingBtnConfirm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [triggerClickAdd, setTriggerClickAdd] = useState(0);

  const [employeeItem, setEmployeeitem] = useState(null);

  const [codeCTItem, setCodeCTItem] = useState(null);

  const [functionItem, setFunctionItem] = useState(null);

  const [internalOrgItem, setInternalOrgItem] = useState(null);

  const [totalQuantity, setTotalQuantity] = useState(0);

  const [importTransfer, setImportTransfer] = useState(false);

  const [functionCustom, setFunctionCustom] = useState(functions);

  const NewPartiesSchema = Yup.object().shape({
    date: Yup.date().nullable().required('Vui lòng chọn ngày chứng từ'),
    employee_id: Yup.string().required('chọn người nhập'),
    function_id: Yup.object().required('Chọn loại nhập').nullable(true),
    // code_id: Yup.object()
    //   .when('function_id', {
    //     is: (type) => type?.id === FUNCTIONS.import_transfer,
    //     then: Yup.object().required('Chọn chứng từ chuyển'),
    //   })
    //   .nullable(true),
    internal_org_id: Yup.string().required('chọn kho nhập'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentOrder?.name || '',
      date: currentOrder?.date || moment().format('YYYY-MM-DD'),
      code: currentOrder?.code || '',
      internal_org_id: currentOrder?.warehouse?.id || '',
      function_id: currentOrder?.function || null,
      comment: currentOrder?.comment || '',
      delete_ids: '',
      items: [],
      employee_id: currentOrder?.created_by || user.id,
      order_status_id: 1,
      warehouse_transfer: '',
      date_transfer: '',
      employee_transfer: '',
      code_id: currentOrder?.order_reference || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrder, employees, user]
  );

  const methods = useForm({
    resolver: yupResolver(NewPartiesSchema),
    defaultValues,
  });

  useEffect(() => {
    if (filterType !== 3) {
      setFunctionCustom(functions.filter((item) => item.id !== 3 && item.id !== FUNCTIONS.import_refund));
    }

    if (isEdit && currentOrder) {
      setEmployeeitem(currentOrder?.employee || null);
      setFunctionItem(currentOrder?.function || null);
      setInternalOrgItem(currentOrder?.warehouse || null);
      setDateCT(currentOrder?.date);
      reset(defaultValues);
      if (currentOrder?.function.id === 3) {
        setImportTransfer(true);

        setCodeCTItem(currentOrder?.order_reference || null);

        setValue('code_id', currentOrder?.order_reference?.code || null);
        setValue('warehouse_transfer', currentOrder?.order_reference?.order_items[0]?.internal_org?.name || '');
        setValue('date_transfer', moment(currentOrder?.order_reference?.date || null).format('DD/MM/YYYY'));
        setValue('employee_transfer', currentOrder?.order_reference?.employee?.name || '');
      } else setImportTransfer(false);
      const sum = currentOrder?.order_items.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue.quantity),
        0
      );
      setTotalQuantity(sum);
      const orderitems = currentOrder.order_items.map((element) => ({
        order_item_id: element?.id || '',
        good_id: element?.good,
        name: element?.good?.name,
        unit: element?.good?.unit_of_measure?.name,
        quantity: element?.quantity,
      }));
      setTimeout(() => {
        setValue('items', orderitems);
      }, 10);
    }

    if (!isEdit) {
      reset(defaultValues);
      if (employees.length > 0) setEmployeeitem(employees.find((item) => item.id === user.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentOrder, employees, user, filterType]);

  useEffect(() => {
    if (employees.length === 0) dispatch(getEmployees({}));
    if (internalOrgs.length === 0) dispatch(getInternalOrg({}));
    if (goods.length === 0) dispatch(getGoods({}));
    // dispatch(getOrderTransfer({
    //   function_id: 4,
    //   order_status_id: 2
    // }));
  }, [dispatch]);

  const {
    reset,
    watch,
    control,
    clearErrors,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
    trigger,
  } = methods;

  const valueForms = watch();

  const onSave = (type) => {
    if (type === 'confirm') {
      setValue('order_status_id', 2);
    }
    refSubmitButtom?.current?.click();
  };

  const addItem = () => {
    setTriggerClickAdd((triggerClickAdd) => triggerClickAdd + 1);
  };

  const addQuantity = () => {
    const sum = valueForms.items.reduce((accumulator, currentValue) => accumulator + Number(currentValue.quantity), 0);
    setTotalQuantity(sum);
  };

  const onSubmit = async (formData) => {
    const orderItem = formData.items.filter((item) => item.good_id);

    if (orderItem.length > 0) {
      setLoadingBtnSave(true);
      try {
        const newFormData = {
          ...formData,
          date: moment(formData.date).format('YYYY-MM-DD'),
          items: orderItem,
        };

        if (functionItem.id === FUNCTIONS.import_transfer) {
          await axios.put(`order-import-warehouses/${currentOrder?.order_reference?.id}`, newFormData);
        } else if (isEdit) {
          await axios.put(`order-import-warehouses/${currentOrder.id}`, newFormData);
        } else {
          await axios.post('order-import-warehouses', newFormData);
          resetForm();
        }
        if (formData.order_status_id === 2) {
          onClose();
          enqueueSnackbar('Xác nhận thành công!');
        } else {
          enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        }

        refetchData();
        setLoadingBtnSave(false);
      } catch (error) {
        setLoadingBtnSave(false);
        if (error.code === 422) {
          const responseErrors = Object.entries(error.data);
          responseErrors.forEach((item) => {
            setTimeout(() => {
              enqueueSnackbar(item[1], { variant: 'error' });
            }, 500);
          });
        }
      }
    } else enqueueSnackbar('Vui lòng chọn sản phẩm', { variant: 'error' });
  };

  const resetForm = () => {
    setValue('items', []);
    setDateCT(moment().format('YYYY-MM-DD'));
    setEmployeeitem(null);
    setFunctionItem(null);
    setInternalOrgItem(null);
    setTotalQuantity(0);
    reset();
  };

  const dataTransfer = (newValue) => {
    setValue('warehouse_transfer', newValue?.warehouse?.name || '');
    setValue('date_transfer', moment(newValue?.date || null).format('DD/MM/YYYY'));
    setValue('employee_transfer', newValue?.employee?.name || '');
    const sum = newValue?.order_items.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.quantity),
      0
    );
    setTotalQuantity(sum);
    const orderitems = newValue.order_items.map((element) => ({
      order_item_id: element?.id || '',
      good_id: element?.good,
      code: element?.good?.code,
      unit: element?.good?.name,
      quantity: element?.quantity,
    }));

    setValue('items', orderitems);
  };

  return (
    <>
      <PartiesRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={onClose}
        title={isEdit ? 'Cập nhật nhập kho' : 'Nhập kho'}
        loadingBtnSave={loadingBtnSave}
        currentOrder={currentOrder}
        loadingBtnConfirm={loadingBtnConfirm}
        functions={functions}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} sx={{ position: 'relative' }}>
        {isEdit && (currentOrder?.order_status_id || '') === 2 && <Box className={'disable-screen'} />}

        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            {isEdit && (
              <Card sx={{ pt: 2, pb: 5, px: 0, borderRadius: 0, border: 0 }}>
                <Label
                  variant="soft"
                  color={(currentOrder?.order_status_id === 1 && 'warning') || 'success'}
                  sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
                >
                  {currentOrder?.order_status.name || ''}
                </Label>
              </Card>
            )}
            <Card sx={{ p: 3, borderRadius: 0 }}>
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
                  label="Số chứng từ*"
                  disabled
                  className="component-text-field-disabled"
                />
                <DatePicker
                  label="Ngày chứng từ"
                  value={dateCT}
                  name="date"
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('date', newValue);
                    setDateCT(newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                  }}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.date)}
                      helperText={errors.date?.message}
                      {...params}
                      size="small"
                      fullWidth
                    />
                  )}
                />

                <RHFAutocomplete
                  name="internal_org_id"
                  autoHighlight
                  value={internalOrgItem}
                  options={internalOrgs.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('internal_org_id', newValue.id);
                    setInternalOrgItem(newValue);
                    clearErrors(['internal_org_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.internal_org_id)}
                      helperText={errors.internal_org_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Kho nhập"
                    />
                  )}
                />

                <RHFAutocomplete
                  disabled={filterType === 3}
                  name="function_id"
                  autoHighlight
                  value={functionItem}
                  options={functionCustom.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('function_id', newValue);
                    setFunctionItem(newValue);
                    clearErrors(['function_id']);
                    if (newValue.id === 3) {
                      setImportTransfer(true);
                    } else setImportTransfer(false);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.function_id)}
                      helperText={errors.function_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Loại nhập"
                    />
                  )}
                />
                {importTransfer && (
                  <>
                    {/* <RHFAutocomplete
                      name="code_id"
                      autoHighlight
                      loading
                      value={codeCTItem}
                      options={orderTransfer.map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        setValue('code_id', newValue);
                        setCodeCTItem(newValue);
                        clearErrors(['code_id']);
                        dataTransfer(newValue)
                      }}
                      renderOption={(props, option) => {
                        return (
                          <li {...props} key={option.id}>
                            {option.code}
                          </li>
                        );
                      }}
                      getOptionLabel={(option) => option.code || ''}
                      renderInput={(params) => (
                        <TextField
                          error={Boolean(errors?.code_id)}
                          helperText={errors?.code_id?.message}
                          {...params}
                          fullWidth
                          size="small"
                          label="Số chứng từ chuyển *"
                        />
                      )}
                    /> */}
                    <RHFTextField
                      size="small"
                      name="code_id"
                      label="Số CT xuất chuyển"
                      disabled
                      className="component-text-field-disabled"
                    />
                    <RHFTextField
                      size="small"
                      name="date_transfer"
                      label="Ngày chuyển"
                      disabled
                      className="component-text-field-disabled"
                    />
                    <RHFTextField
                      size="small"
                      name="warehouse_transfer"
                      label="Kho chuyển"
                      disabled
                      className="component-text-field-disabled"
                    />
                    <RHFTextField
                      size="small"
                      name="employee_transfer"
                      label="Người chuyển"
                      disabled
                      className="component-text-field-disabled"
                    />
                  </>
                )}

                <RHFAutocomplete
                  name="employee_id"
                  disabled
                  autoHighlight
                  value={employeeItem}
                  options={employees.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('employee_id', newValue.id);
                    setEmployeeitem(newValue);
                    clearErrors(['employee_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.employee_id)}
                      helperText={errors.employee_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Người nhập"
                    />
                  )}
                />
                <RHFTextField
                  name="quantity"
                  label="Tổng số lượng"
                  value={totalQuantity}
                  size="small"
                  fullWidth
                  disabled
                  className="component-text-field-disabled"
                />
              </Box>
              <RHFTextField name="comment" label="Lý do" size="small" fullWidth sx={{ mb: 3 }} />
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Chi tiết sản phẩm
                  </Typography>
                  {functionItem?.id !== FUNCTIONS.import_transfer && (currentOrder?.order_status_id || 1) === 1 && (
                    <Button
                      sx={{ mr: 1 }}
                      onClick={addItem}
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                    >
                      Thêm
                    </Button>
                  )}
                </Stack>

                <ImportWarehouseDetails
                  triggerClickAdd={triggerClickAdd}
                  currentOrder={currentOrder}
                  goods={goods}
                  addQuantity={addQuantity}
                  functionItem={functionItem}
                />
              </Box>
              <button hidden={1} ref={refSubmitButtom} type={'submit'} />
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
