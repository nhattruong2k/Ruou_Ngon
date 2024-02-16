import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoadingImportWarehouse: false,
  error: null,
  orders: [],
  dataPaging: {},
  functions: [],
  orderTransfer: [],
  orderStatus: []
};

const slice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoadingImportWarehouse = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoadingImportWarehouse = false;
      state.error = action.payload;
    },

    // GET ORDER IMPORT BY
    getOrderImport(state, action) {
      state.isLoadingImportWarehouse = false;
      state.orders = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoadingImportWarehouse = false;
      state.dataPaging = action.payload;
    },

    getFunctions(state, action) {
      state.isLoadingImportWarehouse = false;
      state.functions = action.payload;
    },

    getOrderTransfer(state, action) {
      state.orderTransfer = action.payload;
    },

    getOrderStatus(state, action) {
      state.orderStatus = action.payload;
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getOrderImportBuy(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('order-import-warehouses', { params: queryParams });
      const { orderImport, functions, orderStatus } = response?.data?.data;
      let newOrderImport = orderImport;
      if (newOrderImport?.per_page) {
        newOrderImport = newOrderImport.data;
      }
      dispatch(slice.actions.getOrderImport(newOrderImport));
      dispatch(slice.actions.getFunctions(functions));
      dispatch(slice.actions.getDataPaging(orderImport));
      dispatch(slice.actions.getOrderStatus(orderStatus));

    } catch (error) {
      console.log('error', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}


export function getOrderTransfer(queryParams) {
  return async () => {
    try {
      const response = await axios.get('order-import-warehouses', { params: queryParams });
      const { orderImport } = response?.data?.data;

      dispatch(slice.actions.getOrderTransfer(orderImport));

    } catch (error) {
      console.log('error', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}