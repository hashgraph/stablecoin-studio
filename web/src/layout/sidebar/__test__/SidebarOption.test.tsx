import userEvent from '@testing-library/user-event';
import SidebarOption from '../SidebarOption';
import { render } from '../../../test';
import { NamedRoutes } from '../../../Router/NamedRoutes';
import { RouterManager } from '../../../Router/RouterManager';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
		getUrl:jest.fn()
	},
}));

jest.mock('react-router-dom', () => ({
	useNavigate: jest.fn(),
	...jest.requireActual('react-router-dom'),
}));

const sidebarOptionProps = {
	icon: 'Coin',
	route: NamedRoutes.Operations,
	title: 'Operations',
};

describe(`<${SidebarOption.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<SidebarOption {...sidebarOptionProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('on click should redirect', async () => {
		const component = render(<SidebarOption {...sidebarOptionProps} />);

		const button = component.getByTestId('sidebar-option-Coin');
		const anything = expect.any(Function);

		await userEvent.click(button);
		expect(RouterManager.to).toHaveBeenCalledTimes(1);
		expect(RouterManager.to).toHaveBeenCalledWith(anything, sidebarOptionProps.route);
	});

	test('should contain title', () => {
		const component = render(<SidebarOption {...sidebarOptionProps} />);

		const title = component.getByTestId('sidebar-option-title');
		expect(title).toHaveTextContent(sidebarOptionProps.title);
	});
});
