import GridDirectAccess from '../GridDirectAccess';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { render } from '../../test/index';

const defaultProps = {
	directAccesses: [
		{
			icon: 'PlusCircle',
			route: NamedRoutes.GiveRole,
			title: 'Enable functionallity',
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.RevokeRole,
			title: 'Revoke functionallity',
		},
	],
};

describe(`<${GridDirectAccess.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<GridDirectAccess {...defaultProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render all elements in directAccesses prop', () => {
		const component = render(<GridDirectAccess {...defaultProps} />);
		const { directAccesses } = defaultProps;

		directAccesses.forEach((element) => {
			const directAccess = component.getByTestId(`direct-access-${element.route}`);

			expect(directAccess).toBeInTheDocument();
		});
	});
});
