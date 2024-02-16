import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  payments: [],
  paymentStatus: [],
  dataOrders: {
    isLoading: false,
    orders: []
  },
  dataPaging: {}
};

const slice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getPyament(state, action) {
      state.isLoading = false;
      state.payments = action.payload;
    },

    getPyamentStatus(state, action) {
      state.isLoading = false;
      state.paymentStatus = action.payload;
    },

    startOrderLoading(state) {
      state.dataOrders.isLoading = true;
    },

    getOrder(state, action) {
      state.dataOrders.isLoading = false;
      state.dataOrders.orders = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------


export function getPayment(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('payment-multiple-orders', {
        params: queryParams
      });
      const { payments, paymentStatuses } = response?.data?.data || [];

      let newPayments = payments;
      if (newPayments?.per_page) {
        newPayments = newPayments.data;
      }

      dispatch(slice.actions.getPyament(newPayments));
      dispatch(slice.actions.getPyamentStatus(paymentStatuses));
      dispatch(slice.actions.getDataPaging(payments));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getOrderByParty(queryParams) {
  return async () => {
    dispatch(slice.actions.startOrderLoading());
    try {
      const response = await axios.get('get-order-by-party', { params: queryParams });
      const { orders } = response?.data?.data || [];
      dispatch(slice.actions.getOrder(orders));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
