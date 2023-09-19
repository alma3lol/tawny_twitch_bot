import { render, screen } from '@testing-library/react';
import App from './App';
import { store } from './redux';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack'

test('renders learn react link', () => {
  render(
		<SnackbarProvider>
			<Provider store={store}>
				<App />
			</Provider>
		</SnackbarProvider>
	);
  const linkElement = screen.getByText(/connect to twitch/i);
  expect(linkElement).toBeInTheDocument();
});
