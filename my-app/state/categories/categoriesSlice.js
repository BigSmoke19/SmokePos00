import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    categories : [],
    status: 'idle',
    console: null
};

export const getCategories = createAsyncThunk(
    "categories/getCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("http://localhost:8000/api/Categories");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(getCategories.fulfilled,(state, action)=>{
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(getCategories.pending, (state) =>{
                state.status = 'loading';
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});


export default categoriesSlice.reducer;

