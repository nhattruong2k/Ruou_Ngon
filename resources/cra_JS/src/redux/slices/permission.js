import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  permissions: [],
  screens: []
};


const slice = createSlice({
  name: 'permission',
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

    // GET CUSTOMER
    getPermissionsSuccess(state, action) {
      state.isLoading = false;
      state.permissions = action.payload
    },

    // GET CUSTOMER SUCCESS
    getScreensSuccess(state, action) {
      state.isLoading = false;
      state.screens = action.payload;
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getPermissions(queryData) {
  return async () => {
    dispatch(slice.actions.startLoading())
    try {
      const response = await axios.get('permistions', { params: queryData });
      const { permistions, screens } = response?.data?.data || [];

      dispatch(slice.actions.getPermissionsSuccess(permistions))
      dispatch(slice.actions.getScreensSuccess(screens))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}


