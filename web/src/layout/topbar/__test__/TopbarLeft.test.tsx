import TopbarLeft from '../TopbarLeft';
import { render } from '../../../test/';

describe(`<${TopbarLeft.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<TopbarLeft />);

		const topbar = component.getByTestId('topbar-left');
		expect(topbar).toBeInTheDocument();
		expect(component.asFragment()).toMatchSnapshot();
	});
});
