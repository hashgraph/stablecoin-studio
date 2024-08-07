import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	mockedSelectedStableCoin,
	mockedStableCoinCapabilities,
	mockedStableCoinsList,
} from '../../../mocks/sdk';
import configureMockStore from 'redux-mock-store';

// TODO: review this mock, it's not working
// jest.mock('react-select', () => {
// 	// eslint-disable-next-line react/display-name
// 	return ({ name, options, value, onChange, onBlurAux, placeholder }: any) => {
// 		function handleChange(event: any) {
// 			const option = options.find((option: any) => option.value === event.currentTarget.value);
// 			onChange(option);
// 		}
//
// 		// console.log('React Select Mock:', { name, options, value, placeholder });
//
// 		return (
// 			<>
// 				<span data-testid='select-placeholder'>{placeholder}</span>
// 				<select
// 					data-testid={`select-${name}`}
// 					value={value}
// 					onChange={handleChange}
// 					onBlur={onBlurAux}
// 				>
// 					{options.map(({ label, value }: any) => (
// 						<option key={value} value={value}>
// 							{label}
// 						</option>
// 					))}
// 				</select>
// 			</>
// 		);
// 	};
// });

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

	test('should be able to choose click', async () => {
		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-placeholder');
		// component.debug(select, Infinity);
		await act(async () => userEvent.click(select));

		const coinLabel = `${mockedSelectedStableCoin.tokenId} - ${mockedSelectedStableCoin.symbol}`;

		await waitFor(
			() => {
				expect(component.queryByText(coinLabel)).toBeInTheDocument();
			},
			{ timeout: 5000 },
		);
	});

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
		await act(async () => userEvent.click(select));
		const coinLabel = `${mockedStableCoinsList.coins[0].id} - ${mockedStableCoinsList.coins[0].symbol}`;

		await act(async () => {
			const option = await waitFor(() => component.getByText(coinLabel));
			await act(async () => userEvent.click(option));
		});
		// component.debug(select, Infinity);

		await waitFor(() => {
			expect(select).toHaveTextContent(coinLabel);
		});
	});
});
