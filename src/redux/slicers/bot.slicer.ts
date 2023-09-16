import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

export const botSlicer = createSlice({
  name: "BOT",
  initialState: {
    connected: false,
  },
  reducers: {
    TOGGLE_BOT_CONNECTED: (state, action: PayloadAction<boolean>) => {
      console.log({ state });
      console.log({ action });
      state.connected = action.payload;
    },
  },
  extraReducers: {
    [HYDRATE]: (state, action: PayloadAction<{ connected: true }>) => {
      console.log({ action });
      return { ...state, ...action.payload };
    },
  },
});

export const { TOGGLE_BOT_CONNECTED } = botSlicer.actions;
