import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import SDKService from '../../../services/SDKService';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getStableCoinsFull } from '../../../mocks/sdk';

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

describe(`<${CoinDropdown.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CoinDropdown />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show all stable coins', async () => {
		jest.mocked(SDKService.getStableCoins, true).mockResolvedValueOnce(getStableCoinsFull);

		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-coin-dropdown');
		userEvent.click(select);
		const coinLabel = `${getStableCoinsFull[0].id} - ${getStableCoinsFull[0].symbol}`;

		await waitFor(() => {
			expect(component.getByText(coinLabel)).toBeInTheDocument();
		});
	});
	test('should be able to choose one coin', async () => {
		jest.mocked(SDKService.getStableCoins, true).mockResolvedValueOnce(getStableCoinsFull);

		const component = render(<CoinDropdown />);

		const select = component.getByTestId('select-coin-dropdown');
		userEvent.click(select);

		await waitFor(() => {
			const coinLabel = `${getStableCoinsFull[0].id} - ${getStableCoinsFull[0].symbol}`;
			const option = component.getByText(coinLabel);
			// const option = component.getByRole('button', { name: coinLabel });

			userEvent.click(option);
			expect((select as HTMLInputElement).value).toEqual(getStableCoinsFull[0].id);
		});
	});
});
