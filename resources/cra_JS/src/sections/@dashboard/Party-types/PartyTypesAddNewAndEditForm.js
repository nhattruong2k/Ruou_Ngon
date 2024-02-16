import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack } from '@mui/material';

import PartyTypesSbrToolbar from './PartyTypesSbrToolbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

PartyTypesAddNewAndEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentPartyTypes: PropTypes.object,
};

export default function PartyTypesAddNewAndEditForm({ isEdit = false, onClose, currentPartyTypes, refetchData }) {
  const refSubmitButtom = useRef();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const newPartyTypesSchema = Yup.object().shape({
    name: Yup.string().required('Nhập tên danh mục'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPartyTypes?.name || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPartyTypes]
  );
  const methods = useForm({
    resolver: yupResolver(newPartyTypesSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPartyTypes]);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);

    try {
      if (isEdit) {
        await axios.put(`partyTypes/${currentPartyTypes.id}`, formData);
      } else {
        await axios.post('partyTypes', formData);
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
      <PartyTypesSbrToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật loại khách hàng' : 'Thêm loại khách hàng'}
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
                  sm: 'repeat(1, 1fr)',
                }}
              >
                <RHFTextField size="small" name="name" label="Tên danh mục*" />
                <Stack alignItems="flex-start" direction="row" sx={{ mt: 3 }}>
                  <button hidden={1} ref={refSubmitButtom} type={'submit'} />
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
