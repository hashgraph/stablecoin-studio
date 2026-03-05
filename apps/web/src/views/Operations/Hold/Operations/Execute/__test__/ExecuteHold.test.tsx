import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../test';
import en from '../../../../../../translations/en/operations.json';
import { waitFor } from '@testing-library/react';
import { ExecuteOperationHold } from '..';

const translations = en;

describe(`<${ExecuteOperationHold.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ExecuteOperationHold />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<ExecuteOperationHold />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.hold.execute.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(
			translations.hold.execute.operationTitle,
		);
	});

	test('should enable confirm button when valid data is entered', async () => {
		const component = render(<ExecuteOperationHold />);
		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '10000');

		const holdId = component.getByTestId('holdId');
		await userEvent.type(holdId, '1');

		const targetId = component.getByTestId('targetId');
		await userEvent.type(targetId, '0.0.1');

		const sourceId = component.getByTestId('sourceId');
		await userEvent.type(sourceId, '0.0.2');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});

	test('should handle execute hold operation', async () => {
		const component = render(<ExecuteOperationHold />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '10000');

		const holdId = component.getByTestId('holdId');
		await userEvent.type(holdId, '1');

		const targetId = component.getByTestId('targetId');
		await userEvent.type(targetId, '0.0.1');

		const sourceId = component.getByTestId('sourceId');
		await userEvent.type(sourceId, '0.0.2');

		await userEvent.click(button);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
