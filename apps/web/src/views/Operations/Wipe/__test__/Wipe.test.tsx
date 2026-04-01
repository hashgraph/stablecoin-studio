import { render } from '../../../../test/index';
import en from '../../../../translations/en/wipe.json';
import WipeOperation from '../';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

const translations = en;

describe(`<${WipeOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<WipeOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<WipeOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have a disabled confirm button that is enable when introduce valid data', async () => {
		const component = render(<WipeOperation />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '1');

		const account = component.getByTestId('destinationAccount');
		await userEvent.type(account, '0.0.123456');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});

	test('should handle wipe', async () => {
		const component = render(<WipeOperation />);

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '1');

		const account = component.getByTestId('destinationAccount');
		await userEvent.type(account, '0.0.123456');

		const confirmButton = component.getByTestId('confirm-btn');
		await userEvent.click(confirmButton);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
