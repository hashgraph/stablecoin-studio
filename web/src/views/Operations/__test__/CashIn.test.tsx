import { render } from '../../../test/index';
import en from '../../../translations/en/cashIn.json';
import CashInOperation from '../CashIn';

const translations = en;

describe(`<${CashInOperation.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<CashInOperation />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('title')).toHaveTextContent(translations.title);
		expect(component.getByTestId('operation-title')).toHaveTextContent(translations.operationTitle);
		expect(component.getByTestId('details-title')).toHaveTextContent(translations.details.title);
	});
});
