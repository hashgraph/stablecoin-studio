import { render } from '../../../test/index';
import type { InputLabelProps } from '../InputLabel';
import InputLabel from '../InputLabel';

const inputLabelProps: InputLabelProps = {
	children: 'Label',
	isRequired: false,
};

describe(`<${InputLabel.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<InputLabel {...inputLabelProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});
	test('should add * if it is required', () => {
		const component = render(<InputLabel {...inputLabelProps} isRequired={true} />);

		expect(component.getByTestId('required')).toBeInTheDocument();
	});

	test('should not show * if it is not required', () => {
		const component = render(<InputLabel {...inputLabelProps} />);

		expect(component.queryByTestId('required')).toBeNull();
	});
});
