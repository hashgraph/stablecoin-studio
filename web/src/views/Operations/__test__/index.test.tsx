import { render } from '../../../test/index';
import Operations from '../index';
import translations from '../../../translations/en/operations.json';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe(`<${Operations.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Operations />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('base-container-heading')).toHaveTextContent(translations.title);
		expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
	});

	test('should render cashin button', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('direct-access-cashIn')).toHaveTextContent(
			translations.cashInOperation,
		);
	});

	test('should render wipe button', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('direct-access-wipe')).toHaveTextContent(
			translations.wipeOperation,
		);
	});

	test('should render rescue button', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('direct-access-rescue')).toHaveTextContent(
			translations.rescueOperation,
		);
	});

	test('should render burn button', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('direct-access-burn')).toHaveTextContent(
			translations.burnOperation,
		);
	});

	describe('should enable/disable operations depending on selected coin keys', () => {
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
		test('should enable cash in', async () => {
			const store = mockStore({
				wallet: {
					data: {
						selectedStableCoin,
					},
				},
			});

			const component = render(<Operations />, store);

			expect(component.getByTestId('direct-access-cashIn')).toBeEnabled();
		});
		test.todo('rest of the tests');
	});
});
