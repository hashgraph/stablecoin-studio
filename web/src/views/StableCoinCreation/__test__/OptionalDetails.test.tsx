import { FieldValues, useForm } from 'react-hook-form';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import OptionalDetails from '../OptionalDetails';
import { CreateRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useForm: () => ({
		getValues: () => ({
			maxSupply: 1000,
			initialSupply: 1000,
			supplyType: 1
		}),
	}),
}));

const form = useForm<FieldValues>({
	mode: 'onChange',
	defaultValues: {
		initialSupply: 1000,
	},
});

const { control } = form;
const request = new CreateRequest({
	name: 'name',
	symbol: 'symbol',
	decimals: 6,
	createReserve: false,
});

describe(`<${OptionalDetails.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<OptionalDetails control={control} request={request} form={form} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<OptionalDetails control={control} request={request} form={form} />);

		const header = component.getByTestId('title');
		expect(header).toHaveTextContent(translations.optionalDetails.title);
	});
});
