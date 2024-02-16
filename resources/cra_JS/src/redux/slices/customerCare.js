import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    customerCares: [],
    dataPaging: {}
  };

const slice = createSlice({
    name: 'customer-care',
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

        // GET Customer Care
        getCustomerCareSuccess(state, action) {
            state.isLoading = false;
            state.customerCares = action.payload;
        },

        getDataPaging(state, action) {
            state.isLoading = false;
            state.dataPaging = action.payload;
        },
    },
})

// Reducer
export default slice.reducer;

// Actions
export const { getCustomerCareSuccess } = slice.actions;

// ----------------------------------------------------------------------


export function getCustomer(queryData) {
    return async () => {
      dispatch(slice.actions.startLoading());
      try {
        const response = await axios.get('customer-care', { params: queryData });
        const customerCares = response?.data?.data?.customerCare || [];
        let newCustomer = customerCares;
        if (customerCares?.per_page) {
            newCustomer = newCustomer.data;
        }

        dispatch(slice.actions.getCustomerCareSuccess(newCustomer));
        dispatch(slice.actions.getDataPaging(customerCares));
      } catch (error) {
        dispatch(slice.actions.hasError(error));
      }
    };
  }