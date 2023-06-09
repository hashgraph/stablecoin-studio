import { render } from '../../../../test/index';
import en from '../../../../translations/en/grantKYC.json';
import GrantKyc from '..';

const translations = en;

describe(`<${GrantKyc.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<GrantKyc />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<GrantKyc />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
