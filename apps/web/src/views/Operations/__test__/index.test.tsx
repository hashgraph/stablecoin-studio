import { render } from '../../../test/index';
import Operations from '../../../Router/index';
import translations from '../../../translations/en/operations.json';
import { waitFor } from '@testing-library/react';

describe(`<${Operations.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Operations />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('base-container-heading')).toHaveTextContent(translations.title);
			expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
		});
	});
});
