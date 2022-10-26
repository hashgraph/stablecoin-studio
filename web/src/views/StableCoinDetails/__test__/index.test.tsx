import StableCoinDetails from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinDetails.json';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe(`<${StableCoinDetails.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<StableCoinDetails />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<StableCoinDetails />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should has subtitle', () => {
		const selectedStableCoin = {
			initialSupply: 0,
			tokenId: '0.0.48162226',
			totalSupply: 0,
			name: 'MIDAS',
			symbol: 'MD',
			decimals: 3,
			id: '0.0.48132286',
			maxSupply: '100000',
			treasuryId: '0.0.48160285',
			memo: 'Hedera Accelerator Stable Coin',
			adminKey: {
				key: 'key',
				type: 'ED25519',
			},
			freezeKey: {
				key: 'key',
				type: 'ED25519',
			},
			wipeKey: {
				id: '0.0.48160285',
			},
			supplyKey: {
				id: '0.0.48160285',
			},
		};

		const store = mockStore({
			wallet: {
				selectedStableCoin,
			},
		});

		const component = render(<StableCoinDetails />, store);
		const subtitle = component.getByTestId('details-review-title');

		expect(subtitle).toHaveTextContent(translations.subtitle);
	});
});
