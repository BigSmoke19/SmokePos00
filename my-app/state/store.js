import { configureStore } from "@reduxjs/toolkit";
import itemsReducer from "./items/itemsSlice";
import categoriesReducer from "./categories/categoriesSlice";
import saleInvoicesReducer from './saleInvoices/saleInvoicesSlice';
import  usersReducer  from "./users/usersSlice";

export const store = configureStore({
    reducer:{
        items: itemsReducer,
        categories: categoriesReducer,
        saleInvoices: saleInvoicesReducer,
        users: usersReducer
    }
});

export const RootState = store.getState();

export const AppDispatch = store.dispatch;
