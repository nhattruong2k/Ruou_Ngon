import { Helmet } from 'react-helmet-async';
import * as Yup from 'yup';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../style/style.css';
import {
  Box,
  Card,
  Grid,
  Stack,
  Container,
  TextField,
  TableContainer,
  Button,
  Typography,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import { useSettingsContext } from '../../components/settings';

// redux
import { dispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../components/hook-form';
import Iconify from '../../components/iconify';
import useResponsive from '../../hooks/useResponsive';
import OrderItemDetail from '../../sections/@dashboard/sales-receipt/OrderDetail/OrderItemDetail';
import SalesReceiptOrderDetailToolbar from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderDetailToolbar';
import { PATH_DASHBOARD } from '../../routes/paths';

import { useAuthContext } from '../../auth/useAuthContext';
import { getPartiesByEmployee } from '../../redux/slices/parties';

import { currencyFormatter, formatPriceNumber } from '../../utils/formatNumber';
import { STATUSES } from '../../utils/constant';
import { getSaleReceiptById } from '../../redux/slices/saleReceipt';
import SalesReceiptHistoryPaymentDetail from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptHistoryPaymentDetail';
import SalesReceiptPaymentDetail from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptPaymentDetail';
import SalesReceiptOrderDetailStatusHistory from '../../sections/@dashboard/sales-receipt/OrderDetail/SalesReceiptOrderDetailStatusHistory';
import PrintPage from '../../sections/@dashboard/sales-receipt/OrderDetail/PrintPage';
// ----------------------------------------------------------------------

export default function SalesReceiptPaymentDetailPage() {
  const { id, currentMode } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const refSubmitButton = useRef();

  const [TAX_GTGT, setTAXGTGT] = useState(0);

  const currentSaleReceipt = useSelector((state) => state.saleReceipt.saleReceipt);

  const isLoading = useSelector((state) => state.saleReceipt.isLoading);

  const defaultCode = `BH${moment().format('YYMM')}-0000`;

  const [address, setAddress] = useState('');

  const [debtCurrent, setDebtCurrent] = useState(0);

  const [dateOrder, setDateOrder] = useState(moment().format('YYYY-MM-DD'));

  const [currentParty, setCurrentParty] = useState({});

  const [codeOrder, setCodeOrder] = useState(defaultCode);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [triggerClickAdd, setTriggerClickAdd] = useState(0);

  const [isEdit, setIsEdit] = useState(false);

  const [infoPaymentEdit, setInfoPaymentEdit] = useState({});

  const [mode, setMode] = useState('');

  const [isRefresh, setIsRefresh] = useState(false);

  const [loadingDebt, setLoadingDebt] = useState(false);

  const isDesktop = useResponsive('up', 'sm');

  const isMobile = useResponsive('down', 'sm');

  const [activeFields, setActiveFields] = useState({
    date: true,
    warehouse: true,
    party_code: true,
    date_debt: true,
    comment: true,
    good_code: true,
    quantity: true,
    discount_rate: true,
  });

  const [statusOrder, setStatusOrder] = useState(null);

  const defaultValues = useMemo(
    () => ({
      code: currentSaleReceipt?.code || '',
      date: currentSaleReceipt?.date || moment().format('YYYY-MM-DD'),
      employee: currentSaleReceipt?.employee?.name || '',
      warehouse: currentSaleReceipt?.warehouse?.name || '',
      party_id: currentSaleReceipt?.party?.id || '',
      party_code: currentSaleReceipt?.party?.code || '',
      party_name: currentSaleReceipt?.party?.name || '',
      address: currentSaleReceipt?.party?.address || '',
      phone_number: currentSaleReceipt?.party?.phone || '',
      debt_limit: currentSaleReceipt?.party?.debt_limit ? currencyFormatter(currentSaleReceipt?.party?.debt_limit) : 0,
      debt_current: currentSaleReceipt?.party?.debt_current
        ? currencyFormatter(currentSaleReceipt?.party?.debt_current.toString())
        : 0,
      discount: currentSaleReceipt?.party?.discount_rate || 0,
      date_debt: currentSaleReceipt?.date_debt || 30,
      comment: currentSaleReceipt?.comment || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSaleReceipt]
  );

  const NewExportWareHouseSchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(NewExportWareHouseSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
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
      setCodeOrder(currentSaleReceipt?.code || '');
      setAddress(partyAddress);
      setDateOrder(currentSaleReceipt?.date);
      setCurrentParty(currentSaleReceipt?.party);
      getDebtLimit(currentSaleReceipt?.party);

      // Set order item and get info total for payment
      let totalPriceOrder = 0;
      let totalDiscountPriceOrder = 0;
      const itemOrderItems = currentSaleReceipt?.order_items.map((element) => {
        const priceOfGood = element?.price ? element?.price : 0;
        const totalPrice = parseFloat(priceOfGood) * element?.quantity;
        const discountPrice = (parseFloat(priceOfGood) - parseFloat(element?.discount)) * element?.quantity;
        totalPriceOrder += totalPrice;
        totalDiscountPriceOrder += discountPrice;
        return '';
        // return {
        //   id: element.id,
        //   good_code: element?.good,
        //   good_name: element?.good?.name,
        //   good_unit: element?.good.unit_of_measure?.name,
        //   quantity: element?.quantity,
        //   price: currencyFormatter(priceOfGood),
        //   total_price: currencyFormatter(totalPrice.toString()),
        //   discount_price: currencyFormatter(discountPrice.toString()),
        //   discount_rate: element?.discount,
        // };
      });
      const totalTaxPrice = (totalPriceOrder * vat) / 100;

      // Set info total for payment of order item when edit
      setInfoPaymentEdit({
        totalPriceOrder,
        totalDiscountPriceOrder,
        totalTaxPrice,
      });
      reset(defaultValues);
      // Set order item for detail order item
    }
  }, [isEdit, currentSaleReceipt, isLoading]);

  const addItem = () => {
    setTriggerClickAdd((triggerClickAdd) => triggerClickAdd + 1);
  };

  const getDebtLimit = async (partyData) => {
    setLoadingDebt(true);
    await axios.get(`get-debt-current-by-party/${partyData?.id}`).then((response) => {
      const { debtCurrent, orderSample } = response?.data?.data;
      setValue('debt_current', debtCurrent);
      setDebtCurrent(currencyFormatter((partyData.debt_limit - debtCurrent).toString()));
      setLoadingDebt(false);
    });
  };

  const onSave = () => {
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);

    // Filter empty item in payment item
    const newPayment = formData?.payments
      ? formData?.payments.filter((item) => formatPriceNumber(item.price_payment.toString()) !== 0)
      : [];

    if (!newPayment.length) {
      enqueueSnackbar('Vui lòng nhập chi tiết thanh toán', { variant: 'error' });
      setLoadingBtnSave(false);
      return;
    }

    let totalPricePayment = 0;

    // Get list payment item for order
    const paymentItem = newPayment.map((item) => {
      totalPricePayment += item.price_payment ? formatPriceNumber(item.price_payment) : 0;

      return {
        id: item.id,
        user_payment: user.id,
        comment: item.comment || '',
        attachFile: item.attachFile || '',
        price_payment: item.price_payment ? formatPriceNumber(item.price_payment) : 0,
        date_payment: item.date_payment,
      };
    });

    const totalPaymentOrder =
      infoPaymentEdit?.totalPriceOrder + infoPaymentEdit?.totalTaxPrice - infoPaymentEdit?.totalDiscountPriceOrder;

    const paymentSuccess = currentSaleReceipt?.payment_items.filter((item) => item.payment.payment_status_id === 2);
    let totalAmount = 0;
    if (paymentSuccess.length > 0) {
      totalAmount = paymentSuccess.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    }

    if (totalPricePayment > totalPaymentOrder - totalAmount) {
      enqueueSnackbar('Số tiền thanh toán đã vượt quá số tiền còn lại cần thanh toán của đơn hàng', {
        variant: 'error',
      });
      setLoadingBtnSave(false);
      return;
    }

    // Get order id
    const orderId = id;

    const newFormData = {
      warehouse_id: currentSaleReceipt?.warehouse?.id || null,
      date: moment(formData?.date).format('YYYY-MM-DD') || '',
      employee_id: user?.id || null,
      party_id: formData?.party_id || null,
      date_debt: formData?.date_debt || 30,
      payment_items: paymentItem || [],
      comment: formData?.comment || '',
      status_id: statusOrder,
      order_id: orderId,
      total_price_payment: totalPricePayment,
    };

    try {
      await axios.post(`payments`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });
      setValue('payments', []);
      dispatch(getSaleReceiptById(orderId));
      setIsRefresh(true);
      if (statusOrder === STATUSES.success_payment) setMode('success');
      setLoadingBtnSave(false);
      enqueueSnackbar('Cập nhập thanh toán thành công!');
    } catch (err) {
      enqueueSnackbar(err.data.message, { variant: 'error' });
      setLoadingBtnSave(false);
    }
  };

  const handleSetStatus = (status = null) => {
    if (status) setStatusOrder(status);
  };

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

  return (
    <>
      <Helmet>
        <title> Đơn hàng | Rượu Ngon</title>
      </Helmet>
      <Container maxWidth={false} sx={{ position: 'relative' }}>
        {isLoading && (
          <Box className={'c-box__loading'}>
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
            isEdit={isEdit}
            loadingBtnSave={loadingBtnSave}
            handlePrint={handlePrint}
            status={currentSaleReceipt?.order_status_id}
          />
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={8}>
                <Card>
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                      <div>
                        <Typography variant="h6">Chi tiết đặt hàng</Typography>
                      </div>
                    </Stack>
                    <OrderItemDetail
                      currentOrderItems={currentSaleReceipt?.order_items || []}
                      currentParty={currentParty}
                      isEdit={isEdit}
                      tax={TAX_GTGT}
                      infoPaymentEdit={infoPaymentEdit}
                      activeFields={activeFields}
                      isLoading={isLoading}
                      mode={mode}
                    />
                  </Box>
                </Card>
                <Card sx={{ mt: 3, minHeight: 300 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                    <div>
                      <Typography variant="h6">Lịch sử thanh toán</Typography>
                    </div>
                  </Stack>
                  <SalesReceiptHistoryPaymentDetail
                    currentSaleReceipt={currentSaleReceipt || null}
                    infoPaymentEdit={infoPaymentEdit}
                    isLoading={isLoading}
                    isRefresh={isRefresh}
                    setRefresh={() => setIsRefresh(false)}
                  />
                </Card>
              </Grid>
              <Grid item xs={isDesktop ? 4 : 12} md={isDesktop ? 4 : 8}>
                <Card sx={isDesktop ? { p: 3, ml: 3 } : { p: 3, mt: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                    <div>
                      <Typography variant="h6">Thông tin phiếu</Typography>
                    </div>
                  </Stack>
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
                    <RHFTextField size="small" name="code" label="Mã đơn hàng" disabled />
                    <RHFTextField size="small" name="date" label="Ngày đơn hàng" disabled />
                    <RHFTextField size="small" name="employee" label="Người tư vấn" value={user.name} disabled />
                    <RHFTextField size="small" name="warehouse" label="Kho đặt hàng" disabled />
                    <RHFTextField size="small" name="party_code" label="Mã khách hàng" disabled />
                    <RHFTextField size="small" name="party_name" label="Tên khách hàng" disabled />
                    <RHFTextField size="small" name="address" label="Địa chỉ" disabled />
                    <RHFTextField size="small" name="phone_number" label="Số điện thoại" disabled />
                    <RHFTextField size="small" name="debt_limit" label="Hạn mức công nợ" disabled />
                    <RHFTextField
                      size="small"
                      name="debt_current"
                      value={debtCurrent}
                      label="Công nợ hiện tại"
                      disabled
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {loadingDebt && <CircularProgress size={20} />}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField size="small" name="discount" label="Chiết khấu khách hàng" disabled />
                    <RHFTextField size="small" name="date_debt" label="Ngày nợ" disabled />
                  </Box>
                  <RHFTextField size="small" name="comment" label="Ghi chú" disabled />

                  <Divider sx={{ mt: 3, borderStyle: 'dashed' }} variant="dotted" />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 3, pb: 3 }}>
                    <div>
                      <Typography variant="h6">Lịch sử trạng thái đơn hàng</Typography>
                    </div>
                  </Stack>
                  <SalesReceiptOrderDetailStatusHistory
                    history={currentSaleReceipt?.order_order_statuses || []}
                    isLoading={isLoading}
                  />
                </Card>
              </Grid>
              {currentSaleReceipt?.order_status_id !== STATUSES.success_payment && currentMode === 'payment' && (
                <Grid item xs={12} md={12}>
                  <Card sx={{ mt: 3 }}>
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                        <div>
                          <Typography variant="h6">Chi tiết thanh toán</Typography>
                        </div>
                        <div>
                          <Button
                            sx={{ mr: 1 }}
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                            onClick={addItem}
                          >
                            Thêm
                          </Button>
                        </div>
                      </Stack>

                      <SalesReceiptPaymentDetail
                        triggerClickAdd={triggerClickAdd}
                        currentParty={currentParty}
                        infoPaymentEdit={infoPaymentEdit}
                        currentSaleReceipt={currentSaleReceipt || null}
                        setStatus={handleSetStatus}
                        isLoading={isLoading}
                      />
                    </Box>
                  </Card>
                </Grid>
              )}
              <button hidden={1} ref={refSubmitButton} type={'submit'} />
            </Grid>
          </FormProvider>
        </>
        <PrintPage data={currentSaleReceipt} />
      </Container>
    </>
  );
}
