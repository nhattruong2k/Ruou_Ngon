import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  customerCareTypes: [],
  workCategories: [],
  orderTypes: [],
  dataPaging: {}
};

const slice = createSlice({
  name: 'cr-category',
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

    // GET CUSTOMER CARE
    getCustomerCareTypes(state, action) {
      state.isLoading = false;
      state.customerCareTypes = action.payload
    },

    // GET PAGINATION
    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    // GET WORK
    getWorkCategories(state, action) {
      state.isLoading = false;
      state.workCategories = action.payload;
    },

    // GET ORDER TYPE
    getOrderTypes(state, action) {
      state.isLoading = false;
      state.orderTypes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getCrCategories(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('cr-categories', { params: queryParams });
      const { customerCareTypes, workCategories, orderTypes } = response?.data?.data;

      let newCustomerCareTypes = customerCareTypes;
      let newWorkCategories = workCategories;
      let newOrderTypes = orderTypes;

      if (newCustomerCareTypes?.per_page) {
        newCustomerCareTypes = newCustomerCareTypes.data;
      }
      if (newWorkCategories?.per_page) {
        newWorkCategories = newWorkCategories.data;
      }
      if (newOrderTypes?.per_page) {
        newOrderTypes = newOrderTypes.data;
      }

      dispatch(slice.actions.getCustomerCareTypes(newCustomerCareTypes));
      dispatch(slice.actions.getDataPaging(response?.data?.data));
      dispatch(slice.actions.getWorkCategories(newWorkCategories));
      dispatch(slice.actions.getOrderTypes(newOrderTypes));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
