import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import StableCoinCreation from '../StableCoinCreation';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import SDKService from '../../../services/SDKService';
import ContractId from '@hashgraph-dev/stablecoin-npm-sdk/build/esm/src/domain/context/contract/ContractId';
import { SupportedWallets } from '@hashgraph-dev/stablecoin-npm-sdk';
import { HederaId } from '@hashgraph-dev/stablecoin-npm-sdk/build/esm/src/domain/context/shared/HederaId';

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
				lastWallet: SupportedWallets.HASHPACK,
				factoryId: '0.0.12345',
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

		jest.mock('react-hook-form', () => ({
			...jest.requireActual('react-hook-form'),
			Controller: () => <></>,
			useForm: () => ({
				getValues: () => ({
					hederaTokenManagerId: '0.0.12345',
				}),
				watch: () => jest.fn(),
			}),
		}));

		const contractId: ContractId = new ContractId('0.0.1234');
		jest.spyOn(SDKService, 'getHederaTokenManagerList').mockResolvedValue([contractId]);

		const createResponse = {
			coin: { tokenId: new HederaId('0.0.12345') },
			reserve: { proxyAddress: new ContractId('0.0.1234') },
		};
		const createResponse2 = {};
		jest.spyOn(SDKService, 'createStableCoin').mockResolvedValue(createResponse);

		const component = render(<StableCoinCreation />, store);

		const noProof = component.getByTestId('no-proof-of-reserve-title');
		await waitFor(() => {
			expect(noProof).not.toBeInTheDocument();
		});

		//step 1
		const name = component.getByTestId('name');
		await userEvent.type(name, 'name');

		const symbol = component.getByTestId('symbol');
		await userEvent.type(symbol, 'symbol');

		const next1 = component.getByTestId('stepper-step-panel-button-primary-1');
		await userEvent.click(next1);

		//step 2
		await waitFor(() => {
			const initialSupply = component.getByTestId('initialSupply');
			userEvent.type(initialSupply, '1000');
		});

		const select = component.getByTestId('select-placeholder');
		await userEvent.click(select);

		const next = component.getByTestId('stepper-step-panel-button-primary-2');
		await userEvent.click(next);

		//step 3
		await waitFor(() => {
			const next = component.getByTestId('stepper-step-panel-button-primary-3');
			userEvent.click(next);
		});

		//step 4
		await waitFor(() => {
			const next = component.getByTestId('stepper-step-panel-button-primary-4');
			userEvent.click(next);
		});

		//step 5
		await waitFor(() => {
			const title = component.getByText('Stable coin review');
			userEvent.click(title);
		});

		const nextLast = component.getByTestId('stepper-step-panel-button-primary-5');
		await userEvent.click(nextLast);
	});
});
