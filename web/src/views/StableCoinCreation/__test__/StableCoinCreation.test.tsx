import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import StableCoinCreation from '../StableCoinCreation';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

describe(`<${StableCoinCreation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<StableCoinCreation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<StableCoinCreation />);

		const header = component.getByTestId('creation-title');
		expect(header).toHaveTextContent(translations.common.createNewStableCoin);
	});

	test('should has subtitle', () => {
		const component = render(<StableCoinCreation />);

		const subtitle = component.getByTestId('creation-subtitle');
		expect(subtitle).toHaveTextContent(translations.common.factoryId);
	});

	test('should have options', async () => {
		const mockStore = configureMockStore();
		const store = mockStore({
			wallet: {
				factoryId: 'factoryId',
				accountInfo: {
					id: '0.0.12345',
				},
				data: {
					account: {
						id: '0.0.12345',
					},
				},
			},
		});

		const component = render(<StableCoinCreation />, store);

		const noProof = component.getByTestId('no-proof-of-reserve-title');
		await waitFor(() => {
			expect(noProof).not.toBeInTheDocument();
		});

		const next = component.getByTestId('stepper-step-panel-button-primary-15');
		await userEvent.click(next);
	});
});
