import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { render } from '../../../../test/index';
import en from '../../../../translations/en/cashOut.json';
import CashOutOperation from '../';

const translations = en;

describe(`<${CashOutOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CashOutOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CashOutOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have an input to write the amount', () => {
		const component = render(<CashOutOperation />);

		expect(component.getByTestId('amount')).toBeInTheDocument();
	});

	test('should have an input to write the destinationAccount', () => {
		const component = render(<CashOutOperation />);

		expect(component.getByTestId('originAccount')).toBeInTheDocument();
	});

	test('should have a disabled confirm button that is enable when introduce valid data', async () => {
		const component = render(<CashOutOperation />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		userEvent.type(amount, '10000');

		const account = component.getByTestId('originAccount');
		userEvent.type(account, '0.0.12345');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});
});
