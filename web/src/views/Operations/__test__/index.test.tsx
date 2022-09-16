import { render } from '../../../test/index';
import Operations from '../index';
import translations from '../../../translations/en/operations.json';

describe(`<${Operations.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Operations />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('base-container-heading')).toHaveTextContent(translations.title);
		expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
	});

	test('should render cashin button', () => {
		const component = render(<Operations />);

		expect(component.getByTestId('direct-access-cashIn')).toHaveTextContent(
			translations.cashInOperation,
		);
	});
});
