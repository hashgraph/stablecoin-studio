import Layout from '../Layout';
import { render } from '../../test';

const layoutProps = {
	children: <span data-testid='layout-children'>TESTING</span>,
};

const setup = () => {
	const utils = render(<Layout {...layoutProps} />);
	return {
		...utils,
	};
};

describe(`<${Layout.name} />`, () => {
	let component: any;

	beforeEach(() => {
		component = setup();
	});

	test('should render correctly', () => {
		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has a topbar', () => {
		const topbar = component.getByTestId('topbar');
		expect(topbar).toBeInTheDocument();
	});

	test('should has a sidebar', () => {
		const sidebar = component.getByTestId('sidebar');
		expect(sidebar).toBeInTheDocument();
	});

	test('should render a children', () => {
		const children = component.getByTestId('layout-children');
		expect(children).toBeInTheDocument();
	});
});
