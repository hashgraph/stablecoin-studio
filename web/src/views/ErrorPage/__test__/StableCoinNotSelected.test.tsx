import { render } from '../../../test/index';
import StableCoinNotSelected from '../StableCoinNotSelected';
import en from '../../../translations/en/global.json';

const SAFE_BOX = 'safe-box.svg';
const translations = en.errorPage.StableCoinNotSelected;

describe(`<${StableCoinNotSelected.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<StableCoinNotSelected />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has logo, title and description', () => {
		const component = render(<StableCoinNotSelected />);

		const logo = component.getByTestId('stable-coin-not-selected-logo');
		const title = component.getByTestId('stable-coin-not-selected-title');
		const description = component.getByTestId('stable-coin-not-selected-description');

		expect(logo).toHaveAttribute('src', SAFE_BOX);
		expect(title).toHaveTextContent(translations.title);
		expect(description).toHaveTextContent(translations.description);
	});
});
