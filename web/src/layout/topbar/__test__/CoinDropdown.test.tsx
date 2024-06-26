import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockedStableCoinCapabilities, mockedStableCoinsList } from '../../../mocks/sdk';
import configureMockStore from 'redux-mock-store';

jest.mock('react-select', () =>
	// eslint-disable-next-line react/display-name
	({ name, options, value, onChange, onBlurAux, placeholder }: any) => {
		function handleChange(event: any) {
			const option = options.find((option: any) => option.value === event.currentTarget.value);

			onChange(option);
		}

		return (
			<>
				<span data-testid='select-placeholder'>{placeholder} </span>
				<select
					data-testid={`select-${name}`}
					value={value}
					onChange={handleChange}
					onBlur={onBlurAux}
				>
					{options.map(({ label, value }: any) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</>
		);
	},
);

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
		getUrl: () => '/stable-coin-not-selected',
	},
}));

describe(`<${CoinDropdown.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CoinDropdown />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show all stablecoins', async () => {
		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-placeholder');
		userEvent.click(select);
		const coinId = mockedStableCoinsList.coins[0].id;
		const coinSymbol = mockedStableCoinsList.coins[0].symbol;

		await waitFor(() => {
			const elementsContainingId = component.queryAllByText((content, element) =>
				content.includes(coinId),
			);
			const elementsContainingSymbol = component.queryAllByText((content, element) =>
				content.includes(coinSymbol),
			);

			expect(elementsContainingId.length).toBeGreaterThan(0);
			expect(elementsContainingSymbol.length).toBeGreaterThan(0);
		});
	});

	// TODO: FIX THIS TEST  Unable to find an element with the text: 0.0.123 - HBAR. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
	test('should be able to choose click', async () => {
		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-placeholder');
		userEvent.click(select);
		const coinLabel = `${mockedStableCoinsList.coins[0].id} - ${mockedStableCoinsList.coins[0].symbol}`;

		await waitFor(async () => {
			const option = component.getByText(coinLabel);
			await userEvent.click(option);

			waitFor(() => {
				expect((select as HTMLInputElement).value).toEqual(mockedStableCoinsList.coins[0].id);
			});
		});
	});

	// TODO: FIX THIS TEST     Timed out in waitFor.
	test('should be able to choose one coin', async () => {
		const mockStore = configureMockStore();
		const store = mockStore({
			wallet: {
				accountInfo: { id: '0.0.12345' },
				selectedStableCoin: {
					tokenId: mockedStableCoinsList.coins[0].id,
					symbol: mockedStableCoinsList.coins[0].symbol,
				},
				capabilities: mockedStableCoinCapabilities,
				data: {
					savedPairings: [
						{
							accountIds: ['0.0.123456'],
						},
					],
				},
			},
		});

		const component = render(<CoinDropdown />, store);

		const select = component.getByTestId('select-placeholder');
		userEvent.click(select);
		const coinLabel = `${mockedStableCoinsList.coins[0].id} - ${mockedStableCoinsList.coins[0].symbol}`;

		await waitFor(async () => {
			const option = component.getByText(coinLabel);
			await userEvent.click(option);

			waitFor(() => {
				expect((select as HTMLInputElement).value).toEqual(mockedStableCoinsList.coins[0].id);
			});
		});
	});
});
