import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from '../../../redux/store';
import { useSnackbar } from '../../../components/snackbar';
import { formatPriceNumber } from '../../../utils/formatNumber';
import FormProvider, { RHFSwitch, RHFTextField, RHFRadioGroup, RHFAutocomplete } from '../../../components/hook-form';
import { getGoods } from '../../../redux/slices/good';
import { getParties } from '../../../redux/slices/parties';
import { getOrderSampleById } from '../../../redux/slices/orderSample';
import PartiesRsbToolbar from './PartiesRsbToolbar';
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';
import GoodDetail from './GoodDetail';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

OrderSampleForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  handleCloseDetails: PropTypes.func,
};

export default function OrderSampleForm({ isEdit = false, onClose, currentData, refetchData }) {
  const dispatch = useDispatch();

  const { user } = useAuthContext();

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const refSubmitButton = useRef();

  const goodDetailRef = useRef();

  const goodData = useSelector((state) => state.good);

  const PartyData = useSelector((state) => state.parties);

  let dataOrderSample = useSelector((state) => state.orderSample.orderByIdData);

  const NewPartiesSchema = Yup.object().shape({
    party_id: Yup.object().required('Chọn khách hàng').nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      comment: currentData?.comment || '',
      party_id: currentData?.party || null,
      goods: [],
    }),
    [currentData, user]
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
    getValues,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
    trigger,
  } = methods;

  useEffect(() => {
    dataOrderSample = '';
    dispatch(getGoods());
    dispatch(getParties());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && currentData) {
      dispatch(getOrderSampleById(currentData.id));
      reset(defaultValues);
    }

    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentData, user]);

  useEffect(() => {
    if (!dataOrderSample.isLoading && dataOrderSample.orderSample) {
      goodDetailRef?.current?.setGoodList(dataOrderSample.orderSample);
    }
  }, [dataOrderSample]);

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const formDataGoods = (formData?.goods || []).filter((item) => Number(item.discount) > 0);
    if (formDataGoods.length > 0) {
      try {
        const newFormData = {
          party_id: formData?.party_id?.id || null,
          comment: formData?.comment || '',
          goods: formDataGoods.map((item) => ({
            ...item,
            discount: formatPriceNumber(item.price_after_discount),
            percent_discount: item.discount,
          })),
        };

        if (!isEdit) {
          await axios.post('order-samples', newFormData);
          // reset(defaultValues);
          setValue('comment', '');
          setValue('party_id', null);
          setValue('goods', []);
          goodDetailRef?.current?.clearForm();
        } else {
          await axios.put(`order-samples/${currentData.id}`, newFormData);
        }
        enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
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
        } else enqueueSnackbar(error?.data?.message, { variant: 'error' });
      }
    } else {
      setLoadingBtnSave(false);
      enqueueSnackbar('Vui lòng chọn sản phẩm và nhập chiết khấu', { variant: 'error' });
    }
  };

  const addItem = () => {
    goodDetailRef?.current?.handleOpenFrom();
  };

  return (
    <>
      {isEdit && dataOrderSample.isLoading && (
        <Box className={'c-box__loading_v2'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}

      <PartiesRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        onCloseDetails={onClose}
        title={isEdit ? 'Cập nhật đơn hàng mẫu' : 'Thêm đơn hàng mẫu'}
        loadingBtnSave={loadingBtnSave}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3, boxShadow: 'none' }}>
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
                <RHFAutocomplete
                  name="party_id"
                  autoHighlight
                  loading={PartyData?.isLoading}
                  options={PartyData?.parties.map((option) => option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(
                      (option) =>
                        option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                        option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    )
                  }
                  onChange={(event, newValue) => {
                    setValue('party_id', newValue);
                    clearErrors(['party_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.code} - {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.party_id)}
                      helperText={errors.party_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn khách hàng*"
                    />
                  )}
                />
                <RHFTextField name="comment" label="Ghi chú" size="small" fullWidth />
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
                      Chi tiết sản phẩm
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

                <GoodDetail ref={goodDetailRef} goodData={goodData} refetchData={refetchData} />
              </Box>
              <button hidden={1} ref={refSubmitButton} type={'submit'} />
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
