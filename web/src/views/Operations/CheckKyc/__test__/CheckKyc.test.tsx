import { render } from '../../../../test/index';
import en from '../../../../translations/en/checkKyc.json';
import CheckKyc from '..';

const translations = en;

describe(`<${CheckKyc.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CheckKyc />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CheckKyc />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
