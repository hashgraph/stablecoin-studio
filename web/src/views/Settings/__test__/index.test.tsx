import Settings from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/settings.json';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe(`<${Settings.name} />`, () => {
	beforeEach(() => { });

	test('should render correctly', () => {
		const component = render(<Settings />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Settings />);
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
				isProxyOwner: '0.0.12345'
			},
		});

		const component = render(<Settings />, store);
		const amountButton = await component.findByTestId('update-update-owner-button');
		expect(amountButton).toBeInTheDocument();
		expect(amountButton).toBeEnabled();
		await userEvent.click(amountButton);

		const addressButton = await component.findByTestId('update-implementation-address-button');
		expect(addressButton).toBeInTheDocument();
		expect(addressButton).toBeEnabled();
	});
});
