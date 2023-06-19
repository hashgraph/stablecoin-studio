import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockedStableCoinsList } from '../../../mocks/sdk';

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

	test('should show all stable coins', async () => {
		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-placeholder');
		userEvent.click(select);
		const coinLabel = `${mockedStableCoinsList.coins[0].id} - ${mockedStableCoinsList.coins[0].symbol}`;

		await waitFor(() => {
			expect(component.getByText(coinLabel)).toBeInTheDocument();
		});
	});

	test('should be able to choose one coin', async () => {
		const component = render(<CoinDropdown />);

		let select = component.getByTestId('select-placeholder');
		userEvent.click(select);
		const coinLabel = `${mockedStableCoinsList.coins[0].id} - ${mockedStableCoinsList.coins[0].symbol}`;

		await waitFor(() => {
			const option = component.getByText(coinLabel);
			userEvent.click(option);

			waitFor(() => {
				expect((select as HTMLInputElement).value).toEqual(mockedStableCoinsList.coins[0].id);
			});
		});
	});
});
