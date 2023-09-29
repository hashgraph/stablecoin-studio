import { FieldValues, useForm } from 'react-hook-form';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import ProofOfReserve from '../ProofOfReserve';
import { CreateRequest } from '@hashgraph/stablecoin-npm-sdk';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useWatch: () => jest.fn(),
	useForm: () => ({
		control: () => ({}),
		handleSubmit: () => jest.fn(),
		resetField: () => jest.fn(),
	}),
}));

const form = useForm<FieldValues>({
	mode: 'onChange',
});

const { control } = form;
const request = new CreateRequest({
	name: '',
	symbol: '',
	decimals: 6,
	createReserve: false,
});

describe(`<${ProofOfReserve.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ProofOfReserve control={control} request={request} form={form} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<ProofOfReserve control={control} request={request} form={form} />);

		const header = component.getByTestId('title');
		expect(header).toHaveTextContent(translations.proofOfReserve.title);
	});
});
