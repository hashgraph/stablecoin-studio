import { render } from '../../../../test/index';
import en from '../../../../translations/en/wipe.json';
import WipeOperation from '../';

const translations = en;

describe(`<${WipeOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<WipeOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<WipeOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
