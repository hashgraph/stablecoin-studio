import type * as React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
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
import {
	mockedSelectedStableCoin,
	mockedSelectedStableCoinConfigInfo,
	mockedStableCoinsList,
	mockedWalletData,
	mockedStableCoinCapabilities,
} from '../mocks/sdk';
import { StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';

// Mock localStorage for mirrors
const mockMirrors = [
	{
		Environment: 'testnet',
		BASE_URL: 'https://testnet.mirrornode.hedera.com/api/v1/',
	},
];

// Setup localStorage before tests
if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'localStorage', {
		value: {
			getItem: jest.fn((key) => {
				if (key === 'SELECTED_MIRROR') {
					return JSON.stringify(mockMirrors);
				}
				return null;
			}),
			setItem: jest.fn(),
			removeItem: jest.fn(),
			clear: jest.fn(),
		},
		writable: true,
	});
}

const walletInitial = {
	...walletInitialState,
	data: mockedWalletData,
	selectedStableCoin: mockedSelectedStableCoin,
	selectedStableCoinConfigInfo: mockedSelectedStableCoinConfigInfo,
	stableCoinList: mockedStableCoinsList,
	accountInfo: mockedStableCoinCapabilities.account,
	roles: [StableCoinRole.DEFAULT_ADMIN_ROLE],
	network: 'testnet',
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
