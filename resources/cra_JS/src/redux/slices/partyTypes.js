import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  partyTypes: [],
  dataPaging: {},
};

const slice = createSlice({
  name: 'partyTypes',
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

    // GET PAGINATION
    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    // GET ORDER TYPE
    getPartyTypes(state, action) {
      state.isLoading = false;
      state.partyTypes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getPartyTypes(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('partyTypes', { params: queryParams });
      const partyTypes = response?.data?.data?.partyTypes;
      let newpartyTypes = partyTypes;

      if (newpartyTypes?.per_page) {
        newpartyTypes = newpartyTypes.data;
      }

      dispatch(slice.actions.getDataPaging(partyTypes));
      dispatch(slice.actions.getPartyTypes(newpartyTypes));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
