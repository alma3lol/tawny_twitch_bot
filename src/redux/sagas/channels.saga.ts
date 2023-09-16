import { createAction } from "@reduxjs/toolkit";
import { all, put, takeEvery } from "redux-saga/effects";
import { addChannel } from "../slicers";

export const ADD_CHANNEL_ACTION = createAction(
  "ADD_CHANNEL_ACTION",
  (payload: string) => ({ payload })
);

export function* addChannelSaga(action: ReturnType<typeof ADD_CHANNEL_ACTION>) {
  yield put(addChannel(action.payload));
}

export function* watchChannelsSaga() {
  yield all([takeEvery(ADD_CHANNEL_ACTION.toString(), addChannelSaga)]);
}
