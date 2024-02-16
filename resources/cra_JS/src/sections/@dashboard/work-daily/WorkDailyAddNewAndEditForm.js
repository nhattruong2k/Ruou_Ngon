import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, TextField, Checkbox } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from '../../../redux/store';
import WorkDailySbrToolbar from './WorkDailySbrToolbar';
// components
import Label from '../../../components/label';
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField, RHFUploadAvatar } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import {useAuthContext} from "../../../auth/useAuthContext";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

WorkDailyAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentWorkDaily: PropTypes.object,
};

export default function WorkDailyAddNewAndEditForm({ isEdit = false, onClose, currentWorkDaily, refetchData, workCategories, employees }) {
  const dispatch = useDispatch();

  const refSubmitButtom = useRef();

  const { user } = useAuthContext();

  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));

  const [loading, setLoading] = useState(true);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newEmployeeSchema = Yup.object().shape({
    date: Yup.date().nullable().required('Vui lòng chọn ngày làm việc'),
    employee_id: Yup.object().required('Chọn nhân viên').nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      date: currentWorkDaily?.date || moment().format('YYYY-MM-DD'),
      employee_id: currentWorkDaily?.employee || user,
      work_category_id: currentWorkDaily?.work_categories || [],
      orther_work: currentWorkDaily?.orther_work
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWorkDaily]
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
    if (isEdit && currentWorkDaily) {
      setStartDate(currentWorkDaily?.date || null);
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentWorkDaily]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    try {
      const newFormData = {
        ...formData,
        date: formData.date === null ? null : moment(formData.date).format('YYYY-MM-DD'),
        employee_id: formData?.employee_id?.id || '',
      };
      if (isEdit) {
        await axios.put(`daily-works/${currentWorkDaily.id}`, newFormData);
      } else {
        await axios.post('daily-works', newFormData);
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

  return (
    <>
      <WorkDailySbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật báo cáo nhân viên' : 'Thêm báo cáo nhân viên'}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>


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

                <DatePicker
                  label="Ngày làm việc"
                  value={startDate}
                  name="date"
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue('date', newValue === null ? newValue : moment(newValue).format('YYYY-MM-DD'));
                    setStartDate(newValue);
                  }}
                  renderInput={(params) => <TextField
                    error={Boolean(errors.date)}
                    helperText={errors.date?.message}
                    {...params}
                    size="small" fullWidth />}
                />

                <RHFAutocomplete
                  name="employee_id"
                  autoHighlight
                  disabled
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={employees.map((option) => option)}
                  onChange={(event, newValue) => {
                    setValue('employee_id', newValue);
                    clearErrors(['employee_id']);
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
                      error={Boolean(errors.employee_id)}
                      helperText={errors.employee_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Nhân viên*"
                    />
                  )}
                />

              </Box>

              {/* <RHFAutocomplete
                sx={{ mt: 3 }}
                name="work_category_id"
                autoHighlight
                options={workCategories.map((option) => option)}
                loading={loading}
                limitTags={4}
                multiple={loading}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(event, newValue) => {
                  setValue('work_category_id', newValue);
                }}
                renderOption={(props, option, { selected }) => {
                  return (
                    <li {...props} key={option.id} style={{ textTransform: 'capitalize' }}>
                      <Checkbox
                        size="small"
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8, borderRadius: 4 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  );
                }}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField
                  error={Boolean(errors.work_category_id)}
                    helperText={errors.work_category_id?.message}
                    {...params}
                    fullWidth
                    size="small"
                    label="Danh mục công việc"
                  />
                )}
              /> */}
              <RHFTextField size="small" name="orther_work" label="Nội dung công việc" multiline rows={3} sx={{ mt: 3 }} />
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
