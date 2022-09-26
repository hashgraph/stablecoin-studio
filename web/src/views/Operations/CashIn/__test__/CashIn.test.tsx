import { render } from '../../../../test/index';
import en from '../../../../translations/en/cashIn.json';
import CashInOperation from '../';

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
	});

	test('should have an input to write the amount', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('amount')).toBeInTheDocument();
	});

	test('should have an input to write the destinationAccount', () => {
		const component = render(<CashInOperation />);

		expect(component.getByTestId('destinationAccount')).toBeInTheDocument();
	});
});
