import { async } from "@firebase/util";
import axios from '../../utils/axios';
import { dispatch } from "../store";


const { createSlice } = require("@reduxjs/toolkit")

const initialState={
    isLoading: false,
    error: null,
    tagerts: [],
    dataPaging: {},
    tagertsByIdData: {
        isLoading: false,
        tagertsSample: '',
    }
}

const slice = createSlice({
    name: 'tagertMonth',
    initialState,
    reducers:{
        startLoading(state){
            state.isLoading = true;
        },
        hasError(state, action){
            state.isLoading = false;
            state.error = action.payload;
        },
        getTagertSuccess(state, action){
            state.isLoading = false;
            state.tagerts = action.payload;
        },
        getDataPaging(state, action){
            state.isLoading = false;
            state.dataPaging = action.payload;
        },

        startLoadingById(state) {
            state.tagertsByIdData.isLoading = true;
        },

        getTagertMonthSampleById(state, action) {
            state.tagertsByIdData.isLoading = false;
            state.tagertsByIdData.tagertsSample = action.payload;
        },
    }
})

export default slice.reducer;

// Actions
export const { getTagertSuccess } = slice.actions;

export function getTagert(queryData){
    return async()=>{
        dispatch(slice.actions.startLoading());
        try{
            const response = await axios.get('tagert-month',{ params: queryData });
            const tagerts = response?.data?.data?.tagerts || [];
            let newTagert = tagerts;
            if(tagerts?.per_page){
                newTagert = newTagert.data;
            }
            const newData = newTagert.map((item, key) => {
                return {
                  ...item,
                  serial: key + 1,
                };
            });
            dispatch(slice.actions.getTagertSuccess(newData));
            dispatch(slice.actions.getDataPaging(tagerts));
        }catch(error){
            dispatch(slice.actions.hasError(error));
        }
    }
}

export function getTagertMonthSampleById(id) {
    return async () => {
      dispatch(slice.actions.startLoadingById());
      try {
        const response = await axios.get(`tagert-month/${id}`);
        const employeeSample = response?.data?.data?.tagertsSample || [];
        dispatch(slice.actions.getTagertMonthSampleById(employeeSample));
      } catch (error) {
        console.error('error ', error);
        dispatch(slice.actions.hasError(error));
      }
    };
  }