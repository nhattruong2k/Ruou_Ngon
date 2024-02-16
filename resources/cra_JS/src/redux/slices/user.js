import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  users: [],
  user: [],
  dataPaging: {}
};

const slice = createSlice({
  name: 'user',
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
      state.users = action.payload
    },

    // GET USER SUCCESS
    getUserSuccess(state, action) {
      state.isLoading = false;
      state.users = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getUsers(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading())
    try {
      const response = await axios.get('users', { params: queryParams });
      const { users } = response?.data?.data || [];
      let newUsers = users;
      if (newUsers?.per_page) {
        newUsers = newUsers.data;
      }

      dispatch(slice.actions.getUserSuccess(newUsers));
      dispatch(slice.actions.getDataPaging(users));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}

