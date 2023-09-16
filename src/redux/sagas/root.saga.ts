import { all } from "redux-saga/effects";
import { watchChannelsSaga } from "./channels.saga";

export function* rootSaga() {
  yield all([watchChannelsSaga()]);
}
