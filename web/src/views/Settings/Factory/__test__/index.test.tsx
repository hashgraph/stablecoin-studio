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

	test('should have update owner and update implementation factory buttons', async () => {
		const store = mockStore({
			wallet: {
				isFactoryProxyOwner: true,
				isFactoryAcceptOwner: false,
				isFactoryPendingOwner: false,
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

		const ownerButton = await component.findByTestId('update-owner-button');
		expect(ownerButton).toBeInTheDocument();
		expect(ownerButton).toBeEnabled();
		await userEvent.click(ownerButton);
	});

	test('should have accept factory owner button', async () => {
		const store = mockStore({
			wallet: {
				isFactoryProxyOwner: false,
				isFactoryAcceptOwner: true,
				isFactoryPendingOwner: false,
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

		const acceptFactoryOwnerButton = await component.findByTestId('accept-factory-owner-button');
		expect(acceptFactoryOwnerButton).toBeInTheDocument();
		expect(acceptFactoryOwnerButton).toBeEnabled();
		await userEvent.click(acceptFactoryOwnerButton);
	});

	test('should have pending factory proxy owner buttons', async () => {
		const store = mockStore({
			wallet: {
				isFactoryProxyOwner: true,
				isFactoryAcceptOwner: false,
				isFactoryPendingOwner: true,
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

		const ownerButton = await component.findByTestId('update-owner-button');
		expect(ownerButton).toBeInTheDocument();
		expect(ownerButton).toBeEnabled();
		await userEvent.click(ownerButton);

		const cancelFactoryOwnerButton = await component.findByTestId('cancel-factory-owner-button');
		expect(cancelFactoryOwnerButton).toBeInTheDocument();
		expect(cancelFactoryOwnerButton).toBeEnabled();
		await userEvent.click(cancelFactoryOwnerButton);
	});
});
