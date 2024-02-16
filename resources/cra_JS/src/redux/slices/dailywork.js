import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  dailyworks: [],
  workCategories: [],
  dataPaging: {}
};

const slice = createSlice({
  name: 'dailyWork',
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

    getDailyWork(state, action) {
      state.isLoading = false;
      state.dailyworks = action.payload;
    },

    getWorkCategory(state, action) {
      state.isLoading = false;
      state.workCategories = action.payload;
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

export function getDailyWorks(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('daily-works', { params: queryParams });
      const { dailyWorks, workCategories } = response?.data?.data || [];
      let newDailyWorks = dailyWorks;
      if (newDailyWorks?.per_page) {
        newDailyWorks = newDailyWorks.data;
      }
      dispatch(slice.actions.getDailyWork(newDailyWorks));
      dispatch(slice.actions.getWorkCategory(workCategories));
      dispatch(slice.actions.getDataPaging(dailyWorks));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
