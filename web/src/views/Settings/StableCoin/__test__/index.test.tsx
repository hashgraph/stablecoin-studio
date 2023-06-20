import StableCoinSettings from '../';
import { render } from '../../../../test/index';
import translations from '../../../../translations/en/settings.json';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { act } from '@testing-library/react';

const mockStore = configureMockStore();

describe(`<${StableCoinSettings.name} />`, () => {
	beforeEach(() => {});

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
		const store = mockStore({
			wallet: {
				isProxyOwner: true,
				isFactoryProxyOwner: true,
				selectedStableCoin: {
					tokenId: '0.0.1',
					proxyAdminAddress: '0.0.2',
				},
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

		const component = render(<StableCoinSettings />, store);

		const stableCoin = await component.findByTestId('address-label');
		expect(stableCoin).toBeInTheDocument();
		expect(stableCoin).toBeEnabled();

		const selector = await component.getByRole('combobox');
		await act(async () => {
			userEvent.click(selector);
			await userEvent.type(selector, '0.0.13579');
		});

		// const createNewOption = component.getByText("Create '0.0.13579'");
		// userEvent.click(createNewOption);

		const addressButton = await component.findByTestId('update-implementation-address-button');
		expect(addressButton).toBeInTheDocument();
		expect(addressButton).toBeEnabled();
		// await userEvent.click(addressButton);

		const newOwner = component.getByTestId('updateOwner');
		await userEvent.type(newOwner, '0.0.02468');

		const ownerButton = await component.findByTestId('update-owner-button');
		expect(ownerButton).toBeInTheDocument();
		expect(ownerButton).toBeEnabled();
		await userEvent.click(ownerButton);
	});
});
