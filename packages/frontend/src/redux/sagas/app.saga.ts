import { put, delay, takeEvery, all } from "redux-saga/effects";
import {
  CLEAR_ERROR,
  CLEAR_INFO,
  CLEAR_SUCCESS,
  SET_ERROR,
  SET_INFO,
  SET_SUCCESS,
} from "../slicers";
import { createAction } from "@reduxjs/toolkit";

export const TOGGLE_SUCCESS = createAction(
  "TOGGLE_SUCCESS",
  (payload: string) => ({ payload })
);

export function* toggleSuccess(action: ReturnType<typeof TOGGLE_SUCCESS>) {
  yield put(SET_SUCCESS(action.payload));
  yield delay(3000);
  yield put(CLEAR_SUCCESS());
}

export function* watchToggleSuccess() {
  yield takeEvery(TOGGLE_SUCCESS.toString(), toggleSuccess);
}

export const TOGGLE_ERROR = createAction("TOGGLE_ERROR", (payload: string) => ({
  payload,
}));

export function* toggleError(action: ReturnType<typeof TOGGLE_ERROR>) {
  yield put(SET_ERROR(action.payload));
  yield delay(3000);
  yield put(CLEAR_ERROR());
}

export function* watchToggleError() {
  yield takeEvery(TOGGLE_ERROR.toString(), toggleError);
}

export const TOGGLE_INFO = createAction("TOGGLE_INFO", (payload: string) => ({
  payload,
}));

export function* toggleInfo(action: ReturnType<typeof TOGGLE_INFO>) {
  yield put(SET_INFO(action.payload));
  yield delay(3000);
  yield put(CLEAR_INFO());
}

export function* watchToggleInfo() {
  yield takeEvery(TOGGLE_INFO.toString(), toggleInfo);
}

export function* watchAppSagas() {
  yield all([watchToggleSuccess(), watchToggleError(), watchToggleInfo()]);
}
