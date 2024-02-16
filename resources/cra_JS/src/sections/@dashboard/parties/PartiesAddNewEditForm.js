import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from '../../../redux/store';
import { useSnackbar } from '../../../components/snackbar';
import { formatPriceNumber } from '../../../utils/formatNumber';
import FormProvider, { RHFAutocomplete, RHFRadioGroup, RHFTextField } from '../../../components/hook-form';
import { getProvinces, getWardByDistrictId } from '../../../redux/slices/geographicBoundaries';
import { getEmployees } from '../../../redux/slices/employee';
import { getCrCategories } from '../../../redux/slices/crCategory';
import PartiesRsbToolbar from './PartiesRsbToolbar';
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';
import PartiesHistoryCares from './PartiesHistoryCares';
import Iconify from '../../../components/iconify';
import { FOLDER_IMAGE } from '../../../utils/constant';
import PartiesFileDialog from './PartiesFileDialog';
// ----------------------------------------------------------------------

PartiesAddNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentParties: PropTypes.object,
  handleCloseDetails: PropTypes.func,
};

const GENDER_OPTION = [
  { label: 'Nam', value: 1 },
  { label: 'Nữ', value: 2 },
  { label: 'Khác', value: 0 },
];

export default function PartiesAddNewEditForm({ isEdit = false, onClose, currentParties, refetchData, partyTypes }) {
  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const { provinces, districts } = useSelector((state) => state.geographic);

  const wards = useSelector((state) => state.geographic.wards);

  const employees = useSelector((state) => state.employee.employees);

  const customerCareTypes = useSelector((state) => state.crCategory.customerCareTypes);

  const [dateOfBirthItem, setDateOfBirthItem] = useState(null);

  const [districtItems, setDistrictItems] = useState([]);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [loadingAttachment, setLoadingAttachment] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const refSubmitButton = useRef();

  const [triggerClickAdd, setTriggerClickAdd] = useState(0);

  const [customerCares, setCustomerCares] = useState([]);

  const [employeeCreate, setEmployeeCreate] = useState(user);

  const [countAttachFiles, setCountAttachFiles] = useState(0);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [attachFilesParsed, setAttachFilesParsed] = useState([]);

  const [fileRemoves, setFileRemoves] = useState([]);

  const [isPayment, setIsPayment] = useState(false);

  const NewPartiesSchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên khách hàng'),
    code: Yup.string().required('Nhập mã khách hàng'),
    party_type_id: Yup.object().required('Chọn nhóm khách hàng').nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentParties?.name || '',
      party_type_id: currentParties?.party_type || null,
      code: currentParties?.code || '',
      sex: currentParties?.sex || 0,
      date_of_birth: currentParties?.date_of_birth || null,
      photo: currentParties?.photo || '',
      phone: currentParties?.phone || '',
      email: currentParties?.email || '',
      address: currentParties?.address || '',
      ward_id: currentParties?.ward || null,
      district_id: currentParties?.district || null,
      province_id: currentParties?.province || null,
      debt_limit: currentParties?.debt_limit || '',
      discount_rate: currentParties?.discount_rate || 0,
      tin: currentParties?.tin || '',
      employee_id: currentParties?.employee_id || null,
      customer_cares: currentParties?.customer_cares || null,
      note: currentParties?.note || '',
      // percent: currentParties?.percent || '',
      attachFiles: currentParties?.attachment || '',
      attachment_note: currentParties?.attachment_note || '',
      max_debt_date: currentParties?.max_debt_date >= 0 ? currentParties?.max_debt_date : 180,
      old_debt: currentParties?.old_debt || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentParties, employees, user]
  );

  const methods = useForm({
    resolver: yupResolver(NewPartiesSchema),
    defaultValues,
  });

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

  useEffect(() => {
    if (isEdit && currentParties) {
      setIsPayment(currentParties?.is_payment);
      setDateOfBirthItem(currentParties.date_of_birth);
      setCustomerCares(currentParties.customer_cares);
      setEmployeeCreate(currentParties.employee);
      setValue('employee_id', currentParties?.employee);

      setDistrictItems(districts.filter((item) => item.province_id === currentParties?.province?.id));

      const itemCustomerCares = currentParties.customer_cares.map((element) => ({
        customer_care_id: element.id,
        care_date: element.date,
        customer_care_type_id: element.customer_care_type,
        description: element.description,
      }));
      setTimeout(() => {
        setValue('items', itemCustomerCares);
      }, 10);

      reset(defaultValues);
      if (currentParties?.attachment) {
        const parsed = JSON.parse(currentParties?.attachment);
        setAttachFilesParsed(parsed);
        setValue('attachFiles', parsed);
        setCountAttachFiles(parsed.length);
      }
    }

    if (!isEdit) {
      reset(defaultValues);

      // Set default employee create care
      // const employeeFilter = employees.find((item)=> item.id === user.id);
      // setEmployeeCreate(employeeFilter);
      // setValue('employee_id', employeeFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentParties, employees, user]);

  useEffect(() => {
    if (provinces.length === 0) dispatch(getProvinces());
    if (employees.length === 0) dispatch(getEmployees({}));
    if (customerCareTypes.length === 0) dispatch(getCrCategories({}));
  }, [dispatch]);

  const provinceOnChange = (newValue) => {
    const updateDistricts = districts.filter((item) => item.province_id === newValue?.id);
    setDistrictItems(updateDistricts);
    setValue('district_id', {});
  };

  const districtOnChange = (district) => {
    dispatch(getWardByDistrictId(district.id));
    setValue('ward_id', {});
  };

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  const addItem = () => {
    setTriggerClickAdd((triggerClickAdd) => triggerClickAdd + 1);
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);

    let newCustomerCares = [];
    if (formData?.items) {
      newCustomerCares = formData?.items.filter((item) => item.customer_care_type_id !== null && item.date !== null);
    }

    try {
      const newFormData = {
        party_type_id: formData?.party_type_id?.id || null,
        name: formData.name,
        code: formData.code,
        sex: formData.sex,
        phone: formData.phone,
        email: formData.email,
        date_of_birth: dateOfBirthItem ? moment(formData.date_of_birth).format('YYYY-MM-DD') : null,
        address: formData.address,
        ward_id: formData?.ward_id?.id || null,
        province_id: formData?.province_id?.id || null,
        district_id: formData?.district_id?.id || null,
        debt_limit: formatPriceNumber(formData?.debt_limit || ''),
        discount_rate: formData?.discount_rate || null,
        employee_id: formData?.employee_id?.id || null,
        customerCares: newCustomerCares || [],
        note: formData?.note,
        tin: formData?.tin,
        // percent: formData?.percent,
        attachFiles: formData?.attachFiles,
        attachment_note: formData?.attachment_note,
        max_debt_date: formData?.max_debt_date !== '' && formData?.max_debt_date >= 0 ? formData?.max_debt_date : 180,
        old_debt: formatPriceNumber(formData?.old_debt || ''),
      };

      if (!isEdit) {
        await axios.post('parties', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
        setValue('items', []);
        setDistrictItems(districts);
        setEmployeeCreate({});
        setDateOfBirthItem(null);
        reset(defaultValues);
      } else {
        newFormData._method = 'PUT';
        newFormData.fileRemoved = formData.fileRemoved || [];
        await axios.post(`parties/${currentParties.id}`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
      }
      enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      refetchData();
      setLoadingBtnSave(false);
      onClose();
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
    (event) => {
      const file = event.target.files[0];

      if (file) {
        const newFile = new File([file], file.name, { type: file.type });
        newFile.preview = URL.createObjectURL(file);

        setValue(`attachment_file`, newFile);
      }
    },
    [setValue]
  );

  const downloadFile = (fileUrl) => {
    setLoadingAttachment(true);

    axios
      .get(`download-file/${fileUrl}/${FOLDER_IMAGE.party_attachment}`, {
        method: 'GET',
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${currentParties.name}_${fileUrl}`);
        document.body.appendChild(link);
        link.click();
        setLoadingAttachment(false);
      })
      .catch((error) => {
        setLoadingAttachment(false);
        enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
      });
  };

  const handleScroll = (event) => {
    event.target.blur();
    event.stopPropagation();
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  return (
    <>
      <PartiesRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={onClose}
        title={isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
        loadingBtnSave={loadingBtnSave}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
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
                <RHFTextField size="small" name="code" label="Mã khách hàng*" />
                <RHFTextField size="small" name="name" label="Tên khách hàng*" />
                <RHFTextField size="small" name="email" label="Email" />
                <RHFTextField size="small" name="phone" label="Số điện thoại" />
                <DatePicker
                  label="Ngày sinh"
                  name="date_of_birth"
                  value={dateOfBirthItem}
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('date_of_birth', newValue);
                    setDateOfBirthItem(newValue === null ? null : moment(newValue).format('YYYY-MM-DD'));
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />

                <RHFTextField size="small" name="tin" label="Mã số thuế" />

                <RHFAutocomplete
                  name="party_type_id"
                  autoHighlight
                  options={partyTypes.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('party_type_id', newValue);
                    clearErrors(['party_type_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.party_type_id)}
                      helperText={errors.party_type_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn nhóm khách hàng*"
                    />
                  )}
                />

                <RHFAutocomplete
                  name="province_id"
                  autoHighlight
                  options={provinces.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('province_id', newValue);
                    provinceOnChange(newValue);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" label="Thuộc tỉnh (thành phố)*" />
                  )}
                />
                <RHFAutocomplete
                  name="district_id"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={districtItems || []}
                  getOptionLabel={(option) => option.name || ''}
                  onChange={(event, newValue) => {
                    setValue('district_id', newValue);
                    districtOnChange(newValue);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Thuộc quận (huyện)" />}
                />
                <RHFAutocomplete
                  name="ward_id"
                  key={(option, value) => option.id === value.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={wards.map((option) => option)}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setValue('ward_id', newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Thuộc xã (phường)" />}
                />
                <RHFTextField name="address" label="Địa chỉ nhà" size="small" fullWidth />
                <RHFAutocomplete
                  name="employee_id"
                  autoHighlight
                  value={employeeCreate}
                  options={employees.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('employee_id', newValue);
                    setEmployeeCreate(newValue);
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
                      label="Chọn người tạo"
                    />
                  )}
                />

                <Button
                  key="btn2"
                  variant="contained"
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  onClick={handleOpenUploadFile}
                >
                  Tải lên file đính kèm {countAttachFiles > 0 && `( ${countAttachFiles} file )`}
                </Button>
                <PartiesFileDialog
                  open={openUploadFile}
                  onClose={handleCloseUploadFile}
                  refetchData={refetchData}
                  attachments={(files) => {
                    setCountAttachFiles(files?.length || 0);
                    setValue('attachFiles', files);
                    setAttachFilesParsed(files);
                  }}
                  attachFiles={attachFilesParsed}
                  isEdit={isEdit}
                  fileRemove={(file) => {
                    setFileRemoves((prevState) => {
                      const newState = [...prevState, file];
                      setValue('fileRemoved', newState);

                      return newState;
                    });
                  }}
                />

                {/* <RHFTextField
                  name="percent"
                  label="Hoa hồng %"
                  size="small"
                  fullWidth
                  typeinput="price"
                  inputProps={{ maxLength: 15 }}
                /> */}

                <RHFTextField
                  onWheel={handleScroll}
                  name="max_debt_date"
                  label="Ngày nợ tối đa"
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ maxLength: 15 }}
                />

                <RHFTextField
                  name="debt_limit"
                  label="Công nợ"
                  size="small"
                  fullWidth
                  typeinput="price"
                  inputProps={{ maxLength: 15 }}
                />

                <RHFTextField
                  name="old_debt"
                  label="Công nợ cũ"
                  size="small"
                  fullWidth
                  typeinput="price"
                  inputProps={{ maxLength: 15 }}
                  disabled={isPayment}
                />

                <RHFTextField
                  onWheel={handleScroll}
                  name="discount_rate"
                  label="Chiết khấu %"
                  size="small"
                  type="number"
                  fullWidth
                  inputProps={{ maxLength: 15 }}
                />

                <RHFTextField name="note" label="Ghi chú" size="small" fullWidth />
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
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                  }}
                >
                  <div>
                    <Typography variant="h6" gutterBottom>
                      Lịch sử chăm sóc
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

                <PartiesHistoryCares
                  triggerClickAdd={triggerClickAdd}
                  customerCareTypes={customerCareTypes}
                  currentParties={currentParties}
                  refetchData={refetchData}
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
