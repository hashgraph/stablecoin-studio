import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { render } from '../../../../test/index';
import en from '../../../../translations/en/rescueHBAR.json';
import RescueHBAROperation from '..';

const translations = en;

describe(`<${RescueHBAROperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<RescueHBAROperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<RescueHBAROperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have an input to write the amount', () => {
		const component = render(<RescueHBAROperation />);

		expect(component.getByTestId('amount')).toBeInTheDocument();
	});

	test('should have a disabled confirm button that is enable when introduce valid data', async () => {
		const component = render(<RescueHBAROperation />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		userEvent.type(amount, '10000');

		await waitFor(
			() => {
				expect(button).toBeEnabled();
			},
			{ timeout: 5000 },
		);
	});

	test('should handle rescue hbars', async () => {
		const component = render(<RescueHBAROperation />);

		const confirmButton = component.getByTestId('confirm-btn');
		const amount = component.getByTestId('amount');
		userEvent.type(amount, '10000');

		await waitFor(
			() => {
				expect(confirmButton).toBeEnabled();
			},
			{ timeout: 5000 },
		);

		await userEvent.click(confirmButton);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);
	});
});
