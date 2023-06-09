import { render } from '../../../../test/index';
import en from '../../../../translations/en/revokeKYC.json';
import RevokeKyc from '..';

const translations = en;

describe(`<${RevokeKyc.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<RevokeKyc />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<RevokeKyc />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
	});
});
