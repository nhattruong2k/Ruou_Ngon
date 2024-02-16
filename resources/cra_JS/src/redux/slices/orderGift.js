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
  orderGifts: [],
  orderGift: {},
  quantityForStatusTab: [],
};

const slice = createSlice({
  name: 'orderGift',
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

    // GET ORDER GIFTS
    getOrderGifts(state, action) {
      state.isLoading = false;
      state.orderGifts = action.payload;
    },

    // GET QUANTITY FOR STATUS TAB
    getQuantityForStatusTab(state, action) {
      state.isLoading = false;
      state.quantityForStatusTab = action.payload;
    },

    // GET ORDER GIFT BY ID
    getOrderGiftById(state, action) {
      state.isLoading = false;
      state.orderGift = action.payload;
    },

    // RESET DATA ORDER GIFT
    resetOrderGift(state) {
      state.orderGift = {};
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getOrderGift(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('order-gift', { params: queryParams });
      const listOrderGift = response?.data?.data?.orderGifts || [];
      const quantity = response?.data?.data?.quantity_for_status_tab || [];

      let newOrderGifts = listOrderGift;
      if (newOrderGifts?.per_page) {
        newOrderGifts = newOrderGifts.data;
      }

      dispatch(slice.actions.resetOrderGift());
      dispatch(slice.actions.getOrderGifts(newOrderGifts));
      dispatch(slice.actions.getQuantityForStatusTab(quantity));
      dispatch(slice.actions.getDataPaging(listOrderGift));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getOrderGiftById(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('get-order-gift-by-id', { id: queryParams });
      const orderGift = response?.data?.data || {};

      dispatch(slice.actions.getOrderGiftById(orderGift));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function resetDataOrderGift() {
  dispatch(slice.actions.resetOrderGift());
}
