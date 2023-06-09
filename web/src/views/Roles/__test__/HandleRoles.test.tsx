import userEvent from '@testing-library/user-event';
import HandleRoles from '../HandleRoles';
import type { Action } from '../HandleRoles';
import { render } from '../../../test';
import { roleOptions, actions } from '../constants';
import { waitFor } from '@testing-library/react';
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
	test('should render correctly on all actions', () => {
		Object.keys(actions).forEach((action) => {
			const component = render(<HandleRoles action={action as Action} />);

			expect(component.asFragment()).toMatchSnapshot(action);
		});
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
});
