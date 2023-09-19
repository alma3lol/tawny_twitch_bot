import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const appSlicer = createSlice({
  name: "APP",
  initialState: {
    submitting: false,
    success: false,
    successMessage: "",
    error: false,
    errorMessage: "",
    info: false,
    infoMessage: "",
  },
  reducers: {
    SET_SUBMITTING: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },
    SET_SUCCESS: (state, action: PayloadAction<string>) => {
      state.success = true;
      state.successMessage = action.payload;
    },
    CLEAR_SUCCESS: (state) => {
      state.success = false;
      state.successMessage = "";
    },
    SET_ERROR: (state, action: PayloadAction<string>) => {
      state.error = true;
      state.errorMessage = action.payload;
    },
    CLEAR_ERROR: (state) => {
      state.error = false;
      state.errorMessage = "";
    },
    SET_INFO: (state, action: PayloadAction<string>) => {
      state.info = true;
      state.infoMessage = action.payload;
    },
    CLEAR_INFO: (state) => {
      state.info = false;
      state.infoMessage = "";
    },
  },
});

export const {
  SET_SUBMITTING,
  CLEAR_ERROR,
  SET_ERROR,
  SET_SUCCESS,
  CLEAR_SUCCESS,
  SET_INFO,
  CLEAR_INFO,
} = appSlicer.actions;
