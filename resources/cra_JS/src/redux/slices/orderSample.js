import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { PARTY_TYPE } from '../../utils/constant';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  orderSamples: [],
  dataPaging: {},
  orderByIdData: {
    isLoading: false,
    orderSample: ''
  }
};

const slice = createSlice({
  name: 'order-sample',
  initialState,
  reducers: {

    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getOrderSamples(state, action) {
      state.isLoading = false;
      state.orderSamples = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    startLoadingById(state) {
      state.orderByIdData.isLoading = true;
    },

    getOrderSampleById(state, action) {
      state.orderByIdData.isLoading = false;
      state.orderByIdData.orderSample = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getOrderSamples(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('order-samples', {
        params: queryParams
      });
      const orderSample = response?.data?.data?.orderSample || [];

      let newOrderSample = orderSample;
      if (newOrderSample?.per_page) {
        newOrderSample = newOrderSample.data;
      }
      dispatch(slice.actions.getOrderSamples(newOrderSample));
      dispatch(slice.actions.getDataPaging(orderSample));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}


export function getOrderSampleById(id) {
  return async () => {
    dispatch(slice.actions.startLoadingById());
    try {
      const response = await axios.get(`order-samples/${id}`);
      const orderSample = response?.data?.data?.orderSample || [];
      dispatch(slice.actions.getOrderSampleById(orderSample));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}