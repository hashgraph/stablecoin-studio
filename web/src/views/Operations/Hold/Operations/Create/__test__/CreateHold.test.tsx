import userEvent from '@testing-library/user-event';
import { CreateOperationHold } from '..';
import { render } from '../../../../../../test';
import en from '../../../../../../translations/en/operations.json';
import { waitFor } from '@testing-library/react';

const translations = en;

describe(`<${CreateOperationHold.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CreateOperationHold />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CreateOperationHold />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.hold.create.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(
			translations.hold.create.operationTitle,
		);
	});

	test('should have a disabled confirm button that is enable when introduce valid data', async () => {
		const component = render(<CreateOperationHold />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '10000');
		const inputDatePicker = component.getByPlaceholderText(
			translations.hold.create.expirationDatePlaceholder,
		);
		await userEvent.type(inputDatePicker, '01/01/2100');
		const escrow = component.getByTestId('escrow');
		await userEvent.type(escrow, '0.0.1');
		const targetId = component.getByTestId('target');
		await userEvent.type(targetId, '0.0.2');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});

	test('should handle create hold operation', async () => {
		const component = render(<CreateOperationHold />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '10000');
		const inputDatePicker = component.getByPlaceholderText(
			translations.hold.create.expirationDatePlaceholder,
		);
		await userEvent.type(inputDatePicker, '01/01/2100');
		const escrow = component.getByTestId('escrow');
		await userEvent.type(escrow, '0.0.1');
		const targetId = component.getByTestId('target');
		await userEvent.type(targetId, '0.0.2');

		await userEvent.click(button);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
