import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  provinces: [],
  districts: [],
  wards: [],
  districtOfProvinces: [],
};

const slice = createSlice({
  name: 'geographic-boundaries',
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
    getProvinces(state, action) {
      state.isLoading = false;
      state.provinces = action.payload;
    },

    // GET PROVINCES
    getProvincessSuccess(state, action) {
      state.isLoading = false;
      state.provinces = action.payload;
    },

    getDistrictsSuccess(state, action) {
      state.isLoading = false;
      state.districts = action.payload;
    },

    getWardsSuccess(state, action) {
      state.isLoading = false;
      state.wards = action.payload;
    },

    getDistricts(state, action) {
      state.isLoading = false;
      state.provinces = action.payload;
    },

    getWards(state, action) {
      state.isLoading = false;
      state.wards = action.payload;
    },

    resetWards(state) {
      state.wards = [];
    },
  },
});

export const { getWardsSuccess, getDistrictsSuccess, getDistrictByProvinceId } = slice.actions;

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getProvinces() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('geographic-boundaries');
      const { provinces, districts } = response.data.data;
      dispatch(slice.actions.getProvincessSuccess(provinces));
      dispatch(slice.actions.getDistrictsSuccess(districts));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getWardByDistrictId(districtId) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`wards/${districtId}`);
      const { wards } = response.data.data;
      dispatch(slice.actions.getWardsSuccess(wards));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function resetWards() {
  return dispatch(slice.actions.resetWards());
}
