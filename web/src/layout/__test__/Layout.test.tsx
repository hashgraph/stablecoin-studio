import Layout from '../Layout';
import { render } from '../../test/';

const layoutProps = {
	children: <span data-testid='layout-children'>TESTING</span>,
};

describe(`<${Layout.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Layout {...layoutProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has a topbar', () => {
		const component = render(<Layout {...layoutProps} />);

		const topbar = component.getByTestId('topbar');
		expect(topbar).toBeInTheDocument();
	});

	test('should has a sidebar', () => {
		const component = render(<Layout {...layoutProps} />);

		const topbar = component.getByTestId('sidebar');
		expect(topbar).toBeInTheDocument();
	});

	test('should render a children', () => {
		const component = render(<Layout {...layoutProps} />);

		const children = component.getByTestId('layout-children');
		expect(children).toBeInTheDocument();
	});
});
