import { Control, FieldValues, useForm } from 'react-hook-form';
import { render } from '../../test/index';
import KeySelector from '../KeySelector';
import type { KeySelectorProps } from '../KeySelector';
import userEvent from '@testing-library/user-event';

jest.mock('react-hook-form', () => ({
	...jest.requireActual('react-hook-form'),
	Controller: () => <></>,
	useWatch: () => (true),
	useForm: () => ({
		control: () => ({})
	}),
}))

const { control } = useForm({
	mode: 'onChange',
});

describe(`<${KeySelector.name} />`, () => {

	test('should render correctly', () => {
		const props: KeySelectorProps = {
			control: control,
			name: 'name',
			label: 'label',
			labelPlaceholder: 'labelPlaceholder',
			nameValidation: 'nameValidation',
		};
		const component = render(<KeySelector {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render correctly with sentences', () => {
		const props: KeySelectorProps = {
			control: control,
			name: 'fee schedule key',
			label: 'label label',
			labelPlaceholder: 'labelPlaceholder',
			nameValidation: 'nameValidation',
		};
		const component = render(<KeySelector {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});
});
