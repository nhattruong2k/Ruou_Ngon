import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, TextField } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from '../../../redux/store';
import EmployeeSbrToolbar from './EmployeeSbrToolbar';
// components
import Label from '../../../components/label';
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFSwitch, RHFAutocomplete, RHFTextField, RHFUploadAvatar, RHFRadioGroup } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { getProvinces, getWardByDistrictId } from '../../../redux/slices/geographicBoundaries';
import { getInternalOrg } from '../../../redux/slices/internalOrg';
import { getUrlDomain } from '../../../redux/slices/utils';

// ----------------------------------------------------------------------

EmployeeAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentEmployee: PropTypes.object,
};

const GENDER_OPTION = [
  { label: 'Nam', value: 1 },
  { label: 'Nữ', value: 2 },
  { label: 'Khác', value: 0 },
];

export default function EmployeeAddNewAndEditForm({ isEdit = false, onClose, currentEmployee, refetchData }) {
  const dispatch = useDispatch();

  const refSubmitButtom = useRef();

  const { provinces, districts, wards } = useSelector((state) => state.geographic);
  
  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const { Url } = useSelector((state) => state.util);

  const [districtItems, setDistrictItems] = useState(districts);

  const [hireDate, setHireDate] = useState(null);

  const [dateOfBirth, setDateOfBirth] = useState(null);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newEmployeeSchema = Yup.object().shape({
    username: Yup.string().required('Nhập tên tài khoản'),
    email: Yup.string().email('Email không hợp lệ').required('Nhập email'),
    name: Yup.string().required('Nhập tên nhân viên'),
    code: Yup.string().required('Nhập mã nhân viên'),
    internal_org_id: Yup.object().required('Chọn nơi công tác').nullable(true),
    password: Yup.string().min(6, 'Mật khẩu ít nhất phải có 6 kí tự')
  });

  const defaultValues = useMemo(
    () => ({
      name: currentEmployee?.name || '',
      code: currentEmployee?.code || '',
      photo_image: '',
      sex: currentEmployee?.sex || 0,
      active_flag: true,
      date_of_birth: currentEmployee?.date_of_birth || null,
      hire_date: currentEmployee?.hire_date || null,
      address: currentEmployee?.address || '',
      username: currentEmployee?.username || '',
      email: currentEmployee?.email || '',
      phone: currentEmployee?.phone || '',
      internal_org_id: currentEmployee?.internal_org || '',
      passwordNew: '',
      position: currentEmployee?.position || '',
      is_edit: isEdit

    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentEmployee]
  );

  const methods = useForm({
    resolver: yupResolver(newEmployeeSchema),
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
    if (isEdit && currentEmployee) {
      setHireDate(currentEmployee?.hire_date || null);
      setDateOfBirth(currentEmployee?.date_of_birth || null);
      reset(defaultValues);
      if (currentEmployee?.photo) {
        setValue('photo_image', `${Url}storage/__employee_photos__/${currentEmployee?.photo}`);
      }
      if (!currentEmployee?.active_flag) {
        setValue('active_flag', false);
      } else setValue('active_flag', true);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentEmployee, Url]);

  useEffect(() => {
    dispatch(getProvinces());
    dispatch(getInternalOrg());
    dispatch(getUrlDomain());
  }, []);

  const provinceOnChange = (newValue) => {
    const updateDistricts = districts.filter((item) => item.province_id === newValue.id);
    setDistrictItems(updateDistricts);
    setValue('district_id', null);
  };

  const districtOnChange = (district) => {
    dispatch(getWardByDistrictId(district.id));
    setValue('ward_id', null);
  };

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    try {
      const newFormData = {
        ...formData,
        hire_date: formData.hire_date === null ? null : moment(formData.hire_date).format('YYYY-MM-DD'),
        date_of_birth: formData.date_of_birth === null ? null : moment(formData.date_of_birth).format('YYYY-MM-DD'),
        internal_org_id: formData?.internal_org_id?.id || '',
        active_flag: formData?.active_flag === true ? 1 : 0
      };
      if (isEdit) {
        newFormData._method = 'PUT';
        await axios.post(`employees/${currentEmployee.id}`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
      } else {
        await axios.post('employees', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
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
      }
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photo_image', newFile);
      }
    },
    [setValue]
  );
  return (
    <>
      <EmployeeSbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ pt: 5, pb: 0, px: 2, borderRadius: 0, border: 0 }}>
              <Box sx={{ mb: 0 }}>
                <RHFUploadAvatar name="photo_image" maxSize={3145728} onDrop={handleDrop} />
              </Box>
              <Stack direction="row" justifyContent={'flex-end'}>
                <RHFSwitch name="active_flag" label="Hoạt động" />
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ p: 3, borderRadius: 0, border: 0, boxShadow: 'none' }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField size="small" name="name" label="Tên nhân viên*" />
                <RHFTextField size="small" name="code" label="Mã nhân viên*" />
                <RHFTextField size="small" name="username" label="Tên tài khoản*" />
                <RHFTextField size="small" name="email" label="Email*" />
                <RHFTextField size="small" type="password" name="passwordNew" label="Mật khẩu" />
                <RHFAutocomplete
                  name="internal_org_id"
                  autoHighlight
                  options={internalOrgs.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('internal_org_id', newValue);
                    clearErrors(['internal_org_id']);
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.internal_org_id)}
                      helperText={errors.internal_org_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Nơi công tác*"
                    />
                  )}
                />
                <RHFTextField name="phone" size="small" label="Số điện thoại" />
                <RHFTextField name="position" size="small" label="Chức vụ" />


                <DatePicker
                  label="Ngày sinh"
                  value={dateOfBirth}
                  sx={{ width: '100%' }}
                  name="date_of_birth"
                  onChange={(newValue) => {
                    setValue('date_of_birth', newValue === null ? newValue : moment(newValue).format('YYYY-MM-DD'));
                    setDateOfBirth(newValue);
                  }}
                  renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                />

                <DatePicker
                  label="Ngày bắt đầu"
                  value={hireDate}
                  name="hire_date"
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('hire_date', newValue === null ? newValue : moment(newValue).format('YYYY-MM-DD'));
                    setHireDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
                <RHFTextField size="small" name="address" label="Địa chỉ" />
                <Stack spacing={1}>
                  <RHFRadioGroup
                    name="sex"
                    options={GENDER_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { ml: 0.5 },
                    }}
                  />
                </Stack>
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
