import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  employees: [],
  dataPaging: {}
};

const slice = createSlice({
  name: 'employee',
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

    // GET EMPLOYEESS
    getEmployeeSuccess(state, action) {
      state.isLoading = false;
      state.employees = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getEmployeeSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getEmployees(queryData) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('employees', { params: queryData });
      const employees = response?.data?.data?.employees || [];

      let newEmployees = employees;
      if (newEmployees?.per_page) {
        newEmployees = newEmployees.data;
      }

      dispatch(slice.actions.getEmployeeSuccess(newEmployees));
      dispatch(slice.actions.getDataPaging(employees));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

