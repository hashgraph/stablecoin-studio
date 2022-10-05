import TopbarRight from '../TopbarRight';
import { render } from '../../../test/';
import en from '../../../translations/en/global.json';
import configureMockStore from 'redux-mock-store';

const translations = en.topbar;
const networkName = 'TESNET';
const accountId = '0.0.123';
const mockStore = configureMockStore();
const store = mockStore({
	wallet: {
		data: {
			savedPairings: [{ network: networkName, accountIds: [accountId] }],
			topic: '',
			pairingString: '',
			encryptionKey: '',
		},
	},
});
describe(`<${TopbarRight.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<TopbarRight />, store);

		const topbar = component.getByTestId('topbar-right');
		expect(topbar).toBeInTheDocument();
		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show network', () => {
		const component = render(<TopbarRight />, store);

		const network = component.getByTestId('topbar-right-network');
		expect(network).toBeInTheDocument();
		expect(network).toHaveTextContent(translations.network);
		expect(network).toHaveTextContent(networkName);
	});

	test('should show operating account', () => {
		const component = render(<TopbarRight />, store);

		const account = component.getByTestId('topbar-right-account');
		expect(account).toBeInTheDocument();
		expect(account).toHaveTextContent(translations.account);
		expect(account).toHaveTextContent(accountId);
	});
});
