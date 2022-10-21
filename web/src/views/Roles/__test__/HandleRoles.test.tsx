import userEvent from '@testing-library/user-event';
import HandleRoles from '../HandleRoles';
import type { Action } from '../HandleRoles';
import en from '../../../translations/en/roles.json';
import { render } from '../../../test';
import { roleOptions, fields, actions } from '../constants';
import { waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { RouterManager } from '../../../Router/RouterManager';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

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
		const component = render(<HandleRoles action='giveRole' />);

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

	describe('Supplier role', () => {
		const fillInitialForm = (component: RenderResult) => {
			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const roles = component.getByTestId('select-placeholder');
			userEvent.click(roles);

			const option = component.getByText('Supplier');
			userEvent.click(option);
		};

		test('should render children', async () => {
			const component = render(<HandleRoles action='giveRole' />);

			fillInitialForm(component);

			const supplerQuantity = component.getByTestId('supplier-quantity');
			expect(supplerQuantity).toBeInTheDocument();
			expect(supplerQuantity).toHaveTextContent(translations.supplierQuantityQuestion);
			expect(supplerQuantity).toHaveTextContent(translations.switchLabel);

			const switchComponent = component.getByTestId('switch');
			expect(switchComponent).toBeInTheDocument();

			const inputQuantity = component.queryByTestId('input-supplier-quantity');
			expect(inputQuantity).not.toBeInTheDocument();

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});

			expect(component.asFragment()).toMatchSnapshot('giveSupplierRole');
		});

		test('should be selected Infinity token quantity by default', () => {
			const component = render(<HandleRoles action='giveRole' />);

			fillInitialForm(component);

			const switchComponent = component.getByTestId('switch');
			expect(switchComponent).toHaveAttribute('aria-checked', 'true');
		});

		test('if set switch off then user should fill token quantity field', async () => {
			const component = render(<HandleRoles action='giveRole' />);

			fillInitialForm(component);

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
			});

			const switchComponent = component.getByTestId('switch');
			userEvent.click(switchComponent);

			await waitFor(() => {
				expect(switchComponent).toHaveAttribute('aria-checked', 'false');

				expect(confirmButton).toHaveAttribute('disabled');
			});

			const inputQuantity = component.getByTestId('input-supplier-quantity');
			expect(inputQuantity).toBeInTheDocument();
			userEvent.type(inputQuantity, '12345');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
			});
		});
	});
});
