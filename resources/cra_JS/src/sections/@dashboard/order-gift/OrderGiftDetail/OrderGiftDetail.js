import { Helmet } from 'react-helmet-async';
import * as Yup from 'yup';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../../pages/style/style.css';
import {
  Box,
  Card,
  Grid,
  Stack,
  Container,
  Divider,
  TextField,
  TableContainer,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import { useSettingsContext } from '../../../../components/settings';

// redux
import { dispatch, useSelector } from '../../../../redux/store';
import axios from '../../../../utils/axios';

// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify';
import OrderGiftInDetail from './components/OrderGiftInDetail';
import OrderGiftDetailToolbar from './components/OrderGiftDetailToolbar';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { getInternalOrg } from '../../../../redux/slices/internalOrg';
import { useAuthContext } from '../../../../auth/useAuthContext';
import { getPartiesByEmployee } from '../../../../redux/slices/parties';
import { getGoods } from '../../../../redux/slices/good';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
import { STATUSES } from '../../../../utils/constant';
import OrderGiftOutDetail from './components/OrderGiftOutDetail';
import { getOrderGiftById } from '../../../../redux/slices/orderGift';

// ----------------------------------------------------------------------

export default function OrderGiftDetail() {
  const { id, currentMode } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const navigate = useNavigate();

  const refSubmitButton = useRef();

  const { themeStretch } = useSettingsContext();

  const goods = useSelector((state) => state.good.goods);

  const loadingGoods = useSelector((state) => state.good.isLoading);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const loadingInternal = useSelector((state) => state.internalOrg.isLoading);

  const parties = useSelector((state) => state.parties.partiesByEmployee);

  const loadingParties = useSelector((state) => state.parties.isLoading);

  const currentOrderGift = useSelector((state) => state.orderGift.orderGift);

  const isLoading = useSelector((state) => state.orderGift.isLoading);

  const defaultCode = `HT${moment().format('YYMM')}-0000`;

  const [partyName, setPartyName] = useState('');

  const [address, setAddress] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  const [debtLimit, setDebtLimit] = useState(0);

  const [currentDebt, setCurrentDebt] = useState(0);

  const [discountRate, setDiscountRate] = useState(0);

  const [dateDebt, setDateDebt] = useState(30);

  const [comment, setComment] = useState('');

  const [dateOrder, setDateOrder] = useState(moment().format('YYYY-MM-DD'));

  const [currentParty, setCurrentParty] = useState({});

  const [codeOrder, setCodeOrder] = useState(defaultCode);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [triggerClickAddGiftIn, setTriggerClickAddGiftIn] = useState(0);

  const [triggerClickAddGiftOut, setTriggerClickAddGiftOut] = useState(0);

  const [isEdit, setIsEdit] = useState(false);

  const [infoOrderItems, setInfoOrderItems] = useState({});

  const [infoGiftItems, setInfoGiftItems] = useState({});

  const [mode, setMode] = useState('');

  const [isRefresh, setIsRefresh] = useState(false);

  const [priceOrderItem, setPriceOrderItem] = useState(0);

  const [priceOrderGift, setPriceOrderGift] = useState(0);

  const [totalOrder, setTotalOrder] = useState(0);

  const [loadingDebt, setLoadingDebt] = useState(false);

  const [activeFields, setActiveFields] = useState({
    date: false,
    warehouse: false,
    party_code: false,
    date_debt: false,
    comment: false,
    good_code: false,
    quantity: false,
    discount_rate: false,
    price: false,
    good_name: false,
  });

  let statusOfOrder = null;

  const defaultValues = useMemo(
    () => ({
      code: currentOrderGift?.code || '',
      date: currentOrderGift?.date || moment().format('YYYY-MM-DD'),
      employee: currentOrderGift?.employee || null,
      warehouse: currentOrderGift?.warehouse || null,
      party_code: currentOrderGift?.party || null,
      party_name: currentOrderGift?.party?.name || '',
      address: currentOrderGift?.party?.address || '',
      phone_number: currentOrderGift?.party?.phone || '',
      debt_limit: currentOrderGift?.debt_limit || 0,
      debt_current: currentOrderGift?.debt_current || 0,
      discount: currentOrderGift?.discount || 0,
      date_debt: currentOrderGift?.date_debt || 30,
      comment: currentOrderGift?.comment || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrderGift]
  );

  const NewOrderGiftSchema = Yup.object().shape({
    // warehouse: Yup.object().required('Chọn kho hàng').nullable(true),
    party_code: Yup.object().required('Chọn khách hàng').nullable(true),
  });

  const methods = useForm({
    resolver: yupResolver(NewOrderGiftSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  // Get value if mode is edit
  useEffect(() => {
    if (id) {
      setMode(currentMode);
      dispatch(getOrderGiftById(id));
      setIsEdit(true);
    } else {
      setIsEdit(false);
      setMode('add');
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && Object.keys(currentOrderGift).length) {
      let partyAddress = [
        currentOrderGift?.party?.address || '',
        currentOrderGift?.party?.ward?.name || '',
        currentOrderGift?.party?.district?.name || '',
        currentOrderGift?.party?.province?.name || '',
      ];
      partyAddress = partyAddress.filter((word) => word !== '').join(', ') || '';
      setCodeOrder(currentOrderGift?.code);
      setPartyName(currentOrderGift?.party?.name);
      setAddress(partyAddress);
      setPhoneNumber(currentOrderGift?.party?.phone);
      setDebtLimit(currentOrderGift?.party?.debt_limit ? currencyFormatter(currentOrderGift?.party?.debt_limit) : 0);
      setCurrentDebt(
        currentOrderGift?.party?.debt_current ? currencyFormatter(currentOrderGift?.party?.debt_current.toString()) : 0
      );
      setDiscountRate(currentOrderGift?.party?.discount_rate);
      setDateDebt(currentOrderGift?.date_debt);
      setComment(currentOrderGift?.comment);
      setValue('warehouse', currentOrderGift?.warehouse);
      setValue('party_code', currentOrderGift?.party);
      setValue(
        'debt_current',
        currentOrderGift?.party?.debt_current ? currencyFormatter(currentOrderGift?.party?.debt_current.toString()) : 0
      );
      setDateOrder(currentOrderGift?.date);
      setCurrentParty(currentOrderGift?.party);
      getDebtLimit(currentOrderGift?.party);

      // Set order item and get info total for payment
      let totalPriceOrder = 0;
      let totalDiscountPriceOrder = 0;
      let itemOrderItems = [];
      if (currentOrderGift?.order_items) {
        itemOrderItems = currentOrderGift?.order_items.map((element) => {
          const priceOfGood = element?.price ? element?.price : 0;
          const totalPrice = parseFloat(priceOfGood) * element?.quantity;
          const discountPrice = (parseFloat(priceOfGood) - parseFloat(element?.discount)) * element?.quantity;
          totalPriceOrder += totalPrice;
          totalDiscountPriceOrder += discountPrice;

          return {
            id: element.id,
            good_code: element?.good,
            good_name: element?.good?.name,
            good_unit: element?.good?.unit_of_measure?.name,
            quantity: element?.quantity,
            price: currencyFormatter(priceOfGood),
            total_price: currencyFormatter(totalPrice.toString()),
            discount_price: currencyFormatter(discountPrice.toString()),
            discount_rate: element?.percent_discount,
          };
        });
      }

      // Set info total for payment of order item when edit
      setInfoOrderItems({
        totalPriceOrder,
        totalDiscountPriceOrder,
      });

      // Set order item gift and get info total for payment
      let totalGiftItem = 0;
      let itemGiftItems = [];
      if (currentOrderGift?.gift_items) {
        itemGiftItems = currentOrderGift?.gift_items.map((element) => {
          const priceOfGood = element?.price ? element?.price : 0;
          const totalPrice = parseFloat(priceOfGood) * element?.quantity;
          totalGiftItem += totalPrice;

          return {
            id: element.id,
            good_name: element?.name,
            quantity: element?.quantity,
            price: currencyFormatter(priceOfGood),
          };
        });
      }

      setInfoGiftItems({ totalGiftItem });

      // Set order item for detail order item
      setTimeout(() => {
        setValue('itemGiftIns', itemOrderItems);
        setValue('itemGiftOuts', itemGiftItems);
      }, 0);

      // Check disable fields for mode
      const FIELDS = {
        date: !(mode === 'add' || mode === 'edit'),
        warehouse: !(mode === 'add' || mode === 'edit'),
        party_code: !(mode === 'add' || mode === 'edit'),
        date_debt: !(mode === 'add' || mode === 'edit'),
        comment: !(mode === 'add' || mode === 'edit'),
        good_code: !(mode === 'add' || mode === 'edit'),
        quantity: !(mode === 'add' || mode === 'edit'),
        discount_rate: !(mode === 'add' || mode === 'edit'),
        price: !(mode === 'add' || mode === 'edit'),
        good_name: !(mode === 'add' || mode === 'edit'),
      };
      setActiveFields(FIELDS);
    }
  }, [isEdit, currentOrderGift]);

  useEffect(() => {
    if (!internalOrgs.length) dispatch(getInternalOrg());
  }, [internalOrgs]);

  useEffect(() => {
    if (!parties.length) dispatch(getPartiesByEmployee({ id: user.id }));
  }, [parties]);

  useEffect(() => {
    if (!goods.length) dispatch(getGoods({}));
  }, [goods]);

  const addItemGiftIn = () => {
    setTriggerClickAddGiftIn((triggerClickAddGiftIn) => triggerClickAddGiftIn + 1);
  };
  const addItemGiftOut = () => {
    setTriggerClickAddGiftOut((triggerClickAddGiftOut) => triggerClickAddGiftOut + 1);
  };

  const onSave = (status = null) => {
    statusOfOrder = status;
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);

    // Filter empty item in order item
    const newItemGiftIns = formData?.itemGiftIns
      ? formData?.itemGiftIns.filter((item) => item.good_code !== null && item.quantity)
      : [];

    const newItemGiftOut = formData?.itemGiftOuts
      ? formData?.itemGiftOuts.filter((item) => item.good_name && formatPriceNumber(item.price.toString()))
      : [];

    if (newItemGiftIns.length || newItemGiftOut.length) {
      try {
        // Get list order item for order
        const orderItems =
          newItemGiftIns.length &&
          newItemGiftIns.map((item) => {
            const priceItem = item.price ? formatPriceNumber(item.price) : 0;
            const quantityItem = Number(item.quantity);
            const percentDiscount = item.discount_rate ? parseFloat(item.discount_rate) : 0;
            const priceAfterDiscount = priceItem - (priceItem * percentDiscount) / 100;

            return {
              id: item.id,
              good_id: item.good_code.id,
              quantity: quantityItem,
              percent_discount: percentDiscount,
              discount: priceAfterDiscount,
              price: priceItem,
            };
          });

        const orderGifts =
          newItemGiftOut.length &&
          newItemGiftOut.map((item) => ({
            id: item.id,
            good_name: item.good_name,
            quantity: Number(item.quantity),
            price: item.price ? formatPriceNumber(item.price) : 0,
          }));

        const statusId =
          statusOfOrder || (newItemGiftIns.length ? STATUSES.created_sale_receipt : STATUSES.success_sale_receipt);

        const newFormData = {
          warehouse_id: formData?.warehouse?.id || null,
          date: moment(formData?.date).format('YYYY-MM-DD') || '',
          employee_id: user?.id || null,
          party_id: formData?.party_code?.id || null,
          date_debt: formData?.date_debt || 30,
          order_items: orderItems || [],
          order_gifts: orderGifts || [],
          comment: formData?.comment || '',
          status_id: statusId,
        };

        if (!isEdit) {
          await axios.post('order-gift', newFormData);
          enqueueSnackbar('Thêm phiếu thành công!');
          resetData();
          setIsRefresh(true);
          setLoadingBtnSave(false);
        } else {
          await axios
            .put(`order-gift/${id}`, newFormData)
            .then((response) => {
              const { notEnoughGoods } = response?.data?.data;
              if (notEnoughGoods) {
                enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
              }
            })
            .catch((error) => {
              enqueueSnackbar(error.data.message, { variant: 'error' });
              setLoadingBtnSave(false);
            });
          enqueueSnackbar('Cập nhập phiếu thành công!');
          setLoadingBtnSave(false);
          if (statusOfOrder === STATUSES.exported) {
            navigate(PATH_DASHBOARD.orderGift.list);
            resetData();
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Vui lòng chọn chi tiết mặt hàng tặng', { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  useEffect(() => {
    setTotalOrder(priceOrderItem + priceOrderGift);
  }, [priceOrderItem, priceOrderGift]);

  const resetData = () => {
    setValue('itemGiftIns', []);
    setValue('itemGiftOuts', []);
    setValue('warehouse', null);
    setValue('party_code', null);
    setValue('code', defaultCode);
    setValue('date', moment().format('YYYY-MM-DD'));
    setCodeOrder(defaultCode);
    setPartyName('');
    setAddress('');
    setPhoneNumber('');
    setDebtLimit(0);
    setCurrentDebt(0);
    setDiscountRate(0);
    setDateDebt(30);
    setComment('');
    setDateOrder(moment().format('YYYY-MM-DD'));
    setCurrentParty(null);
    setTotalOrder(0);
  };

  const getDebtLimit = async (partyData) => {
    setLoadingDebt(true);
    await axios.get(`get-debt-current-by-party/${partyData?.id}`).then((response) => {
      const { debtCurrent, orderSample } = response?.data?.data;
      setValue('debt_current', debtCurrent);
      setCurrentDebt(currencyFormatter((partyData.debt_limit - debtCurrent).toString()));
      setLoadingDebt(false);
    });
  };

  return (
    <>
      <Helmet>
        <title> Đơn hàng tặng | Rượu Ngon</title>
      </Helmet>
      <Container>
        {isLoading && (
          <Box className={'c-box__loading'}>
            <CircularProgress className={'c-box__loading__icon'} />
          </Box>
        )}
        <>
          <OrderGiftDetailToolbar
            backLink={PATH_DASHBOARD.orderGift.list}
            orderNumber={codeOrder || defaultCode}
            createDate={dateOrder ? moment(dateOrder).format('DD-MM-YYYY') : moment().format('DD-MM-YYYY')}
            onSave={onSave}
            mode={mode}
            loadingBtnSave={loadingBtnSave}
          />
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={12}>
                <Card>
                  <Box
                    rowGap={3}
                    sx={{ p: 3 }}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    }}
                  >
                    <RHFTextField size="small" name="code" value={codeOrder} label="Mã đơn hàng" disabled />
                    <DatePicker
                      label="Ngày đơn hàng"
                      name="date"
                      value={dateOrder}
                      disabled={activeFields.date}
                      inputProps={{
                        readOnly: true,
                      }}
                      onChange={(newValue) => {
                        setValue(
                          'date',
                          newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
                        );
                        setDateOrder(newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
                      }}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                    <RHFTextField size="small" name="employee" label="Người tư vấn" value={user.name} disabled />
                    <RHFAutocomplete
                      name="warehouse"
                      autoHighlight
                      disabled={activeFields.warehouse}
                      loading={loadingInternal}
                      options={internalOrgs.map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        setValue('warehouse', newValue);
                        clearErrors('warehouse');
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      getOptionLabel={(option) => option.name || ''}
                      renderInput={(params) => (
                        <TextField
                          error={Boolean(errors.warehouse)}
                          helperText={errors.warehouse?.message}
                          {...params}
                          fullWidth
                          size="small"
                          label="Kho đặt hàng"
                        />
                      )}
                    />
                    <RHFAutocomplete
                      name="party_code"
                      autoHighlight
                      disabled={activeFields.party_code}
                      loading={loadingParties}
                      options={parties.map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(
                          (option) =>
                            option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                            option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                        )
                      }
                      onChange={(event, newValue) => {
                        clearErrors('party_code');
                        let arrAddress = [
                          newValue?.address || '',
                          newValue?.ward?.name || '',
                          newValue?.district?.name || '',
                          newValue?.province?.name || '',
                        ];
                        arrAddress = arrAddress.filter((word) => word !== '').join(', ') || '';
                        setValue('party_code', newValue);
                        setValue('party_name', newValue?.name || '');
                        setValue('address', arrAddress || '');
                        setValue('phone_number', newValue?.phone || '');
                        setValue('debt_limit', newValue?.debt_limit ? currencyFormatter(newValue?.debt_limit) : 0);
                        setValue(
                          'debt_current',
                          newValue?.debt_current ? currencyFormatter(newValue?.debt_current.toString()) : 0
                        );
                        setValue('discount', newValue?.discount_rate || 0);
                        setPartyName(newValue?.name || '');
                        setAddress(arrAddress || '');
                        setPhoneNumber(newValue?.phone || '');
                        setDebtLimit(newValue?.debt_limit ? currencyFormatter(newValue?.debt_limit) : 0);
                        setCurrentDebt(
                          newValue?.debt_current ? currencyFormatter(newValue?.debt_current.toString()) : 0
                        );
                        setDiscountRate(newValue?.discount_rate || 0);
                        getDebtLimit(newValue);
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option?.code || ''} - {option?.name || ''}
                        </li>
                      )}
                      getOptionLabel={(option) => option.code || ''}
                      renderInput={(params) => (
                        <TextField
                          error={Boolean(errors.party_code)}
                          helperText={errors.party_code?.message}
                          {...params}
                          fullWidth
                          size="small"
                          label="Mã khách hàng*"
                        />
                      )}
                    />
                    <RHFTextField size="small" name="party_name" value={partyName} label="Tên khách hàng" disabled />
                    <RHFTextField size="small" name="address" value={address} label="Địa chỉ" disabled />
                    <RHFTextField size="small" name="phone_number" label="Số điện thoại" value={phoneNumber} disabled />
                    <RHFTextField size="small" name="debt_limit" value={debtLimit} label="Hạn mức công nợ" disabled />
                    <RHFTextField
                      size="small"
                      name="debt_current"
                      value={currentDebt}
                      label="Hạn mức công nợ hiện tại"
                      disabled
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {loadingDebt && <CircularProgress size={20} />}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField
                      size="small"
                      name="discount"
                      value={discountRate}
                      label="Chiết khấu khách hàng"
                      disabled
                    />
                    {/* <RHFTextField
                      size="small"
                      name="date_debt"
                      value={dateDebt}
                      disabled={activeFields.date_debt}
                      label="Ngày nợ"
                      type="number"
                      onChange={(e) => {
                        setValue('date_debt', e.target.value ? e.target.value : 30);
                        setDateDebt(e.target.value);
                      }}
                    /> */}
                    <RHFTextField
                      size="small"
                      name="comment"
                      value={comment}
                      disabled={activeFields.comment}
                      label="Ghi chú"
                      onChange={(e) => {
                        setValue('comment', e.target.value);
                        setComment(e.target.value);
                      }}
                    />
                  </Box>

                  <Stack
                    spacing={2}
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{ mt: 3, mb: 3, p: 3, bgcolor: 'background.neutral' }}
                  >
                    <Typography variant="h5">Chi tiết hàng tặng</Typography>
                  </Stack>
                  <Box sx={{ pl: 3, mr: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                      <div>
                        <Typography variant="h6">Chi tiết sản phẩm</Typography>
                      </div>
                      {(mode === 'add' || mode === 'edit') && (
                        <div>
                          <Button
                            sx={{ mr: 1 }}
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                            onClick={addItemGiftIn}
                          >
                            Thêm
                          </Button>
                        </div>
                      )}
                    </Stack>
                    <OrderGiftInDetail
                      triggerClickAddGiftIn={triggerClickAddGiftIn}
                      goods={goods}
                      currentParty={currentParty}
                      isEdit={isEdit}
                      infoOrderItems={infoOrderItems}
                      activeFields={activeFields}
                      mode={mode}
                      isRefresh={isRefresh}
                      setRefresh={() => setIsRefresh(false)}
                      currentOrderGift={currentOrderGift}
                      setTotalPrice={(total) => setPriceOrderItem(total)}
                      loadingGoods={loadingGoods}
                    />
                  </Box>
                  <Divider sx={{ m: 3 }} variant="dotted" />
                  <Box sx={{ pl: 3, mr: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                      <div>
                        <Typography variant="h6">Chi tiết sản phẩm - hàng ngoài</Typography>
                      </div>
                      {(mode === 'add' || mode === 'edit') && (
                        <div>
                          <Button
                            sx={{ mr: 1 }}
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                            onClick={addItemGiftOut}
                          >
                            Thêm
                          </Button>
                        </div>
                      )}
                    </Stack>
                    <OrderGiftOutDetail
                      triggerClickAddGiftOut={triggerClickAddGiftOut}
                      isEdit={isEdit}
                      infoGiftItems={infoGiftItems}
                      activeFields={activeFields}
                      mode={mode}
                      isRefresh={isRefresh}
                      setRefresh={() => setIsRefresh(false)}
                      currentOrderGift={currentOrderGift}
                      setTotalPrice={(total) => setPriceOrderGift(total)}
                    />
                  </Box>
                  <Divider sx={{ mt: 3, ml: 3, mr: 3 }} variant="dotted" />
                  <Stack
                    spacing={2}
                    alignItems="flex-end"
                    sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}
                  >
                    <Stack direction="row" sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>
                      <Box>Tổng tiền hàng tặng</Box>
                      <Box sx={{ width: 160 }}>{totalOrder ? currencyFormatter(totalOrder.toString()) : '-'}</Box>
                    </Stack>
                  </Stack>
                </Card>
                <button hidden={1} ref={refSubmitButton} type={'submit'} />
              </Grid>
            </Grid>
          </FormProvider>
        </>
      </Container>
    </>
  );
}
