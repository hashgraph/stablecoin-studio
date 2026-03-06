import { render, sdkMock } from '../../../test/index';
import translations from '../../../translations/en/proofOfReserve.json';
import configureMockStore from 'redux-mock-store';
import StableCoinProof from '../';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockStore = configureMockStore();

describe(`<${StableCoinProof.name} />`, () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should render correctly', () => {
		const component = render(<StableCoinProof />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should have a title', () => {
		const component = render(<StableCoinProof />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should have buttons', async () => {
		const selectedStableCoin = {
			initialSupply: 0,
			tokenId: '0.0.48162226',
			totalSupply: 0,
			name: 'MIDAS',
			symbol: 'MD',
			decimals: 3,
			id: '0.0.48132286',
			maxSupply: '100000',
			treasuryId: '0.0.48160285',
			memo: 'Hedera Accelerator Stablecoin',
			adminKey: {
				key: 'key',
				type: 'ED25519',
			},
			freezeKey: {
				key: 'key',
				type: 'ED25519',
			},
			kycKey: {
				key: 'key',
				type: 'ED25519',
			},
			wipeKey: {
				id: '0.0.48160285',
			},
			supplyKey: {
				id: '0.0.48160285',
			},
			reserveAddress: '0.0.444',
			reserveAmount: '0',
		};

		jest.mock('react-hook-form', () => ({
			...jest.requireActual('react-hook-form'),
			Controller: () => <></>,
			useForm: () => ({
				getValues: () => ({
					reserveAddress: '0.0.444',
					reserveAmount: '0',
				}),
			}),
		}));
		const store = mockStore({
			wallet: {
				selectedStableCoin,
			},
		});

		const getAddressMock = sdkMock('getReserveAddress');
		const getAmountMock = sdkMock('getReserveAmount');

		getAddressMock.mockReturnValueOnce('0.0.444');
		getAmountMock.mockReturnValueOnce('0');

		render(<StableCoinProof />, store);
		const amountButton = await screen.findByTestId('update-reserve-amount-button');
		expect(amountButton).toBeInTheDocument();
		expect(amountButton).toBeEnabled();
		await userEvent.click(amountButton);

		const addressButton = await screen.findByTestId('update-reserve-address-button');
		expect(addressButton).toBeInTheDocument();
		expect(addressButton).toBeEnabled();
		await userEvent.click(addressButton);
	});
});
