import TopbarRight from '../TopbarRight';
import { render } from '../../../test/';
import configureMockStore from 'redux-mock-store';

const networkName = 'testnet';
const mockStore = configureMockStore();
const store = mockStore({
	wallet: {
		data: {
			savedPairings: [{ network: networkName, accountIds: [] }],
			topic: '',
			pairingString: '',
			encryptionKey: '',
		},
		network: networkName
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
		expect(network).toHaveTextContent(networkName);
	});

	test('should show operating account', () => {
		const component = render(<TopbarRight />, store);

		const account = component.getByTestId('topbar-right-account');
		expect(account).toBeInTheDocument();
	});
});
