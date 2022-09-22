import TopbarRight from '../TopbarRight';
import { render } from '../../../test/';
import en from '../../../translations/en/global.json';

const translations = en.topbar;
const networkName = 'TESNET';
const accountId = '0.0.12345';

describe(`<${TopbarRight.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<TopbarRight />);

		const topbar = component.getByTestId('topbar-right');
		expect(topbar).toBeInTheDocument();
		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show network', () => {
		const component = render(<TopbarRight />);

		const network = component.getByTestId('topbar-right-network');
		expect(network).toBeInTheDocument();
		expect(network).toHaveTextContent(translations.network);
		expect(network).toHaveTextContent(networkName);
	});

	test('should show operating account', () => {
		const component = render(<TopbarRight />);

		const account = component.getByTestId('topbar-right-account');
		expect(account).toBeInTheDocument();
		expect(account).toHaveTextContent(translations.account);
		expect(account).toHaveTextContent(accountId);
	});
});
