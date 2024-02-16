import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  roles: [],
  role: []
};

const slice = createSlice({
  name: 'role',
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

    // GET USER
    getUsers(state, action) {
      state.isLoading = false;
      state.roles = action.payload
    },

    // GET USER SUCCESS
    getUserSuccess(state, action) {
      state.isLoading = false;
      state.roles = action.payload;
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getRoles(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading())
    try {
      const response = await axios.get('roles', { params: queryParams });
      const roles = response?.data?.data?.roles || [];
      dispatch(slice.actions.getUserSuccess(roles))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}

