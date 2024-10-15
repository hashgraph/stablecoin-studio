import { render } from '../../test/index';
import Dashboard from '../Dashboard';

describe(`<${Dashboard.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<Dashboard />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Dashboard />);
		const header = component.getByTestId('dashboard_container');

		expect(header).toBeInTheDocument();
	});
});
