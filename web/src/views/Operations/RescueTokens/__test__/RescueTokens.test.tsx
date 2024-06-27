import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { render } from '../../../../test/index';
import en from '../../../../translations/en/rescueTokens.json';
import RescueTokensOperation from '..';

const translations = en;

describe(`<${RescueTokensOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<RescueTokensOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<RescueTokensOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});

	test('should have an input to write the amount', () => {
		const component = render(<RescueTokensOperation />);

		expect(component.getByTestId('amount')).toBeInTheDocument();
	});

	test('should have a disabled confirm button that is enabled when valid data is introduced', async () => {
		const component = render(<RescueTokensOperation />);

		const button = component.getByTestId('confirm-btn');
		expect(button).toBeDisabled();

		const amount = component.getByTestId('amount');
		userEvent.type(amount, '10000');

		await waitFor(() => {
			expect(button).toBeEnabled();
		});
	});

	test('should handle rescue tokens', async () => {
		const component = render(<RescueTokensOperation />);

		const confirmButton = component.getByTestId('confirm-btn');
		const amount = component.getByTestId('amount');
		userEvent.type(amount, '10000');

		await waitFor(() => {
			expect(confirmButton).toBeEnabled();
		});

		userEvent.click(confirmButton);

		const confirmModalButton = await component.findByTestId('modal-action-confirm-button');
		userEvent.click(confirmModalButton);

		await waitFor(() => {
			expect(
				component.getByText((content, element) => {
					// @ts-ignore
					const hasText = (text) => element.textContent.includes(text);
					const elementHasText = hasText('You have rescued');
					// @ts-ignore
					const childrenDontHaveText = Array.from(element.children).every(
						(child) => !hasText(child.textContent),
					);
					return elementHasText && childrenDontHaveText;
				}),
			).toBeInTheDocument();
		});
	});
});
