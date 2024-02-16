import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  internalOrgs: [],
  dataPaging: {}
};

const slice = createSlice({
  name: 'internal-org',
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

    // GET ORGANIZATION
    getInternalOrgSuccess(state, action) {
      state.isLoading = false;
      state.internalOrgs = action.payload;
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


export function getInternalOrg(queryData) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('internal-orgs', { params: queryData });
      const { internalOrgs } = response?.data?.data;

      let newInternalOrgs = internalOrgs;
      if (newInternalOrgs?.per_page) {
        newInternalOrgs = newInternalOrgs.data;
      }

      dispatch(slice.actions.getInternalOrgSuccess(newInternalOrgs));
      dispatch(slice.actions.getDataPaging(internalOrgs));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getInternalOrganizationType() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('organization-types');
      const interalOrganizationTypes = response?.data?.data?.types;
      dispatch(slice.actions.getInternalOrgSuccess(interalOrganizationTypes));
    } catch (error) {
      dispatch(slice.actions.hasError);
    }
  };
}


