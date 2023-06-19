import { render } from '../../../../test/index';
import en from '../../../../translations/en/grantKYC.json';
import GrantKyc from '..';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

const translations = en;

describe(`<${GrantKyc.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<GrantKyc />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<GrantKyc />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
	
	test('should handle GrantKyc', async () => {
		const component = render(<GrantKyc />);
		
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
