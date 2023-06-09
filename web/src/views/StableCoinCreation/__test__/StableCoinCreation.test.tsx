import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import StableCoinCreation from '../StableCoinCreation';

describe(`<${StableCoinCreation.name} />`, () => {
	beforeEach(() => { });

	test('should render correctly', () => {
		const component = render(<StableCoinCreation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<StableCoinCreation />);

		const header = component.getByTestId('creation-title');
		expect(header).toHaveTextContent(translations.common.createNewStableCoin);
	});

	test('should has subtitle', () => {
		const component = render(<StableCoinCreation />);

		const subtitle = component.getByTestId('creation-subtitle');
		expect(subtitle).toHaveTextContent(translations.common.factoryId);
	});
});
