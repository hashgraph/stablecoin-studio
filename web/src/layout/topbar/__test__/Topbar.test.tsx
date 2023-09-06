import Topbar from '../Topbar';
import { render } from '../../../test/';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';

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

	test('should have CoinDropdown in left position', () => {
		const component = render(<Topbar />);

		const topbarLeft = component.getByTestId('coin-dropdown');
		expect(topbarLeft).toBeInTheDocument();
	});

	test('should has a component in right position', () => {
		const component = render(<Topbar />);

		const TopbarRight = component.getByTestId('topbar-right');
		expect(TopbarRight).toBeInTheDocument();
	});

	test('should has is Not Network Recognized', async () => {
		
		const mockStore = configureMockStore();
		const store = mockStore({
			wallet: {
				accountRecognized: false,
				networkRecognized: false,
			},
		});
		const component = render(<Topbar />, store);

		const button = component.getByTestId('isNotNetworkRecognized');
		await userEvent.click(button);
	});

	test('should has is Not Account Recognized ', async () => {
		
		const mockStore = configureMockStore();
		const store = mockStore({
			wallet: {
				accountRecognized: false,
				networkRecognized: true,
			},
		});
		const component = render(<Topbar />, store);

		const isNotAccountRecognized = component.getByTestId('isNotAccountRecognized');
		await userEvent.click(isNotAccountRecognized);
	});
});
