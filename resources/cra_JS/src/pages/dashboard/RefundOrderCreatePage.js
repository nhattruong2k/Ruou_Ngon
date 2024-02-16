import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../style/style.css';
// @mui
import { Container, Button, CircularProgress, Box } from '@mui/material';
import Iconify from '../../components/iconify';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _invoices } from '../../_mock/arrays';

// components
import { useSettingsContext } from '../../components/settings';
// sections
import RefundCreateForm from '../../sections/@dashboard/refund-order/form';

import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
// ----------------------------------------------------------------------

export default function RefundOrderCreatePage() {
  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [updatePayment, setUpdatePayment] = useState(0);

  const [isEdit, setIsEdit] = useState(false);

  const [orderRefunds, setOrderRefund] = useState(null);

  const [orderSaleReceipts, setOrderSaleReceipts] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setIsEdit(true);
        setIsLoading(true);
        try {
          const response = await axios.get(`get-order-refund-by-id/${id}`);
          const { orderRefund, orderSaleReceipt } = response?.data?.data || [];
          setOrderRefund(orderRefund);
          setOrderSaleReceipts(orderSaleReceipt);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsEdit(false);
      setOrderRefund(null);
      setOrderSaleReceipts(null);
    }

  }, [id, updatePayment]);

  return (
    <>
      <Helmet>
        <title> Trả đơn hàng | Rượu ngon</title>
      </Helmet>
      {isLoading && (
        <Box className={'c-box__loading'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}
      <RefundCreateForm
        isEdit={isEdit}
        orderRefunds={orderRefunds}
        orderSaleReceipts={orderSaleReceipts}
        setUpdatePayment={setUpdatePayment}
      />
    </>
  );
}
