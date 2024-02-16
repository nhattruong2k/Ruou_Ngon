import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    debts: [],
    renvenueCustomer: [],
    renvenueEmployee: [],
    inventories: [],
    dataPaging: {},
};

const slice = createSlice({
    name: 'screen-report',
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

        // GET Debts
        getDebtsSuccess(state, action) {
            state.isLoading = false;
            state.debts = action.payload;
        },

        // GET Renvenue Customer
        getRenvenueCustomerSuccess(state, action) {
            state.isLoading = false;
            state.renvenueCustomer = action.payload;
        },

        getRenvenueEmployeeSuccess(state, action) {
            state.isLoading = false;
            state.renvenueEmployee = action.payload;
        },

        // GET INVENTORIES
        getInventories(state, action) {
            state.isLoading = false;
            state.inventories = action.payload;
        },

        getDataPaging(state, action) {
            state.isLoading = false;
            state.dataPaging = action.payload;
        },
    },
})

// Reducer
export default slice.reducer;

export function getDebts(queryData) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('report-debts', { params: queryData });
            const dataDebts = response?.data?.data?.debts || [];
            let newDataDebts = dataDebts;
            if (dataDebts?.per_page) {
                newDataDebts = newDataDebts.data;
            }

            dispatch(slice.actions.getDebtsSuccess(newDataDebts));
            dispatch(slice.actions.getDataPaging(dataDebts));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getRenvenueCustomer(queryData) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('get-party-reports', { params: queryData });
            const reports = response?.data?.data?.reports || [];
            let newReport = reports;
            if (newReport?.per_page) {
                newReport = newReport.data;
            }

            dispatch(slice.actions.getRenvenueCustomerSuccess(newReport));
            dispatch(slice.actions.getDataPaging(reports));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getRenvenueEmployee(queryData) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('get-employee-reports', { params: queryData });
            const reports = response?.data?.data?.reports || [];
            let newReport = reports;
            if (newReport?.per_page) {
                newReport = newReport.data;
            }

            dispatch(slice.actions.getRenvenueEmployeeSuccess(newReport));
            dispatch(slice.actions.getDataPaging(reports));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getInventories(queryData) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('report-inventory', { params: queryData });
            const dataInventories = response?.data?.data?.inventories || [];
            let newInventories = dataInventories;
            if (dataInventories?.per_page) {
                newInventories = newInventories.data;
            }

            dispatch(slice.actions.getInventories(newInventories));
            dispatch(slice.actions.getDataPaging(dataInventories));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}
