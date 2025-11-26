import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    items : [],
    status: 'idle',
    console: null
};

export const getItems = createAsyncThunk(
    "items/getItems",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("http://localhost:8000/api/Items");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const itemsSlice = createSlice({
    name: "items",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(getItems.fulfilled,(state, action)=>{
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(getItems.pending, (state) =>{
                state.status = 'loading';
            })
            .addCase(getItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});


export default itemsSlice.reducer;

