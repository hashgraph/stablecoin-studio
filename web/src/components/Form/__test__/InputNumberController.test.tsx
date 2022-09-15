import { useForm, UseFormReturn } from 'react-hook-form';
import { act, fireEvent, waitFor } from '@testing-library/react';
import InputNumberController, { InputNumberControllerProps } from '../InputNumberController';
import { render } from '../../../test/index';

let form: UseFormReturn;

const RenderWithForm = (props: Omit<InputNumberControllerProps, 'control'>) => {
	const localForm = useForm({
		mode: 'onChange',
		criteriaMode: 'all',
	});

	form = localForm;

	return <InputNumberController control={localForm.control} {...props} />;
};

const defaultProps: Omit<InputNumberControllerProps, 'control'> = {
	name: 'input-test',
	'data-testid': 'input',
};

const factoryComponent = (props: Partial<InputNumberControllerProps> = defaultProps) => {
	return render(<RenderWithForm name='input-test' {...props} />);
};

describe(`<${InputNumberController.name} />`, () => {
	describe('.render', () => {
		test('should render the component', () => {
			const component = factoryComponent({ label: 'test-label' });

			expect(component.asFragment()).toMatchSnapshot('WithLabel');
		});

		test('should show the label', () => {
			const component = factoryComponent({ label: 'test-label' });

			expect(component.getByText('test-label')).toBeInTheDocument();
		});

		test('should show the error message', async () => {
			const component = factoryComponent({ showErrors: true });

			const errorMessage = 'Expired';
			act(() => {
				form.setError(defaultProps.name, { type: 'expired', message: errorMessage });
			});

			expect(component.getByTestId('input-error-message')).toHaveTextContent(errorMessage);
			expect(component.asFragment()).toMatchSnapshot('WithError');
		});
		test('shouldnt show the error message if showErrors=false', async () => {
			const component = factoryComponent({ showErrors: false });

			const errorMessage = 'Expired';
			act(() => {
				form.setError(defaultProps.name, { type: 'expired', message: errorMessage });
			});

			expect(component.queryByTestId('input-error-message')).toBeNull();
		});
		test('should show placeholder', () => {
			const component = factoryComponent({
				placeholder: 'placeholder',
			});

			const input = component.getByTestId(defaultProps.name);
			expect(input.getAttribute('placeholder')).toBe('placeholder');
			expect(component.asFragment()).toMatchSnapshot('WithPlaceholder');
		});

		test('should be disabled if disabled=true', () => {
			const component = factoryComponent({
				disabled: true,
			});
			const input = component.getByTestId(defaultProps.name);

			expect(input).toBeDisabled();
			expect(component.asFragment()).toMatchSnapshot('Disabled');
		});
	});
	describe('.events', () => {
		test('calls onBlurAux', async () => {
			const onBlurCustom = jest.fn();
			const component = factoryComponent({ onBlurAux: onBlurCustom });
			const input = component.getByTestId(defaultProps.name);

			fireEvent.blur(input);
			await waitFor(() => {
				expect(onBlurCustom).toHaveBeenCalledTimes(1);
			});
		});

		test('calls onChangeAux', async () => {
			const onChangeCustom = jest.fn();

			const component = factoryComponent({
				onChangeAux: onChangeCustom,
			});
			const input = component.getByTestId(defaultProps.name);

			fireEvent.change(input, { target: { value: '123' } });

			await waitFor(() => {
				expect(onChangeCustom).toHaveBeenCalled();
			});
		});
	});
});
