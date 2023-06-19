import { render } from '../../../../test/index';
import en from '../../../../translations/en/freeze.json';
import Freeze from '..';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

const translations = en;

describe(`<${Freeze.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Freeze />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<Freeze />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should handle freeze', async () => {
		const component = render(<Freeze />);

		const account = component.getByTestId('targetAccount');
		await userEvent.type(account, '0.0.123456');

		const confirmButton = component.getByTestId('confirm-btn');
		userEvent.click(confirmButton);

		await waitFor(() => {
			const confirmModalButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(confirmModalButton);
		});
	});
});
