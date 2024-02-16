import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  notifications: [],
  countNotiNotViewed: 0,
  totalNoti: 0,
};

const slice = createSlice({
  name: 'notification',
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

    // GET NOTIFICATIONS
    getNotifications(state, action) {
      state.isLoading = false;
      state.notifications = action.payload;
    },

    // GET COUNT NOTI NOT VIEWED
    getCountNotiNotViewed(state, action) {
      state.isLoading = false;
      state.countNotiNotViewed = action.payload;
    },

    // GET TOTAL NOTI
    getTotalNoti(state, action) {
      state.isLoading = false;
      state.totalNoti = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

export const { getNotifications } = slice.actions;

// ----------------------------------------------------------------------

export function getNotification(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('notifications', { params: queryParams });

      dispatch(slice.actions.getNotifications(response?.data?.data?.notifications?.data || []));
      dispatch(slice.actions.getCountNotiNotViewed(response?.data?.data?.countNotiNotViewed));
      dispatch(slice.actions.getTotalNoti(response?.data?.data?.totalNoti))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
