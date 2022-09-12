import Topbar from '../Topbar';
import { render } from '../../../test/';

const HEDERA_LOGO = 'hedera-hbar-logo.svg';

describe(`<${Topbar.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Topbar />);

		const topbar = component.getByTestId('topbar');
		expect(topbar).toBeInTheDocument();
		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has Hedera Logo', () => {
		const component = render(<Topbar />);

		const logo = component.getByTestId('topbar-logo');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', HEDERA_LOGO);
	});

	test('should has a component in left position', () => {
		const component = render(<Topbar />);

		const topbarLeft = component.getByTestId('topbar-left');
		expect(topbarLeft).toBeInTheDocument();
	});

	test('should has a component in right position', () => {
		const component = render(<Topbar />);

		const TopbarRight = component.getByTestId('topbar-right');
		expect(TopbarRight).toBeInTheDocument();
	});
});
