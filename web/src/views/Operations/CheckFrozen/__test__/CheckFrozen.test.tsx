import { render } from '../../../../test/index';
import en from '../../../../translations/en/checkFrozen.json';
import CheckFrozen from '..';

const translations = en;

describe(`<${CheckFrozen.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CheckFrozen />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CheckFrozen />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
