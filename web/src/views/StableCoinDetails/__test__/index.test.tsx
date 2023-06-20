import StableCoinDetails from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinDetails.json';
import { waitFor } from '@testing-library/react';

describe(`<${StableCoinDetails.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<StableCoinDetails />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<StableCoinDetails />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should has subtitle', async () => {
		const component = render(<StableCoinDetails />);

		await waitFor(() => {
			const subtitle = component.getByTestId('details-review-title');
			expect(subtitle).toHaveTextContent(translations.subtitle);
		});
	});

	test('details contains expiration timestamp', async () => {
		const component = render(<StableCoinDetails />);

		await waitFor(() => {
			const subtitle = component.getByTestId('details-review-title');
			expect(subtitle).toHaveTextContent(translations.subtitle);
			const expirationTimestamp = component.getByTestId('details-review-detail-10');
			expect(expirationTimestamp.getElementsByTagName('p').item(1)?.textContent).toBe(
				'Mon Jun 19 2023',
			);
		});
	});
});
