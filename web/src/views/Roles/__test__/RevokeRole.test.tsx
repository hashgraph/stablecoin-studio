import userEvent from '@testing-library/user-event';
import RevokeRole from '../RevokeRole';
import { render } from '../../../test';
import { fakeOptions, fields } from '../constans';
import { waitFor } from '@testing-library/react';
import { RouterManager } from '../../../Router/RouterManager';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

const validAccount = '0.0.123456';

describe(`<${RevokeRole.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<RevokeRole />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has disabled confirm button as default', () => {
		const component = render(<RevokeRole />);

		const confirmButton = component.getByTestId('confirm-btn');
		expect(confirmButton).toHaveAttribute('disabled');
	});

	test('should enable confirm button after fill form correctly', async () => {
		const component = render(<RevokeRole />);

		const account = component.getByTestId(fields.account);
		userEvent.type(account, validAccount);

		const roles = component.getByTestId('select-placeholder');
		userEvent.click(roles);

		const option = component.getByText(fakeOptions[0].label);
		userEvent.click(option);

		expect(roles).not.toBeInTheDocument();

		const confirmButton = component.getByTestId('confirm-btn');

		await waitFor(() => {
			expect(confirmButton).not.toHaveAttribute('disabled');
			userEvent.click(confirmButton);
		});
	});

	test('cancel button should redirect to Roles view', () => {
		const component = render(<RevokeRole />);

		const anything = expect.any(Function);

		const cancelButton = component.getByTestId('cancel-btn');
		userEvent.click(cancelButton);
		expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
	});
});
