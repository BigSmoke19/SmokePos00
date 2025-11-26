import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    users : [],
    status: 'idle',
    console: null
};

export const getUsers = createAsyncThunk(
    "users/getUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("http://localhost:8000/api/Users");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.fulfilled,(state, action)=>{
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(getUsers.pending, (state) =>{
                state.status = 'loading';
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});


export default usersSlice.reducer;

