import * as Yup from 'yup';

import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Box, Grid, Card, Checkbox, Chip, Stack, Button, TextField, Typography, FormControlLabel, FormGroup, FormLabel, ListSubheader } from '@mui/material';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import Autocomplete from '@mui/material/Autocomplete';
import { styled, lighten, darken } from '@mui/system';

import FormProvider, {
  RHFEditor,
  RHFTextField,
  RHFAutocomplete,
} from '../../../components/hook-form';
import axios from '../../../utils/axios';
import Iconify from '../../../components/iconify';
import BlogFileDialog from './BlogFileDialog';
import BlogFormToolbar from './BlogFormToolbar';

// ----------------------------------------------------------------------
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor:
    theme.palette.mode === 'light'
      ? lighten(theme.palette.primary.light, 0.85)
      : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
  padding: 0,
});

export default function BlogTableAddNewAndEditForm({
  isEdit = false,
  currentBlog,
  refetchData,
  onClose,
  internalOrgs,
  employees,
}) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [openPreView, setOpenPreView] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [countAttachFiles, setCountAttachFiles] = useState(0);

  const [attachFilesParsed, setAttachFilesParsed] = useState([]);

  const [fileRemoves, setFileRemoves] = useState([]);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [EmployeeAll, setEmployeeAll] = useState([
    { id: 'selectAll', name: 'Chọn tất cả' },
    ...groupEmployeesByWarehouse(employees),
  ]);

  const refSubmitButtom = useRef();

  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required('Nhập tiêu đề'),
    description: Yup.string().required('Nhập nội dung'),
    internal_org_id: Yup.array().min(1, 'Chọn kho').nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentBlog?.title || '',
      description: currentBlog?.description || '',
      internal_org_id: currentBlog?.blog_internal_org?.map(item => item.internal_org) || [],
      employee_id: currentBlog?.blog_employee?.map(item => item.employee) || [],
      attachFiles: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentBlog]
  );
  const methods = useForm({
    resolver: yupResolver(NewBlogSchema),
    defaultValues,
  })

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  const values = watch();

  const handleOpenPreview = () => {
    setOpenPreView(true);
  };

  useEffect(() => {
    if (isEdit && currentBlog) {
      reset(defaultValues);
      if (currentBlog?.attachments) {
        const parsed = JSON.parse(currentBlog?.attachments);
        setAttachFilesParsed(parsed);
        setValue('attachFiles', parsed);
        setCountAttachFiles(parsed.length);
      }
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentBlog]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const handleClosePreview = () => {
    setOpenPreView(false);
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    try {

      const newFormData = {
        ...formData,
        title: formData?.title || '',
        description: formData?.description || '',
        internal_org_id: formData?.internal_org_id.filter((item) => item.id !== 'selectAll'),
        employee_id: formData?.employee_id.filter((item) => item.id !== 'selectAll'),
      };

      if (!isEdit) {
        await axios.post('blogs', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
        reset();
      } else {
        newFormData._method = 'PUT';
        await axios.post(`blogs/${currentBlog.id}`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
      }
      refetchData();
      onClose();
      enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      setLoadingBtnSave(false);
    } catch (error) {
      console.error(error);
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
        setValue('attachFiles', newFile);
      }
    },
    [setValue]
  );

  const handleRemoveFile = () => {
    setValue('attachFiles', null);
  };

  function groupEmployeesByWarehouse(employees, selectWarehouse = []) {
    const groupedEmployees = {};

    employees.forEach(employee => {
      const checkWarehouse = selectWarehouse.filter((item) => item.id === employee?.internal_org?.id);
      if (checkWarehouse.length > 0) {
        const warehouseId = employee?.internal_org?.id;
        if (!groupedEmployees[warehouseId]) {
          groupedEmployees[warehouseId] = {
            warehouseName: employee?.internal_org?.name,
            employees: [],
          };
        }
        groupedEmployees[warehouseId].employees.push(employee);
      }
    });

    return Object.values(groupedEmployees).flatMap(group => [
      ...group.employees,
    ]);
  }

  const internalOrgAll = [
    { id: 'selectAll', name: 'Chọn tất cả' },
    ...internalOrgs,
  ];

  return (
    <>
      <BlogFormToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        title={isEdit ? 'Cập nhật' : 'Thêm mới'}
        loadingBtnSave={loadingBtnSave}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
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
                <RHFTextField name="title" label="Tiêu đề bài đăng" size="small" />
                <RHFAutocomplete
                  name="internal_org_id"
                  loading={internalOrgs.isLoading}
                  multiple
                  autoHighlight
                  disableCloseOnSelect
                  limitTags={1}
                  size="small"
                  sx={{ width: '100%' }}
                  options={internalOrgAll.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    let selectWarehouse = [];
                    const checkSelectAll = newValue.filter((item) => item.id === "selectAll").length;
                    if (event.target.value === 0 || event.target.value === 'selectAll') {
                      if (checkSelectAll > 0) {
                        setValue('internal_org_id', internalOrgAll);
                        selectWarehouse = internalOrgAll;
                      } else {
                        setValue('internal_org_id', []);
                        selectWarehouse = [];
                      }
                    } else {
                      setValue('internal_org_id', newValue.filter((item) => item.id !== "selectAll"));
                      selectWarehouse = newValue.filter((item) => item.id !== "selectAll");
                    }
                    clearErrors(['internal_org_id']);
                    setValue('employee_id', []);
                    setEmployeeAll([
                      { id: 'selectAll', name: 'Chọn tất cả' },
                      ...groupEmployeesByWarehouse(employees, selectWarehouse),
                    ])
                  }}
                  renderOption={(props, option, { selected }) => {
                    return (
                      <li {...props} key={option.id} value={option.id} style={{ textTransform: 'capitalize' }}>
                        <Checkbox
                          size="small"
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8, borderRadius: 4 }}
                          checked={selected}
                          value={option.id}
                        />
                        {option.name}
                      </li>
                    );
                  }}

                  noOptionsText={
                    <Typography variant="subtitle2" gutterBottom>
                      Không có kho
                    </Typography>
                  }
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.internal_org_id)}
                      helperText={errors.internal_org_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn kho*"
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

                <RHFAutocomplete
                  name="employee_id"
                  loading={employees.isLoading}
                  multiple
                  autoHighlight
                  disableCloseOnSelect
                  limitTags={1}
                  size="small"
                  sx={{ width: '100%' }}
                  options={EmployeeAll}
                  groupBy={(option) => option.internal_org?.name}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  onChange={(event, newValue) => {
                    const checkSelectAll = newValue.filter((item) => item.id === "selectAll").length;
                    if (event.target.value === 0 || event.target.value === 'selectAll') {
                      if (checkSelectAll > 0) {
                        setValue('employee_id', EmployeeAll);
                      } else {
                        setValue('employee_id', []);
                      }
                    } else {
                      setValue('employee_id', newValue.filter((item) => item.id !== "selectAll"));
                    }
                    clearErrors(['employee_id']);
                  }}
                  renderOption={(props, option, { selected }) => {
                    return (
                      <li {...props} key={option.id} value={option.id} style={{ textTransform: 'capitalize' }}>
                        <Checkbox
                          size="small"
                          icon={icon}
                          checkedIcon={checkedIcon}
                          checked={selected}
                          value={option.id}
                        />
                        {option.name}
                      </li>
                    );
                  }}
                  noOptionsText={
                    <Typography variant="subtitle2" gutterBottom>
                      Không có nhân viên
                    </Typography>
                  }
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.employee_id)}
                      helperText={errors.employee_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn nhân viên"
                    />
                  )}
                />
              </Box>


              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Nội dung
                </Typography>
                <RHFEditor simple name="description" />
              </Stack>


            </Card>
          </Grid>

          <BlogFileDialog
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
          <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
            <button hidden={1} ref={refSubmitButtom} type={'submit'} />
          </Stack>


        </Grid>
      </FormProvider>
    </>
  );
}