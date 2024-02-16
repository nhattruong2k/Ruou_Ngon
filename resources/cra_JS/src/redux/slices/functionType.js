import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  functionTypes: [],
  filterFunctionTypes: [],
};

const slice = createSlice({
  name: 'functionType',
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

    getFunctionTypes(state, action) {
      state.isLoading = false;
      state.functionTypes = action.payload;
    },

    getFunctionTypesSuccess(state, action) {
      state.isLoading = false;
      state.functionTypes = action.payload;
    },

    getFilterFunctionTypes(state, action) {
      state.isLoading = false;
      state.filterFunctionTypes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getFunctionTypes(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('functions', { params: queryParams });
      const functionData = response?.data?.data?.data || [];

      const newData = functionData.map((item) => {
        const settings = item?.setting?.properties.map(({ name }) => {
          return name;
        });
        return {
          ...item,
          setting: settings,
          properties: item?.setting?.properties,
        };
      });
      dispatch(slice.actions.getFunctionTypesSuccess(newData));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFilterFunctionTypes(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('functions', { params: queryParams });
      const functionData = response?.data?.data?.data || [];
      dispatch(slice.actions.getFilterFunctionTypes(functionData));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
