import type * as React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../i18n';
import theme from '../theme/Theme';
import SDKService from '../services/SDKService';
import { Provider } from 'react-redux';
import type { MockStoreEnhanced } from 'redux-mock-store';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState as walletInitialState } from '../store/slices/walletSlice';
import { mockedSelectedStableCoin, mockedStableCoinsList, mockedWalletData } from '../mocks/sdk';

const walletInitial = {
	...walletInitialState,
	data: mockedWalletData,
	selectedStableCoin: mockedSelectedStableCoin,
	stableCoinList: mockedStableCoinsList,
};

const AllProviders = ({ children }: { children?: React.ReactNode }) => (
	<I18nextProvider i18n={i18n}>
		<ChakraProvider theme={theme}>
			<BrowserRouter>{children}</BrowserRouter>
		</ChakraProvider>
	</I18nextProvider>
);
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const defaultStore = mockStore({
	wallet: walletInitial,
});

const customRender = (
	ui: React.ReactElement,
	store: MockStoreEnhanced<unknown, {}> = defaultStore,

	options?: RenderOptions,
) =>
	render(ui, {
		wrapper: ({ children }) => (
			<Provider store={store}>
				<AllProviders>{children}</AllProviders>
			</Provider>
		),
		...options,
	});

export { customRender as render };

export const sdkMock = (fnToBeMocked: keyof typeof SDKService) => {
	const mock = jest.mocked(SDKService[fnToBeMocked], { shallow: true });
	return mock as jest.Mock<typeof mock>;
};
