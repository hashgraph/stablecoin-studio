import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getStableCoinsFull } from '../../../mocks/sdk';
import { Provider } from 'react-redux';
import type { MockStoreEnhanced } from 'redux-mock-store';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { RouterManager } from '../../../Router/RouterManager';
import { NamedRoutes } from '../../../Router/NamedRoutes';

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
	},
}));
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const defaultStore = mockStore({
	wallet: {
		stableCoinList: getStableCoinsFull,
	},
});

let localStore: MockStoreEnhanced<unknown, {}>;
describe(`<${CoinDropdown.name} />`, () => {
	const factoryComponent = ({
		store = defaultStore,
	}: {
		store?: MockStoreEnhanced<unknown, {}>;
	} = {}) => {
		localStore = store;
		return render(
			<Provider store={localStore}>
				<CoinDropdown />
			</Provider>,
		);
	};

	test('should render correctly', () => {
		const component = factoryComponent();

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show all stable coins', async () => {
		const component = factoryComponent();

		const select = component.getByTestId('select-coin-dropdown');
		userEvent.click(select);
		const coinLabel = `${getStableCoinsFull[0].id} - ${getStableCoinsFull[0].symbol}`;

		await waitFor(() => {
			expect(component.getByText(coinLabel)).toBeInTheDocument();
		});
	});

	test('should be able to choose one coin', async () => {
		const component = factoryComponent();

		const select = component.getByTestId('select-coin-dropdown');
		userEvent.click(select);

		await waitFor(() => {
			const coinLabel = `${getStableCoinsFull[0].id} - ${getStableCoinsFull[0].symbol}`;
			const option = component.getByText(coinLabel);

			userEvent.click(option);
			expect((select as HTMLInputElement).value).toEqual(getStableCoinsFull[0].id);
		});
		// TODO: validate onchange fn
	});

	test('should go to StableCoinNotSelected if coin isnt selected ', async () => {
		const store = mockStore({
			wallet: {},
		});
		const anything = expect.any(Function);

		factoryComponent({ store });

		await waitFor(() => {
			expect(RouterManager.to).toHaveBeenCalledWith(anything, NamedRoutes.StableCoinNotSelected);
		});
	});
});
