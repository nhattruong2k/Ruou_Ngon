import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  internalOrgTypes: [],
  getInteralOrgType: null
};

const slice = createSlice({
  name: 'internal-org-type',
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

    getInternalOrgTypes(state, action) {
      state.isLoading = false;
      state.internalOrgTypes = action.payload
    }
  }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getInteralOrgTypes() {
  return async () => {
    dispatch(slice.actions.startLoading())
    try {
      const response = await axios.get('organization-types');
      const internalOrgTypes = response.data.data.data;
      dispatch(slice.actions.getInternalOrgTypes(internalOrgTypes))
    } catch(error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}
