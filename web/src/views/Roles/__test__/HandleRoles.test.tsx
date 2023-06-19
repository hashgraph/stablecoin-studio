import userEvent from '@testing-library/user-event';
import HandleRoles from '../HandleRoles';
import { render } from '../../../test';
import { cashinLimitOptions, roleOptions } from '../constants';
import { act, waitFor } from '@testing-library/react';
import { RouterManager } from '../../../Router/RouterManager';
import configureMockStore from 'redux-mock-store';
import { mockedStableCoinCapabilities } from '../../../mocks/sdk.js';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
		goBack: jest.fn(),
	},
}));

const mockStore = configureMockStore();

const validAccount = '0.0.123456';

describe(`<${HandleRoles.name} />`, () => {
	test('should render correctly on giveRole action', () => {
		const component = render(<HandleRoles action='giveRole' />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render correctly on editRole action', () => {
		const component = render(<HandleRoles action='editRole' />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render correctly on revokeRole action', () => {
		const component = render(<HandleRoles action='revokeRole' />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render correctly on getAccountsWithRole action', () => {
		const component = render(<HandleRoles action='getAccountsWithRole' />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has disabled confirm button as default', async () => {
		const component = render(<HandleRoles action='giveRole' />);
		const confirmButton = component.getByTestId('confirm-btn');
		await waitFor(() => {
			expect(confirmButton).toBeDisabled();
		});
	});

	test('should enable confirm button after fill form correctly', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: { tokenId: validAccount },
				capabilities: mockedStableCoinCapabilities,
				data: {
					account: { id: validAccount },
					savedPairings: [
						{
							accountIds: ['0.0.123456'],
						},
					],
				},
			},
		});

		const component = render(<HandleRoles action='giveRole' />, store);

		const account = component.getByTestId('rol.0.accountId');
		await userEvent.type(account, validAccount);

		const option = component.getByText(roleOptions[0].label);
		await userEvent.click(option);

		const confirmButton = component.getByTestId('confirm-btn');

		await waitFor(() => {
			expect(confirmButton).not.toHaveAttribute('disabled');
			userEvent.click(confirmButton);
		});
	});

	test('cancel button should redirect to Roles view', async () => {
		const component = render(<HandleRoles action='giveRole' />);

		const anything = expect.any(Function);

		const cancelButton = component.getByTestId('cancel-btn');
		await userEvent.click(cancelButton);
		expect(RouterManager.goBack).toHaveBeenCalledWith(anything);
	});

	test('should render correctly on editRole', async () => {
		const component = render(<HandleRoles action='editRole' />);

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();
		await act(async () => userEvent.click(selector));

		const selectedItem = component.getByText(cashinLimitOptions[0].label);
		await act(async () => userEvent.click(selectedItem));

		const account = component.getByTestId('account');
		userEvent.type(account, '0.0.12345');

		const amount = component.getByTestId('amount');
		userEvent.type(amount, '1');

		const confirmButton = component.getByTestId('confirm-btn');
		userEvent.click(confirmButton);
	});

	test('should render correctly on getAccountsWithRole', async () => {
		const component = render(<HandleRoles action='getAccountsWithRole' />);

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();

		const confirmButton = component.getByTestId('confirm-btn');
		userEvent.click(confirmButton);

		await waitFor(() => {
			const confirmModalButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(confirmModalButton);
		});
	});
});
