import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useRef, useState } from 'react';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Divider, Grid, Stack, TextField } from '@mui/material';
import OrganizationRsbToolbar from './OrganizationRsbToolbar';
// routes
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { useDispatch, useSelector } from '../../../redux/store';
import { getProvinces, getWardByDistrictId } from '../../../redux/slices/geographicBoundaries';

// ----------------------------------------------------------------------

OrganizationAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentInternalOrg: PropTypes.object,
};

export default function OrganizationAddNewAndEditForm({
  isEdit = false,
  onClose,
  refetchData,
  internalOrgs,
  currentInternalOrg,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const refSubmitButtom = useRef();

  const dispatch = useDispatch();

  const newInternalOrgSchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên tổ chức'),
    code: Yup.string().required('Nhập mã tổ chức'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentInternalOrg?.name || '',
      code: currentInternalOrg?.code || '',
      address: currentInternalOrg?.address || '',
      province_id: currentInternalOrg?.province_id || '',
      ward_id: currentInternalOrg?.ward_id || '',
      district_id: currentInternalOrg?.district_id || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentInternalOrg]
  );

  const methods = useForm({
    resolver: yupResolver(newInternalOrgSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
    trigger,
  } = methods;

  const provinces = useSelector((state) => state.geographic.provinces);

  const districts = useSelector((state) => state.geographic.districts);

  const wards = useSelector((state) => state.geographic.wards);

  const isLoading = useSelector((state) => state.geographic.isLoading);

  const [districtItems, setDistrictItems] = useState([]);

  const [wardItems, setWardItems] = useState([]);

  const [provinceValue, setProvinceValue] = useState(null);

  const [districtValue, setDistrictValue] = useState(null);

  const [wardValue, setWardValue] = useState(null);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  useEffect(() => {
    if (isEdit && currentInternalOrg) {
      reset(defaultValues);
      setProvinceValue(currentInternalOrg?.province || null);
      setDistrictValue(currentInternalOrg?.district || null);
      setWardValue(currentInternalOrg?.ward || null);

      if (currentInternalOrg?.district) {
        dispatch(getWardByDistrictId(currentInternalOrg?.district?.id));
        setWardItems(wards);
      }
    }
    if (!isEdit) {
      reset(currentInternalOrg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentInternalOrg]);

  useEffect(() => {
    dispatch(getProvinces());
  }, [dispatch]);

  const provinceOnChange = (newValue) => {
    const updateDistricts = districts.filter((item) => item.province_id === newValue.id);
    setDistrictItems(updateDistricts);
    setDistrictValue({});
    setWardValue({});
    setValue('district_id', null);
    setValue('ward_id', null);
    setWardItems([]);
  };

  const getDistrictByName = (name) => {
    const district = districts.find((item) => item.name === name);
    setDistrictValue(district);
  };

  const getWardByName = (name) => {
    const ward = wards.find((item) => item.name === name);
    setWardValue(ward);
  };

  const getProvinceByName = (name) => {
    const province = provinces.find((item) => item.name === name);
    setProvinceValue(province);
  };

  const districtOnChange = (district) => {
    dispatch(getWardByDistrictId(district.id));
    setWardValue({});
  };

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    try {
      const newFormData = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        ward_id: formData.ward_id,
        district_id: formData.district_id,
        province_id: formData.province_id,
      };
      setLoadingBtnSave(true);
      if (!isEdit) {
        await axios.post('internal-orgs', newFormData);
        reset();
        resetData();
      } else {
        await axios.put(`internal-orgs/${currentInternalOrg.id}`, newFormData);
      }
      setLoadingBtnSave(false);
      enqueueSnackbar(!isEdit ? 'Tạo thành công!' : 'Cập nhật thành công!');
      refetchData();
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

  useEffect(() => {
    if (!isLoading && districts) {
      setDistrictItems(districts.filter((item) => item.province_id === provinceValue?.id));
    }

    if (!isLoading && wards) {
      setWardItems(wards);
    }
  }, [isLoading]);

  const resetData = () => {
    setDistrictValue(null);
    setProvinceValue(null);
    setWardValue(null);
  };

  return (
    <>
      <OrganizationRsbToolbar
        onSave={onSave}
        title={isEdit ? 'Cập nhật thông tin tổ chức' : 'Thêm thông tin tổ chức'}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
      />
      <Divider />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2, boxShadow: 0, pt: 4 }}>
              <Box
                rowGap={3}
                columnGap={2}
                sx={{ pb: 3 }}
                display="grid"
                direction="column"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField size="small" name="name" label="Tên tổ chức*" />
                <RHFTextField size="small" name="code" label="Mã tổ chức" />

                <RHFAutocomplete
                  name="province_id"
                  autoHighlight
                  options={provinces || []}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={provinceValue}
                  onChange={(event, newValue) => {
                    setValue('province_id', newValue.id);
                    setProvinceValue(newValue);
                    provinceOnChange(newValue);
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Tỉnh (thành phố)" />}
                />
                <RHFAutocomplete
                  name="district_id"
                  value={districtValue || []}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={districtItems || []}
                  getOptionLabel={(option) => option.name || ''}
                  onChange={(event, newValue) => {
                    setValue('district_id', newValue.id);
                    setDistrictValue(newValue);
                    districtOnChange(newValue);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Quận(Huyện)" />}
                />
                <RHFAutocomplete
                  name="ward_id"
                  limitTags={2}
                  value={wardValue}
                  key={(option, value) => option.id === value.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={wardItems.map((option) => option)}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  onChange={(event, newValue) => {
                    setValue('ward_id', newValue.id);
                    setWardValue(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" label="Xã (Phường)" />}
                />
                <RHFTextField name="address" size="small" label="Đường, số nhà..." fullWidth />
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
