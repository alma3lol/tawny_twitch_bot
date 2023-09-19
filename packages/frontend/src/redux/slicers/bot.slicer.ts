import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const botSlicer = createSlice({
  name: "BOT",
  initialState: {
    connected: false,
    username: "",
  },
  reducers: {
    TOGGLE_BOT_CONNECTED: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    SET_BOT_USERNAME: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
  },
});

export const { TOGGLE_BOT_CONNECTED, SET_BOT_USERNAME } = botSlicer.actions;
