import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { PARTY_TYPE } from '../../utils/constant';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  parties: [],
  party: [],
  partyTypes: [],
  financialCompanies: [],
  dataPaging: {},
  partiesByEmployee: [],
};

const slice = createSlice({
  name: 'parties',
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

    // GET PARTIES
    getParties(state, action) {
      state.isLoading = false;
      state.parties = action.payload;
    },

    // GET PARTIES SUCCESS
    getPartiesSuccess(state, action) {
      state.isLoading = false;
      state.parties = action.payload;
    },

    // GET financialCompanies SUCCESS
    getfinancialCompaniesSuccess(state, action) {
      state.isLoading = false;
      state.financialCompanies = action.payload;
    },

    // GET PARTY TYPE SUCCESS
    getPartyTypeSuccess(state, action) {
      state.isLoading = false;
      state.partyTypes = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    // GET PARTIES BY EMPLOYEE
    getListPartiesByEmployee(state, action) {
      state.isLoading = false;
      state.partiesByEmployee = action.payload;
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getParties(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('parties', {
        params: queryParams
      });
      const parties = response?.data?.data?.parties || [];
      const partyTypes = response?.data?.data?.partyTypes || [];
      let newParties = parties;
      if (parties?.per_page) {
        newParties = newParties.data;
      }
      dispatch(slice.actions.getPartiesSuccess(newParties));
      dispatch(slice.actions.getPartyTypeSuccess(partyTypes));
      dispatch(slice.actions.getDataPaging(parties));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getAllPartiesNotExistFlt(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('get-parties-not-exist-flt', {
        params: queryParams,
      });
      const { parties } = response?.data?.data || [];
      const financialCompanies = parties.filter((party) => party.party_type_id === PARTY_TYPE.installment_partner);
      dispatch(slice.actions.getfinancialCompaniesSuccess(financialCompanies));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPartyType() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('party-types');
      const { partyTypes } = response.data.data;
      dispatch(slice.actions.getPartyTypeSuccess(partyTypes));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPartiesByEmployee(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response =  await axios.post('get-parties-by-employee', queryParams);

      dispatch(slice.actions.getListPartiesByEmployee(response?.data?.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}
