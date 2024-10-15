import Settings from '..';
import { render } from '../../../test/index';
import translations from '../../../translations/en/settings.json';

describe(`<${Settings.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		localStorage.setItem(
			'tokensAccount',
			JSON.stringify([
				{
					id: 'id',
					externalTokens: [
						{
							id: '0.0.12345',
							symbol: 'symbol',
						},
					],
				},
			]),
		);
		const component = render(<Settings />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Settings />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});
});
