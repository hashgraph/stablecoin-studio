import { waitFor } from '@testing-library/dom';
import Settings from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/settings.json';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe(`<${Settings.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<Settings />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Settings />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should not allow to select stable coin settings', async () => {
		const component = render(<Settings />);
		const stablecoinSettingsButton = component.getByTestId('direct-access-stableCoinSettings');

		expect(stablecoinSettingsButton).toBeDisabled();
	});

	test('should not allow to select factory settings', async () => {
		const component = render(<Settings />);
		const factorySettingsButton = component.getByTestId('direct-access-factorySettings');

		expect(factorySettingsButton).toBeDisabled();
	});
});
