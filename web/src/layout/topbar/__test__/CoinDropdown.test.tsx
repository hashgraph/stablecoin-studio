import CoinDropdown from '../CoinDropdown';
import { render } from '../../../test/';
import en from '../../../translations/en/global.json';

describe(`<${CoinDropdown.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CoinDropdown />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should show correct placeholder', () => {
		const component = render(<CoinDropdown />);

		expect(component.getByTestId('select-placeholder')).toHaveTextContent(
			en.topbar.coinDropdown.placeholder,
		);
	});
	test.todo('should show all stable coins');
	test.todo('should be able to choose one coin');
});
