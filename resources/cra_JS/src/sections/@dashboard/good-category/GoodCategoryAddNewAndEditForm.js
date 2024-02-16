import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useRef, useEffect, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Grid, Stack, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useSelector } from '../../../redux/store';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../../components/hook-form';
import GoodCategorySbrToolbar from './GoodCategorySbrToolbar';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

GoodCategoryAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentGoodCategory: PropTypes.object,
  onClose: PropTypes.func,
};

export default function GoodCategoryAddNewAndEditForm({ isEdit, onClose, currentGoodCategory, refetchData }) {
  const { enqueueSnackbar } = useSnackbar();

  const refSubmitButtom = useRef();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const goodCategories = useSelector((state) => state.goodCategory.goodCategories);

  const colorParent = '#ff7f50';

  const newGoodCategorySchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên loại sản phẩm'),
    code: Yup.string().required('Nhập mã loại sản phẩm'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentGoodCategory?.name || '',
      code: currentGoodCategory?.code || '',
      parent_id: currentGoodCategory?.good_category || null,
      comment: currentGoodCategory?.comment || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentGoodCategory]
  );

  const methods = useForm({
    resolver: yupResolver(newGoodCategorySchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentGoodCategory) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentGoodCategory]);

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const newFormData = {
      ...formData,
      parent_id: formData?.parent_id?.id || ''
    }
    try {
      if (isEdit) {
        await axios.put(`good-categories/${currentGoodCategory.id}`, newFormData);
      } else {
        await axios.post('good-categories', newFormData);
        reset();
      }

      enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      refetchData();
      setLoadingBtnSave(false);
    } catch (error) {
      console.error(error);
      setLoadingBtnSave(false);
    }
  };

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  return (
    <>
      <GoodCategorySbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        title={isEdit ? 'Cập nhật loại sản phẩm' : 'Thêm mới loại sản phẩm'}
        loadingBtnSave={loadingBtnSave}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ p: 3, borderRadius: 0, border: 0 }}>
              <RHFTextField sx={{ mb: 3 }} size="small" name="name" label="Tên loại vật tư*" />
              <RHFTextField sx={{ mb: 3 }} size="small" name="code" label="Mã loại vật tư*" />

              <RHFAutocomplete
                name="parent_id"
                autoHighlight
                options={goodCategories.map((option) => option)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  setValue('parent_id', newValue);
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id} style={{ color: !option.parent_id ? colorParent : '' }}>
                      {option.nameCustom}
                    </li>
                  );
                }}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField {...params} sx={{ mb: 3 }} fullWidth size="small" label="Thuộc loại sản phẩm" />
                )}
              />

              <RHFTextField name="comment" sx={{ pb: 2 }} label="Ghi chú" size="small" fullWidth multiline rows={3} />
            </Card>
            <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
              <button hidden={1} ref={refSubmitButtom} type={'submit'} />
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
