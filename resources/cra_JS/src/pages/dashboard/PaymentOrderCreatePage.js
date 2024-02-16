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
import PaymentCreateForm from '../../sections/@dashboard/payment-order-multiple/form';

import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
// ----------------------------------------------------------------------

export default function PaymentOrderCreatePage() {
  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [updatePayment, setUpdatePayment] = useState(0);

  const [isEdit, setIsEdit] = useState(false);

  const [orders, setOrders] = useState(null);

  const [payment, setPayment] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setIsEdit(true);
        setIsLoading(true);
        try {
          const response = await axios.get(`payment-multiple-orders/${id}`);
          const { orders, payment, party } = response?.data?.data?.dataPayment || [];
          const newOrders = orders.map((order, index) => ({ ...order, isOldDebt: false, indexItem: index + 1 }));
          if (payment?.payment_old_debts.length > 0) {
            const oldDebt = {
              id: party?.id,
              code: 'Công nợ cũ',
              isOldDebt: true,
              indexItem: 0,
              payment_old_debts: party?.payment_old_debts,
              total_price: party?.old_debt,
            };
            setOrders([oldDebt, ...newOrders]);
          } else {
            setOrders(newOrders);
          }
          setPayment(payment);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsEdit(false);
      setOrders(null);
      setPayment(null);
    }
  }, [id, updatePayment]);

  return (
    <>
      <Helmet>
        <title> Thanh toán đơn hàng | Rượu ngon</title>
      </Helmet>
      {isLoading && (
        <Box className={'c-box__loading'}>
          <CircularProgress className={'c-box__loading__icon'} />
        </Box>
      )}
      <PaymentCreateForm
        isEdit={isEdit}
        currentOrders={orders}
        currentPayment={payment}
        setUpdatePayment={setUpdatePayment}
      />
    </>
  );
}
