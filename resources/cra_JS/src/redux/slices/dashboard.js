import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  dashboards: [],
  dashboardEmployee: {
    isLoading: false,
    renvenueEmployee: [],
    error: null
  },
  dashboardWarehouse: {
    isLoading: false,
    revenueWarehouse: {},
    error: null
  }

};

const slice = createSlice({
  name: 'dashboard',
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

    // GET BLOG
    getDashboard(state, action) {
      state.isLoading = false;
      state.dashboards = action.payload;
    },

    startLoadingRenvenueEmployee(state) {
      state.dashboardEmployee.isLoading = true;
    },

    getRenvenueEmployee(state, action) {
      state.dashboardEmployee.isLoading = false;
      state.dashboardEmployee.renvenueEmployee = action.payload;
    },

    hasErrorRenvenueEmployee(state, action) {
      state.dashboardEmployee.isLoading = false;
      state.dashboardEmployee.error = action.payload;
    },

    startLoadingRevenueWarehouse(state) {
      state.dashboardWarehouse.isLoading = true;
    },

    getRevenueWarehouse(state, action) {
      state.dashboardWarehouse.isLoading = false;
      state.dashboardWarehouse.revenueWarehouse = action.payload;
    },

    hasErrorRevenueWarehouse(state, action) {
      state.dashboardWarehouse.isLoading = false;
      state.dashboardWarehouse.error = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getDashboard(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('dashboard', { params: queryParams });
      const dashboard = response?.data?.data?.dashboards || [];

      let newBlogs = dashboard;
      if (newBlogs?.per_page) {
        newBlogs = newBlogs.data;
      }
      dispatch(slice.actions.getDashboard(newBlogs));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getRenvenueEmployee(queryData) {
  return async () => {
    dispatch(slice.actions.startLoadingRenvenueEmployee());
    try {
      const response = await axios.get('get-employee-sales', { params: queryData });
      const reports = response?.data?.data?.reports || [];
      let newReport = reports;
      if (newReport?.per_page) {
        newReport = newReport.data;
      }

      dispatch(slice.actions.getRenvenueEmployee(newReport));
    } catch (error) {
      dispatch(slice.actions.hasErrorRenvenueEmployee(error));
    }
  };
}

export function getRevenueWarehouse(queryData) {
  return async () => {
    dispatch(slice.actions.startLoadingRevenueWarehouse());
    try {
      const response = await axios.get('get-employee-admin', { params: queryData });
      const reports = response?.data?.data?.reports || [];
      let newReport = reports;
      if (newReport?.per_page) {
        newReport = newReport.data;
      }

      dispatch(slice.actions.getRevenueWarehouse(newReport));
    } catch (error) {
      dispatch(slice.actions.hasErrorRevenueWarehouse(error));
    }
  };
}


