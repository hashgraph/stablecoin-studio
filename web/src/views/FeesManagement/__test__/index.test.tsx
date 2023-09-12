import FeesManagement from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/feesManagement.json';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { act, waitFor } from '@testing-library/react';
import { RequestFractionalFee, RequestFixedFee } from '@hashgraph/stablecoin-npm-sdk';

const mockStore = configureMockStore();

describe(`<${FeesManagement.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<FeesManagement />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<FeesManagement />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('can have a fixed fee collected in HBAR and with collector not exempt', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.1',
					customFees: [
						{
							amount: '1',
							collectorId: '0.0.123456',
							collectorsExempt: false,
							tokenIdCollected: '0.0.0',
						} as RequestFixedFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('can have a fixed fee collected in the same token and with collector exempt', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.1',
					customFees: [
						{
							amount: '1',
							collectorId: '0.0.123456',
							collectorsExempt: true,
							tokenIdCollected: '0.0.1',
						} as RequestFixedFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('can have a fixed fee collected in another token', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.1',
					customFees: [
						{
							amount: '1',
							collectorId: '0.0.123456',
							collectorsExempt: true,
							tokenIdCollected: '0.0.2',
						} as RequestFixedFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('can have a fractional fee paid by the sender and with collector not exempt', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					customFees: [
						{
							percentage: '1',
							amountNumerator: '1',
							amountDenominator: '1',
							min: '1',
							max: '2',
							net: true,
							collectorId: '0.0.123456',
							collectorsExempt: false,
						} as RequestFractionalFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('can have a fractional fee paid by the receiver and with collector exempt', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					customFees: [
						{
							percentage: '1',
							amountNumerator: '1',
							amountDenominator: '1',
							min: '1',
							max: '2',
							net: false,
							collectorId: '0.0.123456',
							collectorsExempt: true,
						} as RequestFractionalFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('trash button should be clicked to delete a fixed fee', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					feeScheduleKey: 'feeScheduleKey',
					customFees: [
						{
							amount: '1',
							collectorId: '0.0.123456',
							collectorsExempt: true,
							tokenIdCollected: '0.0.0',
						} as RequestFixedFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);

		const trashButton = component.getByTestId('trash-icon');
		await userEvent.click(trashButton);
	});

	test('trash button should be clicked to delete a fractional fee', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					feeScheduleKey: 'feeScheduleKey',
					customFees: [
						{
							percentage: '1',
							amountNumerator: '1',
							amountDenominator: '1',
							min: '1',
							max: '2',
							net: true,
							collectorId: '0.0.123456',
							collectorsExempt: true,
						} as RequestFractionalFee,
					],
				},
			},
		});
		const component = render(<FeesManagement />, store);

		const trashButton = component.getByTestId('trash-icon');
		await userEvent.click(trashButton);
	});

	test('should allow adding a new fixed fee', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					feeScheduleKey: 'feeScheduleKey',
				},
			},
		});

		const component = render(<FeesManagement />, store);

		const addButton = component.getByTestId('add-btn');
		expect(addButton).toBeEnabled();
		await userEvent.click(addButton);

		const feeTypeSelectedItem = component.getByText('Fixed');
		await act(async () => userEvent.click(feeTypeSelectedItem));

		const amount = component.getByTestId('fees.0.amountOrPercentage');
		await userEvent.type(amount, '1');

		const feeTypeSelector = component.getAllByRole('combobox')[1];
		await act(async () => userEvent.click(feeTypeSelector));
		const option = component.getByText('HBAR');
		userEvent.click(option);

		const collectorAccount = component.getByTestId('fees.0.collectorAccount');
		userEvent.type(collectorAccount, '0.0.123456');

		const saveButton = component.getByTestId('save-btn');
		await waitFor(() => {
			expect(saveButton).toBeEnabled();
		});

		await act(async () => userEvent.click(saveButton));
	});

	test('should allow adding a new fractional fee', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					feeScheduleKey: 'feeScheduleKey',
				},
			},
		});

		const component = render(<FeesManagement />, store);

		const addButton = component.getByTestId('add-btn');
		expect(addButton).toBeEnabled();
		await userEvent.click(addButton);

		const feeTypeSelector = component.getAllByRole('combobox')[0];
		await act(async () => userEvent.click(feeTypeSelector));
		const feeTypeSelectedItem = component.getByText('Fractional');
		await act(async () => userEvent.click(feeTypeSelectedItem));

		const amount = component.getByTestId('fees.0.amountOrPercentage');
		await userEvent.type(amount, '1');

		const min = component.getByTestId('fees.0.min');
		await userEvent.type(min, '0');

		const max = component.getByTestId('fees.0.max');
		await userEvent.type(max, '0');

		const collectorAccount = component.getByTestId('fees.0.collectorAccount');
		await userEvent.type(collectorAccount, '0.0.123456');

		const collectorsExemptSelectedItem = component.getByText('True');
		await act(async () => userEvent.click(collectorsExemptSelectedItem));

		const collectorsExemptSelector = component.getAllByRole('combobox')[6];
		await act(async () => userEvent.click(collectorsExemptSelector));

		const payerSelectedItem = component.getAllByText('Sender')[0];
		await act(async () => userEvent.click(payerSelectedItem));

		const saveButton = component.getByTestId('save-btn');
		await waitFor(() => {
			expect(saveButton).not.toHaveAttribute('disabled');
		});

		await act(async () => userEvent.click(saveButton));
	});
});
