import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const botSlicer = createSlice({
  name: "BOT",
  initialState: {
    connected: false,
  },
  reducers: {
    TOGGLE_BOT_CONNECTED: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
  },
});

export const { TOGGLE_BOT_CONNECTED } = botSlicer.actions;
