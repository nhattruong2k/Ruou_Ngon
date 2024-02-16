import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    warehouseExports: [],
    dataPaging: [],
    internalOrgs: [],
    typeExports: [],
    orderStatus: []
};

const slice = createSlice({
    name: 'warehouseExport',
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

        // GET warehouse
        getWarehouseExports(state, action) {
            state.isLoading = false;
            state.warehouseExports = action.payload;
        },

        // GET DATA PAGING
        getDataPaging(state, action) {
            state.isLoading = false;
            state.dataPaging = action.payload;
        },

        // GET DATA PAGING
        getInternalOrgs(state, action) {
            state.isLoading = false;
            state.internalOrgs = action.payload;
        },

        // GET DATA PAGING
        getTypeExports(state, action) {
            state.isLoading = false;
            state.typeExports = action.payload;
        },

        getOrderStatus(state, action) {
            state.orderStatus = action.payload;
        }
    },
});

// Reducer
export default slice.reducer;

export const { getWarehouseExports } = slice.actions;

// ----------------------------------------------------------------------

export function getWarehouseExport(queryParams) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('warehouse-export', { params: queryParams });
            const warehouseExports = response?.data?.data?.warehouseExports || [];
            const internalOrgs = response?.data?.data?.internalOrgs || [];
            const typeExports = response?.data?.data?.typeExports || [];
            const orderStatus = response?.data?.data?.orderStatus || [];

            let newWarehouseExports = warehouseExports;
            if (newWarehouseExports?.per_page) {
                newWarehouseExports = newWarehouseExports.data;
            }

            dispatch(slice.actions.getWarehouseExports(newWarehouseExports));
            dispatch(slice.actions.getDataPaging(warehouseExports));
            dispatch(slice.actions.getInternalOrgs(internalOrgs?.data));
            dispatch(slice.actions.getTypeExports(typeExports));
            dispatch(slice.actions.getOrderStatus(orderStatus));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}