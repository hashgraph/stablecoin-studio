import Roles from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/roles.json';

describe(`<${Roles.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Roles />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Roles />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should has subtitle', () => {
		const component = render(<Roles />);
		const subtitle = component.getByTestId('subtitle');

		expect(subtitle).toHaveTextContent(translations.subtitle);
	});

	test('should has direct accesses', () => {
		const component = render(<Roles />);

		const directAccesses = component.getAllByRole('button');
		expect(directAccesses).toHaveLength(3);
	});
});
