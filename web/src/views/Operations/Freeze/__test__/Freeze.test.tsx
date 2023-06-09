import { render } from '../../../../test/index';
import en from '../../../../translations/en/freeze.json';
import Freeze from '..';

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
});
