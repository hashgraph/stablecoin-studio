import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../test';
import en from '../../../../../../translations/en/operations.json';
import { waitFor } from '@testing-library/react';
import { ReclaimOperationHold } from '..';

const translations = en;

describe(`<${ReclaimOperationHold.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ReclaimOperationHold />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<ReclaimOperationHold />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.hold.reclaim.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(
			translations.hold.reclaim.operationTitle,
		);
	});

	test('should enable confirm button when valid data is entered', async () => {
		const component = render(<ReclaimOperationHold />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const holdId = component.getByTestId('holdId');
		await userEvent.type(holdId, '1');

		const sourceId = component.getByTestId('sourceId');
		await userEvent.type(sourceId, '0.0.2');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});

	test('should handle reclaim hold operation', async () => {
		const component = render(<ReclaimOperationHold />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const holdId = component.getByTestId('holdId');
		await userEvent.type(holdId, '1');

		const sourceId = component.getByTestId('sourceId');
		await userEvent.type(sourceId, '0.0.2');

		await userEvent.click(button);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
