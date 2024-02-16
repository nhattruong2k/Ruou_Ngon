import PropTypes from 'prop-types';

import * as Yup from 'yup';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, TextField, Typography, Button, CircularProgress } from '@mui/material';

import { setMonth } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import { useDispatch, useSelector } from '../../../redux/store';
import TagertMonthRsbToolbar from './TagertMonthRsbToolbar';
// components
import Label from '../../../components/label';
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
  RHFRadioGroup,
} from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import axios from '../../../utils/axios';
import { getEmployees } from '../../../redux/slices/employee';
import { getTagertMonthSampleById } from '../../../redux/slices/tagertMonth';
import TagertMonthDetail from './TagertMonthDetail';

// ----------------------------------------------------------------------

TagertMonthAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentTagertMonth: PropTypes.object,
};

export default function TagertMonthAddNewAndEditForm({ isEdit = false, onClose, currentTagertMonth, refetchData }) {
  const dispatch = useDispatch();

  const refSubmitButtom = useRef();

  const tagertsDetailRef = useRef();

  const employees = useSelector((state) => state.employee.employees);

  let dataTagertsSample = useSelector((state) => state.tagertMonth.tagertsByIdData);

  const [name, setName] = useState(null);

  const [month, setMonth] = useState(moment().format('YYYY-MM'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [disabledInput, setDisabledInput] = useState({
    month: isEdit,
  });

  const [isLoading, setIsLoading] = useState(true);

  const defaultValues = useMemo(
    () => ({
      month: currentTagertMonth?.month,
      tagertMonths: [],
      is_edit: isEdit,
    }),
    [currentTagertMonth]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
    trigger,
  } = methods;

  const values = watch();

  useEffect(() => {
    dataTagertsSample = '';
    dispatch(getEmployees());
  }, []);

  useEffect(() => {
    setDisabledInput({
      month: isEdit,
    });
    if (isEdit && currentTagertMonth) {
      setIsLoading(true);
      setMonth(currentTagertMonth?.month || null);
      dispatch(getTagertMonthSampleById(currentTagertMonth?.id));
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
      setIsLoading(false);
    }
  }, [isEdit, currentTagertMonth]);

  useEffect(() => {
    if (!dataTagertsSample.isLoading && dataTagertsSample.tagertsSample) {
      tagertsDetailRef?.current?.setEmployeeList(dataTagertsSample.tagertsSample);
      sumTarget(dataTagertsSample?.tagertsSample?.tagert_users);
      setIsLoading(false);
    }
  }, [dataTagertsSample]);

  const addItem = () => {
    tagertsDetailRef?.current?.handleOpenFrom();
  };

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const formDataTagert = (formData?.tagertMonths || []).filter((item) => Number(item.tagerts) > 0);
    if (formDataTagert.length > 0) {
      try {
        const newFormData = {
          ...formData,
          month: formData?.month === null ? null : moment(formData.month).format('YYYY-MM'),
        };
        if (isEdit) {
          await axios.put(`tagert-month/${currentTagertMonth?.id}`, newFormData);
        } else {
          await axios.post('tagert-month', newFormData);
          reset();
        }
        enqueueSnackbar(!isEdit ? 'Tạo mới thành công!' : 'Cập nhật thành công!');
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
        } else {
          enqueueSnackbar(error.errors, { variant: 'error' });
        }
      }
    } else {
      enqueueSnackbar('Vui lòng chọn nhân viên và nhập mục tiêu', { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  const sumTarget = (dataItems = null) => {
    if (dataItems) {
      setValue(
        'total_target',
        dataItems.reduce((total, item) => total + Number(item.tagerts), 0)
      );
    } else {
      setValue(
        'total_target',
        values?.tagertMonths.reduce((total, item) => total + Number(item.tagerts), 0)
      );
    }
  };
  return (
    <>
      {isLoading && (
        <Box className={'c-box__loading_v2'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}
      <TagertMonthRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật mục tiêu' : 'Thêm mục tiêu'}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ p: 3, borderRadius: 0, border: 0, boxShadow: 'none' }}>
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
                <DatePicker
                  label="Tháng"
                  value={month}
                  name="month"
                  disabled={disabledInput.month}
                  inputProps={{
                    readOnly: true,
                  }}
                  views={['month', 'year']}
                  inputFormat="MM/yyyy"
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('month', newValue === null ? newValue : moment(newValue).format('YYYY-MM'));
                    setMonth(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />

                <RHFTextField
                  label="Tổng mục tiêu"
                  size="small"
                  name="total_target"
                  disabled
                  InputLabelProps={{ shrink: true }}
                  typeinput="price"
                />
              </Box>
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    pb: 3,
                  }}
                >
                  <div>
                    <Typography variant="h6" gutterBottom>
                      Chi tiết
                    </Typography>
                  </div>
                  <div>
                    <Button
                      sx={{ mr: 1 }}
                      onClick={addItem}
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                    >
                      Thêm
                    </Button>
                  </div>
                </Stack>
                <TagertMonthDetail
                  ref={tagertsDetailRef}
                  employeesData={employees}
                  refetchData={refetchData}
                  isEdit={isEdit}
                  sumTarget={sumTarget}
                />
              </Box>
              <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
                <button hidden={1} ref={refSubmitButtom} type={'submit'} />
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
