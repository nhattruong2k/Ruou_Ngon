import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Card, Grid, Stack, TextField, Typography } from '@mui/material';
import useResponsive from '../../../hooks/useResponsive';

import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField, RHFUploadAvatar } from '../../../components/hook-form';
import GoodRsbToolbar from './GoodRsbToolbar';
import axios from '../../../utils/axios';

import { currencyFormatter, formatPriceNumber } from '../../../utils/formatNumber';
import { HOST_ASSETS_URL } from '../../../config';
import Iconify from '../../../components/iconify';
import GoodFileDialog from './GoodFileDialog';
// ----------------------------------------------------------------------

GoodAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentGood: PropTypes.object,
  onClose: PropTypes.func,
  goodCategories: PropTypes.array,
  unitOfMeasures: PropTypes.array,
  showDialogGoodBrand: PropTypes.func,
};

export default function GoodAddNewAndEditForm({
  isEdit = false,
  currentGood,
  goodBrands,
  goodCategories,
  refetchData,
  unitOfMeasures,
  onClose,
  showDialogGoodBrand,
}) {
  const refSubmitButtom = useRef();

  const { enqueueSnackbar } = useSnackbar();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [countAttachFiles, setCountAttachFiles] = useState(0);

  const [attachFilesParsed, setAttachFilesParsed] = useState([]);

  const [fileRemoves, setFileRemoves] = useState([]);

  const isDesktop = useResponsive('up', 'sm');

  const isMobile = useResponsive('down', 'sm');

  const NewGoodSchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên sản phẩm'),
    code: Yup.string().required('Nhập mã sản phẩm'),
    good_category_id: Yup.object().required('Chọn loại sản phẩm').nullable(true),
    unit_of_measure_id: Yup.object().required('Chọn đơn vị tính').nullable(true),
    // discount_rate: Yup.number()
    //   .when('max_discount_rate', (maxDiscountRate, schema) =>
    //     schema.test({
    //       test: (discountRate) => {
    //         if (discountRate === 0) return true;
    //         return discountRate < maxDiscountRate && Number(maxDiscountRate) > 0;
    //       },
    //       message: 'Tỉ lệ chiết khấu phải nhỏ hơn tỉ lệ chiết khấu tối đa',
    //     })
    //   )
    //   .nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentGood?.name || '',
      code: currentGood?.code || '',
      photo_image: '',
      good_category_id: currentGood?.good_category || null,
      unit_of_measure_id: currentGood?.unit_of_measure || null,
      volume: Number(currentGood?.volume) || 0,
      alcohol_level: Number(currentGood?.alcohol_level) || 0,
      // discount_rate: Number(currentGood?.discount_rate) || 0,
      max_discount_rate: Number(currentGood?.max_discount_rate) || 0,
      price: currencyFormatter(currentGood?.price) || 0,
      origin: currentGood?.origin || '',
      description: currentGood?.description || '',
      photo_quote: '',
      product_area: currentGood?.product_area || '',
      apllelation: currentGood?.apllelation || '',
      producer: currentGood?.producer || '',
      season: currentGood?.season || '',
      grape: currentGood?.grape || '',
      attachFiles: '',
      exp: currentGood?.exp || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentGood]
  );

  const methods = useForm({
    resolver: yupResolver(NewGoodSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (isEdit && currentGood) {
      reset(defaultValues);
      if (currentGood?.photo) {
        setValue('photo_image', `${HOST_ASSETS_URL}storage/__good_photos__/${currentGood?.photo}`);
      }
      if (currentGood?.photo_export) {
        setValue('photo_quote', `${HOST_ASSETS_URL}storage/__good_photos__/${currentGood?.photo_export}`);
      }
      if (currentGood?.attachedfiles) {
        const parsed = JSON.parse(currentGood?.attachedfiles);
        setAttachFilesParsed(parsed);
        setValue('attachFiles', parsed);
        setCountAttachFiles(parsed.length);
      }
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentGood]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    try {
      const newFormData = {
        ...formData,
        good_category_id: formData?.good_category_id?.id || '',
        unit_of_measure_id: formData?.unit_of_measure_id?.id || '',
        price: formatPriceNumber(formData?.price || ''),
        alcohol_level: Number(formData?.alcohol_level || 0),
        volume: Number(formData?.volume || 0),
        // discount_rate: Number(formData?.discount_rate || 0),
        max_discount_rate: Number(formData?.max_discount_rate || 0),
      };

      if (!isEdit) {
        await axios.post('goods', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
        reset();
      } else {
        newFormData._method = 'PUT';
        await axios.post(`goods/${currentGood.id}`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
      }
      refetchData();
      onClose();
      enqueueSnackbar(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm mới sản phẩm thành công!');
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
    (acceptedFiles, key) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file && key === 'image_good') {
        setValue('photo_image', newFile);
      } else {
        setValue('photo_quote', newFile);
      }
    },
    [setValue]
  );

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  return (
    <>
      <GoodRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        title={isEdit ? 'Cập nhật sản phẩm' : 'Thêm mới sản phẩm'}
        loadingBtnSave={loadingBtnSave}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ mb: 3 }}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                {isDesktop && (
                  <>
                    <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 2 }}>
                      Hình ảnh sản phẩm
                    </Typography>
                    <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 2 }}>
                      Hình ảnh báo giá
                    </Typography>
                  </>
                )}
                {isMobile && (
                  <>
                    <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 2 }}>
                      Hình ảnh sản phẩm
                    </Typography>
                  </>
                )}
                <RHFUploadAvatar
                  name="photo_image"
                  maxSize={3145728}
                  onDrop={(acceptedFiles) => handleDrop(acceptedFiles, 'image_good')}
                />
                
                {isMobile && (
                  <>
                    <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 2, mt:3 }}>
                      Hình ảnh báo giá
                    </Typography>
                  </>
                )}
                <RHFUploadAvatar
                  name="photo_quote"
                  maxSize={3145728}
                  onDrop={(acceptedFiles) => handleDrop(acceptedFiles, 'image_quote')}
                />
              </Box>
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
                <RHFTextField size="small" name="code" label="Mã sản phẩm*" />
                <RHFTextField size="small" name="name" label="Tên sản phẩm*" />
                <RHFAutocomplete
                  name="good_category_id"
                  autoHighlight
                  size="small"
                  sx={{ width: '100%' }}
                  options={goodCategories.map((option) => option)}
                  getOptionDisabled={(option) => option.count > 0}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('good_category_id', newValue);
                    clearErrors(['good_category_id']);
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <div>
                        <Box
                          component="span"
                          sx={{
                            typography: 'subtitle2',
                            textTransform: 'capitalize',
                            color: option.count > 0 ? 'primary.main' : 'text,primary',
                          }}
                        >
                          {option.nameCustom}
                        </Box>
                      </div>
                    </Box>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.good_category_id)}
                      helperText={errors.good_category_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn loại sản phẩm*"
                    />
                  )}
                />
                <RHFAutocomplete
                  name="unit_of_measure_id"
                  autoHighlight
                  size="small"
                  sx={{ width: '100%' }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={unitOfMeasures.map((option) => option)}
                  onChange={(event, newValue) => {
                    setValue('unit_of_measure_id', newValue);
                    clearErrors(['unit_of_measure_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.unit_of_measure_id)}
                      helperText={errors.unit_of_measure_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Đơn vị tính*"
                    />
                  )}
                />
                <RHFTextField size="small" name="producer" label="Nhà sản xuất" />
                <RHFTextField size="small" name="product_area" label="Vùng sản xuất" />
                <RHFTextField size="small" name="origin" label="Quốc gia" />
                <RHFTextField size="small" name="apllelation" label="Apllelation, Denomination" />
                <RHFTextField size="small" name="season" label="Niên vụ" />
                <RHFTextField size="small" name="grape" label="Giống nho" />
                <RHFTextField
                  size="small"
                  name="volume"
                  label="Dung tích"
                  type="number"
                  onChange={(event) => {
                    const { value } = event.target;
                    if (Number(value) > 0) {
                      setValue('volume', value);
                    } else {
                      setValue('volume', 0);
                      enqueueSnackbar('Dung tích phải lớn hơn 0', { variant: 'error' });
                    }
                  }}
                />
                <RHFTextField
                  size="small"
                  name="alcohol_level"
                  label="Nồng độ cồn"
                  type="number"
                  inputProps={{
                    maxLength: 4,
                  }}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (Number(value) > 0) {
                      setValue('alcohol_level', value);
                    } else {
                      setValue('alcohol_level', 0);
                      enqueueSnackbar('Nồng độ cồn phải lớn hơn 0', { variant: 'error' });
                    }
                  }}
                />
                <RHFTextField
                  size="small"
                  name="price"
                  label="Giá"
                  typeinput="price"
                  inputProps={{
                    maxLength: 15,
                  }}
                />
                <RHFTextField
                  size="small"
                  name="max_discount_rate"
                  label="Tỉ lệ chiết khấu tối đa"
                  type="number"
                  inputProps={{
                    maxLength: 4,
                  }}
                />
                <RHFTextField
                  size="small"
                  name="exp"
                  label="Hạn sử dụng"
                  inputProps={{
                    maxLength: 255,
                  }}
                />
                {/* <RHFTextField
                  size="small"
                  name="discount_rate"
                  label="Tỉ lệ chiết khấu"
                  type="number"
                  inputProps={{
                    maxLength: 4,
                  }}
                /> */}
                <Button
                  key="btn2"
                  variant="contained"
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  onClick={handleOpenUploadFile}
                >
                  Tải lên file đính kèm {countAttachFiles > 0 && `( ${countAttachFiles} file )`}
                </Button>
                <GoodFileDialog
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
              </Box>
              <RHFTextField name="description" sx={{ pb: 2 }} label="Mô tả" fullWidth multiline rows={3} />
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
