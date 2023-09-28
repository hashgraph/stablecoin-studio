import { FieldValues, useForm } from 'react-hook-form';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import ManagementPermissions from '../ManagementPermissions';
import { CreateRequest } from '@hashgraph-dev/stablecoin-npm-sdk';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useWatch: () => true,
	useForm: () => ({
		control: () => ({}),
		watch: () => jest.fn(),
		setValue: () => jest.fn(),
	}),
}));

const form = useForm<FieldValues>({
	mode: 'onChange',
});

const { control, watch, setValue } = form;
const request = new CreateRequest({
	name: '',
	symbol: '',
	decimals: 6,
	createReserve: false,
});

describe(`<${ManagementPermissions.name} />`, () => {
	test.skip('should render correctly', () => {
		const component = render(
			<ManagementPermissions
				control={control}
				request={request}
				watch={watch}
				setValue={setValue}
			/>,
		);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(
			<ManagementPermissions
				control={control}
				request={request}
				watch={watch}
				setValue={setValue}
			/>,
		);

		const header = component.getByTestId('title');
		expect(header).toHaveTextContent(translations.managementPermissions.keysTitle);
	});
});
