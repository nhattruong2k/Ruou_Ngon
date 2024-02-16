import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  goodCategories: [],
  goodGroups: [],
  goodCategory: [],
  dataPaging: {},
};

const slice = createSlice({
  name: 'good-category',
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

    // GET CATEGOGIRES
    getGoodCategories(state, action) {
      state.isLoading = false;
      state.goodCategories = action.payload;
    },
    // GET GOOD CATEGOGIRES SUCESS
    getGoodCategorySuccess(state, action) {
      state.isLoading = false;
      state.goodCategories = action.payload;
    },

    getGoodGroups(state, action) {
      state.isLoading = false;
      state.goodGroups = action.payload;
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

export function getGoodCategories(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('good-categories', { params: queryParams });
      const { goodCategories } = response?.data?.data;

      let newGoodCategories = goodCategories;
      if (newGoodCategories?.per_page) {
        newGoodCategories = newGoodCategories.data;
      }

      dispatch(slice.actions.getGoodCategorySuccess(newGoodCategories));
      dispatch(slice.actions.getDataPaging(goodCategories));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
