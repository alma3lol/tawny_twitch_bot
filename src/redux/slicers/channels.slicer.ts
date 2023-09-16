import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { HYDRATE } from "next-redux-wrapper";

export const channelsSlicer = createSlice({
  name: "CHANNELS",
  initialState: [] as string[],
  reducers: {
    addChannel: (state, payload: PayloadAction<string>) => {
      if (!_.includes(state, payload.payload)) {
        state.push(payload.payload);
      }
    },
    removeChannel: (state, payload: PayloadAction<string>) => {
      if (_.includes(state, payload.payload)) {
        state = state.filter((channel) => channel !== payload.payload);
      }
    },
  },
  extraReducers: {
    [HYDRATE]: (state, action: PayloadAction<string[]>) => {
      console.log({ action });
      return [...state, ...action.payload];
    },
  },
});

export const { addChannel, removeChannel } = channelsSlicer.actions;
