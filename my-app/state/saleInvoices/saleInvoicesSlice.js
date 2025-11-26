import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    saleInvoices : [],
    status: 'idle',
    console: null
};

export const getSaleInvoices = createAsyncThunk(
    "saleInvoices/getSaleInvoices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("http://localhost:8000/api/SaleInvoices");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const saleInvoicesSlice = createSlice({
    name: "saleInvoices",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(getSaleInvoices.fulfilled,(state, action)=>{
                state.status = 'succeeded';
                state.saleInvoices = action.payload;
            })
            .addCase(getSaleInvoices.pending, (state) =>{
                state.status = 'loading';
            })
            .addCase(getSaleInvoices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});


export default saleInvoicesSlice.reducer;

