import Sidebar from '../Sidebar';
import { render } from '../../../test';

describe(`<${Sidebar.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Sidebar />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render options', () => {
		const component = render(<Sidebar />);
		const options = ['Coin', 'Users', 'Gear'];

		options.forEach((option) => {
			const element = component.getByTestId(`sidebar-option-${option}`);
			expect(element).toBeInTheDocument();
		});
	});
});
