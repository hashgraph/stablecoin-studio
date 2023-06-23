import { FieldValues, useForm } from 'react-hook-form';
import { render } from '../../../test/index';
import translations from '../../../translations/en/stableCoinCreation.json';
import Review from '../Review';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useForm: () => ({
		getValues: () => ({
			rescueRoleAccount: { value: 1, label: '0.0.123' },
			hederaTokenManagerId: { value: 2 },
			initialSupply: 0,
			wipeKey: { value: 1, label: '0.0.123' },
			freezeKey: { value: 1, label: '0.0.123' },
			kycKey: { value: 1, label: '0.0.123' },
			pauseKey: { value: 1, label: '0.0.123' },
			feeScheduleKey: { value: 1, label: '0.0.123' },
		}),
		handleSubmit: () => jest.fn(),
	}),
}));
const form = useForm<FieldValues>({
	mode: 'onChange',
});

describe(`<${Review.name} />`, () => {
	beforeEach(() => {});

	test('should render correctly', () => {
		const component = render(<Review form={form} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<Review form={form} />);

		const header = component.getByTestId('title');
		expect(header).toHaveTextContent(translations.review.title);
	});
});
