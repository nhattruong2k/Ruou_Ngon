import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  dataPaging: [],
  salesReceipt: [],
  saleReceipt: {},
  quantityForStatusTab: [],
  dataOrders: {
    isLoading: false,
    orders: []
  },
};

const slice = createSlice({
  name: 'saleReceipt',
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

    // GET DATA PAGING
    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    // GET SALE RECEIPT
    getSalesReceipt(state, action) {
      state.isLoading = false;
      state.salesReceipt = action.payload;
    },

    // GET QUANTITY FOR STATUS TAB
    getQuantityForStatusTab(state, action) {
      state.isLoading = false;
      state.quantityForStatusTab = action.payload;
    },

    // GET SALE RECEIPT BY ID
    getSaleReceiptById(state, action) {
      state.isLoading = false;
      state.saleReceipt = action.payload;
    },

    // RESET DATA SALE RECEIPT
    resetSaleRecipt(state) {
      state.saleReceipt = {}
    },

    startOrderLoading(state) {
      state.dataOrders.isLoading = true;
    },

    getOrder(state, action) {
      state.dataOrders.isLoading = false;
      state.dataOrders.orders = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

export const { getSalesReceipt } = slice.actions;

// ----------------------------------------------------------------------

export function getSaleReceipt(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('sales-receipt', { params: queryParams });
      const salesReceipt = response?.data?.data?.salesReceipt || [];
      const quantity = response?.data?.data?.quantity_for_status_tab || [];

      let newSalesReceipt = salesReceipt;
      if (newSalesReceipt?.per_page) {
        newSalesReceipt = newSalesReceipt.data;
      }

      dispatch(slice.actions.resetSaleRecipt());
      dispatch(slice.actions.getSalesReceipt(newSalesReceipt));
      dispatch(slice.actions.getQuantityForStatusTab(quantity))
      dispatch(slice.actions.getDataPaging(salesReceipt));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getSaleReceiptById(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('get-sale-receipt-by-id', { id: queryParams });
      const saleReceipt = response?.data?.data || {};

      dispatch(slice.actions.getSaleReceiptById(saleReceipt));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}

export function resetDataSaleReceipt() {
  dispatch(slice.actions.resetSaleRecipt());
}

export function getOrderByParty(queryParams) {
  return async () => {
    dispatch(slice.actions.startOrderLoading());
    try {
      const response = await axios.get('get-order-refund-by-party', { params: queryParams });
      const { orders } = response?.data?.data || [];
      dispatch(slice.actions.getOrder(orders));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
