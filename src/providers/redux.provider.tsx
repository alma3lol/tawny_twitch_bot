"use client";

import { wrapper } from "@/redux";
import { Provider } from "react-redux";

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
	const { store } = wrapper
		.useWrappedStore({})
	return <Provider store={ store }> { children } </Provider>
};
