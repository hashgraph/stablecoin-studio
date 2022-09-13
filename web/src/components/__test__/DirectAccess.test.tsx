import userEvent from '@testing-library/user-event';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import { render } from '../../test/index';
import DirectAccess from '../DirectAccess';

jest.mock('../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

const directAccessProps = {
	icon: 'Coin',
	title: 'Test',
	route: NamedRoutes.Dashboard,
};

describe(`<${DirectAccess.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<DirectAccess {...directAccessProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title and icon visible', () => {
		const component = render(<DirectAccess {...directAccessProps} />);

		const title = component.getByTestId('direct-access-Test');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent('Test');

		const icon = component.getByTestId('direct-access-Coin');
		expect(icon).toBeInTheDocument();
	});

	test('on click should redirect', () => {
		const component = render(<DirectAccess {...directAccessProps} />);

		const container = component.getByTestId('direct-access-container');
		const anything = expect.any(Function);

		userEvent.click(container);
		expect(RouterManager.to).toHaveBeenCalledTimes(1);
		expect(RouterManager.to).toHaveBeenCalledWith(anything, directAccessProps.route);
	});
});
