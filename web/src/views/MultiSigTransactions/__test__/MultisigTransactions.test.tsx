import MultiSigTransactions from '../MultisigTransactions';
import {render} from '../../../test';
import translations from '../../../translations/en/multiSig.json';

describe(`<${MultiSigTransactions.name} />`, () => {

	test('should render correctly', () => {
		const component = render(<MultiSigTransactions />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should have title', () => {
		const component = render(<MultiSigTransactions />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});
});
