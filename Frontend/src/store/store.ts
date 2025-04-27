import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import friendSlice from "./friendSlice";
import messageSlice from "./messageSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    friend: friendSlice,
    message: messageSlice,
  },
});

//This are types that we need while using dispatch and selector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
