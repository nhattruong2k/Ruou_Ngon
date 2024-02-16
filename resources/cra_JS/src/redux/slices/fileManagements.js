import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  files: [],
  dataPaging: {},
  path: []
};

const slice = createSlice({
  name: 'file-managements',
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

    // GET CUSTOMER CARE
    getFilesSuccess(state, action) {
      state.isLoading = false;
      state.files = action.payload
    },

    // GET PAGINATION
    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    getPath(state, action) {
      state.isLoading = false;
      state.path = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getFileManagements(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('file-managements', { params: queryParams });
      const { files, path } = response?.data?.data;

      let newFiles = files;
      if (newFiles?.per_page) {
        newFiles = newFiles.data;
      }

      dispatch(slice.actions.getFilesSuccess(newFiles));
      dispatch(slice.actions.getDataPaging(files));
      dispatch(slice.actions.getPath(path));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
