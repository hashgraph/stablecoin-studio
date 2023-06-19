import { waitFor } from '@testing-library/dom';
import StableCoinSettings from '../';
import { render } from '../../../../test/index';
import translations from '../../../../translations/en/settings.json';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe(`<${StableCoinSettings.name} />`, () => {
	beforeEach(() => { });

	test('should render correctly', () => {
		const component = render(<StableCoinSettings />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<StableCoinSettings />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should have buttons', async () => {
		const selectedStableCoin = {
			initialSupply: 10,
			tokenId: '0.0.12345',
			proxyAdminAddress: '0.0.12345',
			reserveAmount: '10',
		};

		const store = mockStore({
			wallet: {
				selectedStableCoin,
				isProxyOwner: true,
				isFactoryProxyOwner: false
			},
		});

		const component = render(<StableCoinSettings />, store);

		const updateOwner = await component.findByTestId('updateOwner');
		expect(updateOwner).toBeInTheDocument();
		userEvent.type(updateOwner, '0.0.123456');

		const amountButton = await component.findByTestId('update-update-owner-button');
		expect(amountButton).toBeInTheDocument();
		expect(amountButton).toBeEnabled();
		await userEvent.click(amountButton);

		const addressButton = await component.findByTestId('update-implementation-address-button');
		expect(addressButton).toBeInTheDocument();
		expect(addressButton).toBeEnabled();
	});
});
