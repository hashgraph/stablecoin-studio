/* eslint-disable @typescript-eslint/no-unused-vars */
import userEvent from '@testing-library/user-event';
import HandleRoles from '../HandleRoles';
import type { Action } from '../HandleRoles';
import en from '../../../translations/en/roles.json';
import { render } from '../../../test';
import { roleOptions, fields, actions } from '../constants';
import { waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { RouterManager } from '../../../Router/RouterManager';
import configureMockStore from 'redux-mock-store';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

const mockStore = configureMockStore();

const translations = en.giveRole;
const validAccount = '0.0.123456';

describe(`<${HandleRoles.name} />`, () => {
	test('should render correctly on all actions', () => {
		Object.keys(actions).forEach((action) => {
			const component = render(<HandleRoles action={action as Action} />);

			expect(component.asFragment()).toMatchSnapshot(action);
		});
	});

	test('should has disabled confirm button as default', () => {
		const component = render(<HandleRoles action='giveRole' />);

		const confirmButton = component.getByTestId('confirm-btn');
		expect(confirmButton).toHaveAttribute('disabled');
	});

	test('should enable confirm button after fill form correctly', async () => {
		const store = mockStore({
			wallet: {
				capabilities: ['Cash in'],
				data: {
					savedPairings: [
						{
							accountIds: ['0.0.123456'],
						},
					],
				},
			},
		});

		const component = render(<HandleRoles action='giveRole' />, store);

		const account = component.getByTestId(fields.account);
		userEvent.type(account, validAccount);

		const roles = component.getByTestId('select-placeholder');
		userEvent.click(roles);

		const option = component.getByText(roleOptions[0].label);
		userEvent.click(option);

		expect(roles).not.toBeInTheDocument();

		const confirmButton = component.getByTestId('confirm-btn');

		await waitFor(() => {
			expect(confirmButton).not.toHaveAttribute('disabled');
			userEvent.click(confirmButton);
		});
	});

	test('cancel button should redirect to Roles view', () => {
		const component = render(<HandleRoles action='giveRole' />);

		const anything = expect.any(Function);

		const cancelButton = component.getByTestId('cancel-btn');
		userEvent.click(cancelButton);
		expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
	});
});
