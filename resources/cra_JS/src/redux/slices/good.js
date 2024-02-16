import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  isLoading: false,
  goods: [],
  good: [],
  unitOfMeasures: [],
  goodBrands: [],
  goodCategories: [],
  dataPaging: {},
  goodOthers: [],
  goodVouchers: [],
  gooodByCategory: [],
  product: {
    isLoading: false,
    products: [],
    allProducts: [],
  }
};

const slice = createSlice({
  name: 'good',
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

    // GET GOOD
    getGoods(state, action) {
      state.isLoading = false;
      state.goods = action.payload;
    },

    // GET GOOD SUCESS
    getGoodSuccess(state, action) {
      state.isLoading = false;
      state.goods = action.payload;
    },

    getUnitOfMeasures(state, action) {
      state.isLoading = false;
      state.unitOfMeasures = action.payload;
    },

    getGoodBrands(state, action) {
      state.isLoading = false;
      state.goodBrands = action.payload;
    },


    getGoodCategories(state, action) {
      state.isLoading = false;
      state.goodCategories = action.payload;
    },

    getGoodVouchers(state, action) {
      state.isLoading = false;
      state.goodVouchers = action.payload;
    },

    getGoodOthers(state, action) {
      state.isLoading = false;
      state.goodOthers = action.payload;
    },
    // GET GOOD BY CATEGORY 
    getGoodByGoodCategory(state, action) {
      state.isLoading = false;
      state.gooodByCategory = action.payload;
    },

    getGoodByGoodCategorySuccess(state, action) {
      state.isLoading = false;
      state.gooodByCategory = action.payload;
    },

    getDataPaging(state, action) {
      state.isLoading = false;
      state.dataPaging = action.payload;
    },

    startLoadingProductReport(state) {
      state.product.isLoading = true;
    },

    getProductReportSuccess(state, action) {
      state.product.isLoading = false;
      state.product.products = action.payload;
    },

    getAllProductReportSucces(state, action) {
      state.product.isLoading = false;
      state.product.allProducts = action.payload;
    },

    getProductReportDataPaging(state, action) {
      state.product.isLoading = false;
      state.product.dataPaging = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getGoods(queryParams) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('goods', { params: queryParams });
      const { goods, unitOfMeasures, goodBrands, goodCategories } = response?.data?.data;
      let newGoods = goods;
      if (newGoods?.per_page) {
        newGoods = newGoods.data;
      }
      dispatch(slice.actions.getGoodSuccess(newGoods));
      dispatch(slice.actions.getGoodBrands(goodBrands));
      dispatch(slice.actions.getUnitOfMeasures(unitOfMeasures));
      dispatch(slice.actions.getGoodCategories(goodCategories));

      dispatch(slice.actions.getDataPaging(goods));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getProductReports(queryData) {
  return async () => {
    dispatch(slice.actions.startLoadingProductReport());
    try {
      const response = await axios.get('good-reports', { params: queryData });
      const { report } = response?.data?.data;
      let newReportProduct = report;
      if (newReportProduct?.per_page) {
        newReportProduct = newReportProduct.data;
      }
      dispatch(slice.actions.getProductReportSuccess(newReportProduct));
      dispatch(slice.actions.getProductReportDataPaging(report));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


