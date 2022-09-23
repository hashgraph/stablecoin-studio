import type * as React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../i18n';
import theme from '../theme/Theme';
import SDKService from '../services/SDKService';

const mockStore = configureMockStore();
const store = mockStore({});

const AllProviders = ({ children }: { children?: React.ReactNode }) => (
	<I18nextProvider i18n={i18n}>
		<Provider store={store}>
			<ChakraProvider theme={theme}>
				<BrowserRouter>{children}</BrowserRouter>
			</ChakraProvider>
		</Provider>
	</I18nextProvider>
);

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
	render(ui, { wrapper: AllProviders, ...options });

export { customRender as render };

export const sdkMock = (fnToBeMocked: keyof typeof SDKService) => {
	return jest.mocked(SDKService[fnToBeMocked], true);
};
