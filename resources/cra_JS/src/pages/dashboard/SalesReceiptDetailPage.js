import { Helmet } from 'react-helmet-async';
import * as Yup from 'yup';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../style/style.css';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import { useSettingsContext } from '../../components/settings';

// redux
import { dispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/iconify';
import SalesReceiptOrderDetail from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderDetail';
import SalesReceiptOrderDetailToolbar from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderDetailToolbar';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getInternalOrg } from '../../redux/slices/internalOrg';
import { useAuthContext } from '../../auth/useAuthContext';
import { getPartiesByEmployee } from '../../redux/slices/parties';
import { getGoods } from '../../redux/slices/good';
import { currencyFormatter, formatPriceNumber } from '../../utils/formatNumber';
import { STATUSES } from '../../utils/constant';
import { getSaleReceiptById } from '../../redux/slices/saleReceipt';
import PrintPage from '../../sections/@dashboard/sales-receipt/OrderDetail/PrintPage';

// ----------------------------------------------------------------------

export default function SalesReceiptDetailPage() {
  const { id, currentMode } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const navigate = useNavigate();

  const refSubmitButton = useRef();

  const detailRef = useRef(null);

  const { themeStretch } = useSettingsContext();

  const [TAX_GTGT, setTAXGTGT] = useState(0);

  const goodData = useSelector((state) => state.good);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const loadingInternal = useSelector((state) => state.internalOrg.isLoading);

  const parties = useSelector((state) => state.parties.partiesByEmployee);

  const loadingParties = useSelector((state) => state.parties.isLoading);

  const currentSaleReceipt = useSelector((state) => state.saleReceipt.saleReceipt);

  const isLoading = useSelector((state) => state.saleReceipt.isLoading);

  const defaultCode = `BH${moment().format('YYMM')}-0000`;

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

  const [isEdit, setIsEdit] = useState(false);

  const [infoPaymentEdit, setInfoPaymentEdit] = useState({});

  const [mode, setMode] = useState('add');

  const [isRefresh, setIsRefresh] = useState(false);

  const [loadingDebt, setLoadingDebt] = useState(false);

  const [isOrderSample, setIsOrderSample] = useState(false);

  const [isSelectSample, setIsSelectSample] = useState(false);

  const [orderSample, setOrderSample] = useState(null);

  const [oldDebtCurrent, setOldDebtCurrent] = useState(0);

  const [inputValue, setInputValue] = useState('');

  const [goodInventory, setGoodInventory] = useState([]);

  const [goodInventoryLoading, setGoodInventoryLoading] = useState(false);

  const [dataGoodInventories, setDataGoodInventories] = useState([]);

  const [activeFields, setActiveFields] = useState({
    date: false,
    warehouse: false,
    party_code: false,
    date_debt: false,
    comment: false,
    good_code: false,
    quantity: false,
    discount_rate: false,
    discount_price: false,
  });

  let statusOfOrder = null;

  const defaultValues = useMemo(
    () => ({
      code: currentSaleReceipt?.code || '',
      date: currentSaleReceipt?.date || moment().format('YYYY-MM-DD'),
      employee: isEdit ? currentSaleReceipt?.employee?.name || null : user?.name || null,
      warehouse: currentSaleReceipt?.warehouse || null,
      party_code: currentSaleReceipt?.party || null,
      party_name: currentSaleReceipt?.party?.name || '',
      address: currentSaleReceipt?.party?.address || '',
      phone_number: currentSaleReceipt?.party?.phone || '',
      debt_limit: currentSaleReceipt?.debt_limit || 0,
      debt_current: currentSaleReceipt?.debt_current || 0,
      discount: currentSaleReceipt?.discount || 0,
      price_after_discount: currentSaleReceipt?.discount || 0,
      date_debt: currentSaleReceipt?.date_debt || 30,
      comment: currentSaleReceipt?.comment || '',
      vat_rate: currentSaleReceipt?.vat_rate || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSaleReceipt]
  );

  const NewSaleReceiptDetailSchema = Yup.object().shape({
    date: Yup.date().nullable().required('Vui lòng chọn ngày chứng từ'),
    warehouse: Yup.object().required('Vui lòng chọn kho').nullable(),
    party_code: Yup.object().required('Vui lòng chọn mã khách hàng').nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewSaleReceiptDetailSchema),
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
      dispatch(getSaleReceiptById(id));
      setIsEdit(true);
    } else {
      setIsEdit(false);
      setMode('add');
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && Object.keys(currentSaleReceipt).length) {
      const vat = Number(currentSaleReceipt?.vat_rate || 0);
      setTAXGTGT(vat);
      let partyAddress = [
        currentSaleReceipt?.party?.address || '',
        currentSaleReceipt?.party?.ward?.name || '',
        currentSaleReceipt?.party?.district?.name || '',
        currentSaleReceipt?.party?.province?.name || '',
      ];
      partyAddress = partyAddress.filter((word) => word !== '').join(', ') || '';

      setCodeOrder(currentSaleReceipt?.code);
      setPartyName(currentSaleReceipt?.party?.name);
      setAddress(partyAddress);
      setPhoneNumber(currentSaleReceipt?.party?.phone);
      setDebtLimit(
        currentSaleReceipt?.party?.debt_limit ? currencyFormatter(currentSaleReceipt?.party?.debt_limit) : 0
      );
      setCurrentDebt(
        currentSaleReceipt?.party?.debt_current
          ? currencyFormatter(currentSaleReceipt?.party?.debt_current.toString())
          : 0
      );
      setDiscountRate(currentSaleReceipt?.party?.discount_rate);
      setDateDebt(currentSaleReceipt?.date_debt);
      setComment(currentSaleReceipt?.comment);
      setValue('warehouse', currentSaleReceipt?.warehouse);
      setValue('party_code', currentSaleReceipt?.party);
      setValue(
        'debt_current',
        currentSaleReceipt?.party?.debt_current
          ? currencyFormatter(currentSaleReceipt?.party?.debt_current.toString())
          : 0
      );
      setValue('date', currentSaleReceipt?.date);
      setValue('date_debt', currentSaleReceipt?.date_debt);
      setDateOrder(currentSaleReceipt?.date);
      setCurrentParty(currentSaleReceipt?.party);
      getDebtLimit(currentSaleReceipt?.party);
      setValue('vat_rate', currentSaleReceipt?.vat_rate || '');
      getGoodInventory(currentSaleReceipt?.warehouse?.id);

      // Set order item and get info total for payment
      let totalPriceOrder = 0;
      let totalDiscountPriceOrder = 0;
      const itemOrderItems = currentSaleReceipt?.order_items.map((element) => {
        const priceOfGood = element?.price ? element?.price : 0;
        const totalPrice = parseFloat(priceOfGood) * element?.quantity;
        const discountPrice = (parseFloat(priceOfGood) - parseFloat(element?.discount)) * element?.quantity;
        totalPriceOrder += totalPrice;
        totalDiscountPriceOrder += discountPrice;

        return {
          order_item_id: element.id,
          good_id: element?.good?.id,
          good_code: element?.good?.code,
          good_name: element?.good?.name,
          good_image: element?.good?.photo,
          good_unit: element?.good.unit_of_measure?.name,
          quantity: element?.quantity,
          price: currencyFormatter(priceOfGood),
          total_price: currencyFormatter(totalPrice.toString()),
          discount_price: currencyFormatter(discountPrice.toString()),
          discount_rate: element?.percent_discount,
          max_discount_rate: element?.good?.max_discount_rate,
          price_after_discount: currencyFormatter(element?.discount),
        };
      });
      const totalTaxPrice = (totalPriceOrder * vat) / 100;

      const goodSelected = itemOrderItems.map((item) => ({
        id: item.good_id,
        name: item.good_name,
        code: item.good_code,
      }));

      // Set info total for payment of order item when edit
      setInfoPaymentEdit({
        totalPriceOrder,
        totalDiscountPriceOrder,
        totalTaxPrice,
        goodSelected,
      });

      if (currentSaleReceipt?.order_sample_id) {
        setIsSelectSample(true);
        setIsOrderSample(true);
        detailRef?.current?.setBackupFields(itemOrderItems);
      }

      // Set order item for detail order item
      setTimeout(() => {
        setValue('items', itemOrderItems);
      }, 0);
    }

    if (!isEdit) {
      resetData();
    }

    // Check disable fields for mode
    const FIELDS = {
      date:
        currentSaleReceipt.order_status_id === STATUSES.reject_sale_receipt
          ? true
          : !(mode === 'add' || mode === 'edit'),
      warehouse:
        currentSaleReceipt.order_status_id === STATUSES.reject_sale_receipt
          ? true
          : !(mode === 'add' || mode === 'edit'),
      party_code:
        currentSaleReceipt.order_status_id === STATUSES.reject_sale_receipt
          ? true
          : !(mode === 'add' || mode === 'edit'),
      date_debt:
        currentSaleReceipt.order_status_id === STATUSES.reject_sale_receipt
          ? true
          : !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
      comment:
        currentSaleReceipt.order_status_id === STATUSES.reject_sale_receipt
          ? true
          : !(mode === 'add' || mode === 'edit'),
      good_code: !(mode === 'add' || mode === 'edit'),
      quantity: !(mode === 'add' || mode === 'edit'),
      discount_rate: currentSaleReceipt.order_sample_id
        ? true
        : !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
      discount_price: currentSaleReceipt.order_sample_id
        ? true
        : !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
      price_after_discount: currentSaleReceipt.order_sample_id
        ? true
        : !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
      vat_rate: !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
    };
    setActiveFields(FIELDS);
  }, [isEdit, currentSaleReceipt]);

  useEffect(() => {
    if (!internalOrgs.length) dispatch(getInternalOrg());
  }, [internalOrgs]);

  useEffect(() => {
    dispatch(getPartiesByEmployee({ id: user.id }));
  }, []);

  useEffect(() => {
    dispatch(getGoods({}));
  }, []);

  const addItem = () => {
    if (values.warehouse) {
      detailRef?.current?.handleOpenFrom();
    } else {
      enqueueSnackbar('Vui lòng chọn kho trước khi thêm sản phẩm', { variant: 'error' });
    }
  };

  const addOrderSample = () => {
    setValue('items', []);
    detailRef?.current?.setDataRender([]);
    detailRef?.current?.setBackupFields([]);
    detailRef?.current?.clearForm();
    detailRef?.current?.handleAddOrderSample();
  };

  const onSave = (status = null) => {
    statusOfOrder = status;
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    const vatRate = Number(formData?.vat_rate || 0);
    // Filter empty item in order item
    const newOrderExport = formData?.items
      ? formData?.items.filter((item) => item.good_code !== null && item.quantity)
      : [];

    const checkDateDebt = currentParty?.max_debt_date >= formData?.date_debt;

    if (newOrderExport.length && checkDateDebt) {
      try {
        // Get list order item for order
        const orderItems = newOrderExport.map((item) => ({
          id: item.order_item_id,
          good_id: item.good_id,
          quantity: Number(item.quantity),
          discount: item.discount_rate_original ? parseFloat(item.discount_rate_original) : item.discount_rate,
          price_after_discount: item.price_after_discount ? formatPriceNumber(item.price_after_discount) : 0,
          price: item.price ? formatPriceNumber(item.price.toString()) : 0,
        }));

        // Check current discount vs max discount and set status for order
        const isCreatedSaleReceipt = newOrderExport.every(
          (item) => parseFloat(item.discount_rate) <= parseFloat(item.max_discount_rate)
        );

        const pricePayment = newOrderExport.reduce(
          (sum, item) => sum + formatPriceNumber(item.total_price.toString()),
          0
        );
        const priceTax = (pricePayment * vatRate) / 100;
        const priceDiscount = newOrderExport.reduce(
          (sum, item) => sum + formatPriceNumber(item.discount_price.toString()),
          0
        );

        const totalPricePayment = pricePayment + priceTax - priceDiscount;

        const statusId =
          statusOfOrder ||
          (isCreatedSaleReceipt && totalPricePayment <= formatPriceNumber(formData?.debt_current.toString())
            ? STATUSES.created_sale_receipt
            : STATUSES.pending_sale_receipt);

        const newFormData = {
          warehouse_id: formData?.warehouse?.id || null,
          date: moment(formData?.date).format('YYYY-MM-DD') || '',
          employee_id: isEdit ? currentSaleReceipt?.employee?.id || '' : user?.id || '',
          party_id: formData?.party_code?.id || null,
          date_debt: formData?.date_debt || 30,
          order_items: orderItems || [],
          comment: formData?.comment || '',
          status_id: statusId,
          vat_rate: formData?.vat_rate || 0,
          order_sample_id: isSelectSample ? formData?.party_code?.order_sample?.id || '' : '',
        };

        if (!isEdit) {
          newFormData.href = window.location.href;
          await axios.post('sales-receipt', newFormData);
          enqueueSnackbar('Thêm phiếu thành công!');
          resetData();
          setIsRefresh(true);
          setLoadingBtnSave(false);
        } else {
          if (mode === 'edit') {
            const statusEdit =
              isCreatedSaleReceipt && totalPricePayment <= oldDebtCurrent
                ? STATUSES.created_sale_receipt
                : STATUSES.pending_sale_receipt;

            newFormData.status_id = statusEdit;
          }

          await axios
            .put(`sales-receipt/${id}`, newFormData)
            .then((response) => {
              const { notEnoughGoods } = response?.data?.data;
              if (notEnoughGoods) {
                enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
              }
            })
            .catch((err) => {
              enqueueSnackbar(err.data.message, { variant: 'error' });
              setLoadingBtnSave(false);
            });

          enqueueSnackbar('Cập nhập phiếu thành công!');

          if (
            statusOfOrder === STATUSES.exported ||
            statusOfOrder === STATUSES.reject_sale_receipt ||
            statusOfOrder === STATUSES.confirm_sale_receipt
          ) {
            navigate(PATH_DASHBOARD.salesReceipt.list);
            reset(defaultValues);
          }
          setLoadingBtnSave(false);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error, { variant: 'error' });
      }
    } else {
      if (!checkDateDebt) {
        enqueueSnackbar('Ngày nợ của đơn hàng phải nhỏ hơn hoặc bằng ngày nợ tối đa của khách hàng', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar('Vui lòng chọn sản phẩm và nhập số lượng', { variant: 'error' });
      }
      setLoadingBtnSave(false);
    }
  };

  const resetData = () => {
    setValue('items', []);
    detailRef?.current?.clearForm();
    reset();
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
    setIsSelectSample(false);
    setIsOrderSample(false);
    setTAXGTGT(0);
    detailRef?.current?.setBackupFields([]);
  };

  const getDebtLimit = async (partyData) => {
    setLoadingDebt(true);
    await axios.get(`get-debt-current-by-party/${partyData?.id}`).then((response) => {
      const { debtCurrent, orderSample } = response?.data?.data;
      setOrderSample(orderSample);
      setValue('debt_current', partyData.debt_limit - debtCurrent);
      setCurrentDebt(currencyFormatter((partyData.debt_limit - debtCurrent).toString()));
      setLoadingDebt(false);
    });
  };

  useEffect(() => {
    if (!loadingDebt && mode === 'edit') {
      const totalPayment =
        infoPaymentEdit.totalPriceOrder + infoPaymentEdit.totalTaxPrice - infoPaymentEdit.totalDiscountPriceOrder;
      const convertCurrentDebt = formatPriceNumber(currentDebt);
      setOldDebtCurrent(totalPayment + convertCurrentDebt);
    }
  }, [loadingDebt]);

  const handlePrint = () => {
    const divToPrint = document.getElementById('print-page');
    const newWin = window.open('');
    newWin.document.open();
    newWin.document.write(divToPrint.outerHTML);
    newWin.document.close();
    const checkReadyState = setInterval(() => {
      if (newWin.document.readyState === 'complete') {
        clearInterval(checkReadyState);
        newWin.print();
        newWin.close();
      }
    }, 100);
  };

  const handleSearch = (event) => {
    detailRef?.current?.clearForm();
    detailRef?.current?.searchGood(event.target.value);
  };

  const getGoodInventory = async (warehouseId) => {
    setGoodInventoryLoading(true);
    await axios.get(`get-good-inventory/${warehouseId}`).then((response) => {
      setDataGoodInventories(response?.data?.data?.invetories);
      setGoodInventoryLoading(false);
    });
  };

  useEffect(() => {
    if (!(goodData.isLoading && goodInventoryLoading)) {
      const newGoodData = goodData?.goods.map((good) => {
        let inventory = 0;
        dataGoodInventories.forEach((goodInventory) => {
          if (goodInventory.productable_id === good.id) {
            inventory = Number(goodInventory?.opening_quantity);
          }
        });

        return {
          ...good,
          inventory,
        };
      });
      setGoodInventory(newGoodData);
    }
  }, [goodData.isLoading, goodInventoryLoading]);

  return (
    <>
      <Helmet>
        <title> Đơn hàng | Rượu Ngon</title>
      </Helmet>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
        {(isLoading || loadingDebt) && (
          <Box className={'c-box__loading_v2'}>
            <CircularProgress className={'c-box__loading__icon'} />
          </Box>
        )}
        <>
          <SalesReceiptOrderDetailToolbar
            backLink={PATH_DASHBOARD.salesReceipt.list}
            orderNumber={codeOrder || defaultCode}
            createDate={dateOrder ? moment(dateOrder).format('DD-MM-YYYY') : moment().format('DD-MM-YYYY')}
            onSave={onSave}
            mode={mode}
            loadingBtnSave={loadingBtnSave}
            handlePrint={handlePrint}
            status={currentSaleReceipt?.order_status_id}
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
                    <RHFTextField size="small" name="code" value={codeOrder} label="Mã đơn hàng" disabled />
                    <DatePicker
                      label="Ngày đơn hàng"
                      name="date"
                      value={dateOrder}
                      disabled={activeFields.date}
                      onChange={(newValue) => {
                        setValue(
                          'date',
                          newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
                        );
                        setDateOrder(newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
                      }}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                    <RHFTextField size="small" name="employee" label="Người tư vấn" disabled />
                    <RHFAutocomplete
                      name="warehouse"
                      autoHighlight
                      loading={loadingInternal}
                      disabled={activeFields.warehouse}
                      options={internalOrgs.map((option) => option)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        setValue('warehouse', newValue);
                        setValue('items', []);
                        detailRef?.current?.setBackupFields([]);
                        detailRef?.current?.clearForm();
                        if (isSelectSample) addOrderSample();
                        clearErrors('warehouse');
                        getGoodInventory(newValue?.id);
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
                      loading={loadingParties}
                      disabled={activeFields.party_code}
                      options={parties.map((option) => option)}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(
                          (option) =>
                            option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                            option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                        )
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => {
                        setValue('party_code', newValue);
                        setValue('items', []);
                        detailRef?.current?.clearForm();
                        detailRef?.current?.setBackupFields([]);
                        setIsOrderSample(false);
                        setIsSelectSample(false);
                        setInputValue('');
                        clearErrors('party_code');
                        let arrAddress = [
                          newValue?.address || '',
                          newValue?.ward?.name || '',
                          newValue?.district?.name || '',
                          newValue?.province?.name || '',
                        ];
                        arrAddress = arrAddress.filter((word) => word !== '').join(', ') || '';
                        setValue('debt_limit', newValue?.debt_limit ? currencyFormatter(newValue?.debt_limit) : 0);
                        setValue(
                          'debt_current',
                          newValue?.debt_current ? currencyFormatter(newValue?.debt_current.toString()) : 0
                        );
                        setValue('discount', newValue?.discount_rate || 0);
                        setPartyName(newValue?.name || '');
                        setAddress(arrAddress);
                        setPhoneNumber(newValue?.phone || '');
                        setDebtLimit(newValue?.debt_limit ? currencyFormatter(newValue?.debt_limit) : 0);
                        setCurrentDebt(
                          newValue?.debt_current ? currencyFormatter(newValue?.debt_current.toString()) : 0
                        );
                        setDiscountRate(newValue?.discount_rate || 0);
                        setCurrentParty(newValue);
                        getDebtLimit(newValue);
                        if (newValue?.order_sample) {
                          setIsOrderSample(true);
                        } else setIsOrderSample(false);
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
                    <RHFTextField
                      size="small"
                      name="date_debt"
                      value={dateDebt}
                      label="Ngày nợ"
                      disabled={activeFields.date_debt}
                      type="number"
                      onChange={(e) => {
                        setValue('date_debt', e.target.value ? e.target.value : 30);
                        setDateDebt(e.target.value);
                      }}
                    />
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
                    {!loadingDebt && isOrderSample && (
                      <FormControlLabel
                        control={
                          <Switch
                            name="isOrderSample"
                            inputProps={{ 'aria-label': 'controlled' }}
                            checked={isSelectSample}
                            onChange={(e) => {
                              setIsSelectSample(e.target.checked);
                              setInputValue('');
                              if (e.target.checked) {
                                addOrderSample();
                                setActiveFields((prevState) => ({
                                  ...prevState,
                                  discount_rate: true,
                                  discount_price: true,
                                  price_after_discount: true,
                                }));
                              } else {
                                setActiveFields((prevState) => ({
                                  ...prevState,
                                  discount_rate: !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
                                  discount_price: !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
                                  price_after_discount: !(mode === 'add' || mode === 'edit' || mode === 'confirm'),
                                }));
                                setValue('items', []);
                                detailRef?.current?.clearForm();
                                detailRef?.current?.setBackupFields([]);
                              }
                            }}
                          />
                        }
                        sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                        labelPlacement="start"
                        label={
                          <>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              Đơn hàng mẫu
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Sử dụng đơn hàng mẫu cho đơn hàng này
                            </Typography>
                          </>
                        }
                      />
                    )}
                  </Box>
                </Card>
                <Card sx={{ mt: 4 }}>
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                      <div>
                        <Typography variant="h6">Chi tiết đặt hàng</Typography>
                      </div>
                      {(mode === 'add' || mode === 'edit') && (
                        <div>
                          {isSelectSample ? (
                            <TextField
                              fullWidth
                              size="small"
                              onChange={handleSearch}
                              placeholder="Tìm tên, mã sản phẩm..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          ) : (
                            <Button
                              sx={{ mr: 1 }}
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="eva:plus-fill" />}
                              onClick={addItem}
                            >
                              Thêm
                            </Button>
                          )}
                        </div>
                      )}
                    </Stack>
                    <SalesReceiptOrderDetail
                      ref={detailRef}
                      goodData={goodData}
                      currentParty={currentParty}
                      isEdit={isEdit}
                      tax={TAX_GTGT}
                      infoPaymentEdit={infoPaymentEdit}
                      activeFields={activeFields}
                      mode={mode}
                      isRefresh={isRefresh}
                      setRefresh={() => setIsRefresh(false)}
                      currentSaleReceipt={currentSaleReceipt}
                      orderSample={orderSample}
                      keySearch={inputValue}
                      isSelectSample={isSelectSample}
                      goodInventory={goodInventory}
                      goodInventoryLoading={goodInventoryLoading}
                    />
                  </Box>
                </Card>
                <button hidden={1} ref={refSubmitButton} type={'submit'} />
              </Grid>
            </Grid>
          </FormProvider>
        </>
        <PrintPage data={currentSaleReceipt} />
      </Container>
    </>
  );
}
