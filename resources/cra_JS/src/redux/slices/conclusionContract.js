import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  dataPaging: [],
  contracts: [],
  conclusionContractByIdData: {
    isLoading: false,
    conclusionContractSample: '',
  }
};

const slice = createSlice({
  name: 'conclusionContract',
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

    // GET DATA PAGING
    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },
  
    // GET 
    getConclusionContract(state, action) {
      state.isLoading = false;
      state.contracts = action.payload;
    },

    startLoadingById(state) {
      state.conclusionContractByIdData.isLoading = true;
    },

    getConclusionContractById(state, action) {
      state.conclusionContractByIdData.isLoading = false;
      state.conclusionContractByIdData.conclusionContractSample = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getConclusionContract(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('conclusion-contract', { params: queryParams });
      const contracts = response?.data?.data?.contracts|| [];

      let newConclusionContract = contracts;
      if (newConclusionContract?.per_page) {
        newConclusionContract = newConclusionContract.data;
      }

      dispatch(slice.actions.getConclusionContract(newConclusionContract));
      dispatch(slice.actions.getDataPaging(contracts));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getConclusionContractById(id){
  return async () => {
    dispatch(slice.actions.startLoadingById());
    try {
      const response = await axios.get(`conclusion-contract/${id}`);
      const conclusionContractSample = response?.data?.data?.conclusionContractSample || [];
      dispatch(slice.actions.getConclusionContractById(conclusionContractSample));
    } catch (error) {
      console.error('error ', error);
      dispatch(slice.actions.hasError(error));
    }
  };
}