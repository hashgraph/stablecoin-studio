import { render } from '../../../../test/index';
import en from '../../../../translations/en/unfreeze.json';
import Unfreeze from '..';

const translations = en;

describe(`<${Unfreeze.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Unfreeze />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<Unfreeze />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
