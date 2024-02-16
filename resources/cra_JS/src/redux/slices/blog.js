import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  blogs: [],
  blog: {},
};

const slice = createSlice({
  name: 'blog',
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

    // GET BLOG
    getBlogs(state, action) {
      state.isLoading = false;
      state.blogs = action.payload;
    },

    // GET BLOG BY ID
    getBlogById(state, action) {
      state.isLoading = false;
      state.blog = action.payload;
    },

    // GET BLOG SUCESS
    getBlogSuccess(state, action) {
      state.isLoading = false;
      state.blogs = action.payload;
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

export function getBlogs(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('blogs', { params: queryParams });
      const blogs = response?.data?.data?.blogs || [];
      
      let newBlogs = blogs;
      if (newBlogs?.per_page) {
        newBlogs = newBlogs.data;
      }
      dispatch(slice.actions.getBlogs(newBlogs));

      dispatch(slice.actions.getDataPaging(blogs));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getBlogById(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('get-blog-by-id', { id: queryParams });
      const blog = response?.data?.data || {};
      
      dispatch(slice.actions.getBlogById(blog));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}

