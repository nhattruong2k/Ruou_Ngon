import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../pages/style/style.css';
import {
  Box,
  Paper,
  Card,
  Grid,
  Stack,
  TextField,
  Button,
  Divider,
  TableContainer,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Scrollbar from '../../../components/scrollbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import CrSbrToolbar from './CrSbrToolbar';
import axios from '../../../utils/axios';

FormImportData.propTypes = {
  isEdit: PropTypes.bool,
  currentContact: PropTypes.any,
  internalOrgs: PropTypes.array,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function FormImportData({ isEdit = false, tabValue, currentContact, internalOrgs, title, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const refSubmitButtom = useRef();

  const [file, setFile] = useState(null);

  const [internalOrg, setInternalOrg] = useState(null);

  const [fileName, setFileName] = useState('');

  const [isCheckedInfoCustomer, setIsCheckedInFoCustomer] = useState(false);

  const [isCheckedInfoVehicle, setIsCheckedInFoVehicle] = useState(false);

  const formData = Yup.object().shape({
    file: null,
  });

  const defaultValues = useMemo(
    () => ({
      internal_org_id: null,
      file: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentContact]
  );

  const methods = useForm({
    resolver: yupResolver(formData),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentContact) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(currentContact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentContact]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async () => {
    const newFormData = new FormData();
    newFormData.append('file', file);
    newFormData.append('is_edit_customer', isCheckedInfoCustomer);
    newFormData.append('is_edit_vehicle', isCheckedInfoVehicle);
    newFormData.append('type', tabValue);
    newFormData.append('internal_org_id', internalOrg?.id || []);
    try {
      if (!isEdit) {
       const response = await axios.post('import-contact', newFormData);
      }
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const fileOnChange = (event) => {
    setFileName(event.target.files[0].name);
    setFile(event.target.files[0]);
  };

  return (
    <>
      <CrSbrToolbar
        onSave={onSave}
        title={title}
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
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                  <Scrollbar>
                    <Card sx={{ borderRadius: 1.5, mb: 3, mt: 4, ml: 2, mr: 2, p: 2 }}>
                      <Stack direction="column" justifyContent="start" alignItems="start">
                        <Typography variant="subtitle1"> Thông tin khách hàng </Typography>
                      </Stack>
                      <Box sx={{ borderRadius: 0 }}>
                        <Box sx={{ mt: 2, borderRadius: 0 }}>
                          <Box
                            rowGap={3}
                            sx={{ pb: 3, mt: 1 }}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                              xs: 'repeat(1, 1fr)',
                              sm: 'repeat(1, 1fr)',
                            }}
                          >
                            <RHFAutocomplete
                              name="internal_org_id"
                              options={internalOrgs}
                              size="small"
                              value={internalOrg}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              getOptionLabel={(option) => option.name || ''}
                              onChange={(event, newValue) => {
                                setInternalOrg(newValue);
                              }}
                              renderOption={(props, option, { selected }) => (
                                <li {...props} key={option.id}>
                                  <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                  />
                                  {option.name}
                                </li>
                              )}
                              renderInput={(params) => <TextField {...params} size="small" label="Cửa hàng*" />}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'flex-center' }}>
                              <RHFTextField
                                diabled="true"
                                name="file"
                                sx={{ mr: 0.5, maxWidth: 565 }}
                                value={fileName}
                                size="small"
                                label="Tải lên danh sách xe"
                              />
                              <Button variant="contained" size="normal" component="label">
                                Select file
                                <input hidden accept="csv/*" onChange={fileOnChange} multiple type="file" />
                              </Button>
                            </Box>

                            <Box
                              rowGap={1}
                              columnGap={1}
                              display="grid"
                              gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                sm: 'repeat(2, 1fr)',
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isCheckedInfoCustomer}
                                    onChange={(event) => {
                                      setIsCheckedInFoCustomer(event.target.checked);
                                    }}
                                  />
                                }
                                label="Cập nhật thông tin khách hàng"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isCheckedInfoVehicle}
                                    onChange={(event) => {
                                      setIsCheckedInFoVehicle(event.target.checked);
                                    }}
                                  />
                                }
                                label="Cập nhật thông tin xe"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </Scrollbar>
                </Box>
              </TableContainer>
              <button hidden={1} ref={refSubmitButtom} type={'submit'} />
            </Grid>
          </Grid>
        </FormProvider>
      </Scrollbar>
    </>
  );
}
