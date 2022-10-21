import { render } from '../../test/index';
import Login from '../Login';
import configureMockStore from 'redux-mock-store';
import translations from '../../translations/en/global.json';

const mockStore = configureMockStore();

describe(`<${Login.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<Login />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Login />);
		const header = component.getByTestId('login_container');

		expect(header).toBeInTheDocument();
	});

	test('should display ModalHashpack when wallet extension is not installed', () => {
		const store = mockStore({
			wallet: {
				hasWalletExtension: false,
			},
		});

		const component = render(<Login />, store);
		const title = component.getByTestId('modal-hashpack-title');

		expect(title).toHaveTextContent(translations['hashpack-no-installed'].title);
	});

	test('should display ModalHashpack when wallet is not connected', () => {
		const store = mockStore({
			wallet: {
				hasWalletExtension: true,
			},
		});

		const component = render(<Login />, store);
		const title = component.getByTestId('modal-hashpack-title');

		expect(title).toHaveTextContent(translations['hashpack-no-connected'].title);
	});
});
