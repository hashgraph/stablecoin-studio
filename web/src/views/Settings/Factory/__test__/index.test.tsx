import { waitFor } from '@testing-library/dom';
import FactorySettings from '../';
import { render } from '../../../../test/index';
import translations from '../../../../translations/en/settings.json';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Network } from '@hashgraph-dev/stablecoin-npm-sdk';

const mockStore = configureMockStore();

describe(`<${FactorySettings.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<FactorySettings />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<FactorySettings />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should have buttons', async () => {
		const store = mockStore({
			wallet: {
				isProxyOwner: true,
				isFactoryProxyOwner: true,
			},
		});

		jest.mock('react-hook-form', () => ({
			...jest.requireActual('react-hook-form'),
			Controller: () => <></>,
			useForm: () => ({
				getValues: () => ({
					updateImplementation: '0.0.12345',
					updateOwner: '0.0.12345',
				}),
			}),
		}));

		jest.spyOn(Network, 'getFactoryAddress').mockReturnValue('0.0.12345');

		const component = render(<FactorySettings />, store);

		const stableCoin = await component.findByTestId('address-label');
		expect(stableCoin).toBeInTheDocument();
		expect(stableCoin).toBeEnabled();

		const addressButton = await component.findByTestId('update-implementation-address-button');
		expect(addressButton).toBeInTheDocument();
		expect(addressButton).toBeEnabled();
		await userEvent.click(addressButton);

		const ownerButton = await component.findByTestId('update-update-owner-button');
		expect(ownerButton).toBeInTheDocument();
		expect(ownerButton).toBeEnabled();
		await userEvent.click(ownerButton);
	});
});
