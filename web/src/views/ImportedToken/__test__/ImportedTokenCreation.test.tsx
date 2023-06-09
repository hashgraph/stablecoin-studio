import ImportedTokenCreation from '../ImportedTokenCreation';
import { render } from '../../../test/index';
import translations from '../../../translations/en/externalTokenInfo.json';

describe(`<${ImportedTokenCreation.name} />`, () => {
	beforeEach(() => { });

	test('should render correctly', () => {
		const component = render(<ImportedTokenCreation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<ImportedTokenCreation />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.common.createNewStableCoin);
	});
});
