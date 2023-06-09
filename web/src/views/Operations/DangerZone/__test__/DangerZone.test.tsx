import { render } from '../../../../test/index';
import en from '../../../../translations/en/operations.json';
import DangerZone from '..';

const translations = en;

describe(`<${DangerZone.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<DangerZone />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<DangerZone />);

		expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
	});
});
