import { render } from '../../../../test/index';
import translations from '../../../../translations/en/getBalance.json';
import GetBalanceOperation from '../';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

describe(`<${GetBalanceOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<GetBalanceOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<GetBalanceOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have an input to write the account', () => {
		const component = render(<GetBalanceOperation />);

		expect(component.getByTestId('account')).toBeInTheDocument();
	});

	test('should has an disabled confirm button that is enable when introduce an account', async () => {
		const component = render(<GetBalanceOperation />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const account = component.getByTestId('account');
		userEvent.type(account, '0.0.12345');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});
});
