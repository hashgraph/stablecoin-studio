import { render } from '../../../../../../test';
import en from '../../../../../../translations/en/operations.json';
import { ListOperationHold } from '..';

const translations = en;

describe(`<${ListOperationHold.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ListOperationHold />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<ListOperationHold />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.hold.list.title);
	});
});
