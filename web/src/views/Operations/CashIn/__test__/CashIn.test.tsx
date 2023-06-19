import { render } from '../../../../test/index';
import en from '../../../../translations/en/cashIn.json';
import CashInOperation from '../';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

const translations = en;

describe(`<${CashInOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CashInOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have an input to write the amount', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('amount')).toBeInTheDocument();
	});

	test('should have an input to write the destinationAccount', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('destinationAccount')).toBeInTheDocument();
	});

	test('should have a disabled confirm button that is enable when introduce valid data', async () => {
		const component = render(<CashInOperation />);

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

	test('should handle cash in', async () => {
		const component = render(<CashInOperation />);

		const amount = component.getByTestId('amount');
		await userEvent.type(amount, '10');

		const account = component.getByTestId('destinationAccount');
		await userEvent.type(account, '0.0.123456');

		const confirmButton = component.getByTestId('confirm-btn');
		await userEvent.click(confirmButton);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
