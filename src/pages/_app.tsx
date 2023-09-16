import { ReduxProvider } from "@/providers";
import "./globals.css";
import type { AppProps } from 'next/app'

const MyApp = ({ Component, pageProps }: AppProps) => {
	return <ReduxProvider>
		<Component { ...pageProps } />;
	</ReduxProvider>
}

export default MyApp;
