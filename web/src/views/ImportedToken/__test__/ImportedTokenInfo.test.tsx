import ImportedTokenInfo from '../ImportedTokenInfo';
import { render } from '../../../test/index';
import translations from '../../../translations/en/externalTokenInfo.json';
import { FieldValues, useForm } from 'react-hook-form';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useWatch: () => jest.fn(),
	useForm: () => ({
	  control: () => ({}),
	  handleSubmit: () => jest.fn(),
	}),
  }))
const { control } = useForm();

describe(`<${ImportedTokenInfo.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ImportedTokenInfo control={control} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<ImportedTokenInfo control={control} />);
		const header = component.getByTestId('title');

		expect(header).toHaveTextContent(translations.externalTokenInfo.title);
	});
});
