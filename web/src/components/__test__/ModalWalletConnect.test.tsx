import { render } from '../../test/index';
import ModalWalletConnect from '../ModalWalletConnect';
import translations from '../../translations/en/global.json';
import configureMockStore from 'redux-mock-store';
import { SupportedWallets } from '@hashgraph-dev/stablecoin-npm-sdk';
import userEvent from '@testing-library/user-event';
import SDKService from '../../services/SDKService';

const mockStore = configureMockStore();

describe(`<${ModalWalletConnect.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ModalWalletConnect />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<ModalWalletConnect />);

		const title = component.getByTestId('title');

		expect(title).toHaveTextContent(translations.walletActions.selectWallet);
	});

	test('should has wallets and is clicked', async () => {
		const store = mockStore({
			wallet: {
				foundWallets: [SupportedWallets.HASHPACK, SupportedWallets.METAMASK],
			},
		});
		const component = render(<ModalWalletConnect />, store);

		const metamask = component.getByTestId('Metamask');
		await userEvent.click(metamask);

		expect(SDKService.connectWallet).toHaveBeenCalledWith('Metamask', expect.any(String));
	});
});
