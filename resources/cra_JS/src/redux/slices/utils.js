import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  Url: '',
};

const slice = createSlice({
  name: 'util',
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

    getUrl(state, action) {
      state.isLoading = false;
      state.Url = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getUrlDomain() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('get-url');
      dispatch(slice.actions.getUrl(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
