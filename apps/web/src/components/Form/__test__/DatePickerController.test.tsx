import { render } from '../../../test/index';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { act, fireEvent, waitFor } from '@testing-library/react';
import type { DatePickerControllerProps } from '../DatePickerController';
import DatePickerController from '../DatePickerController';

let form: UseFormReturn;

const RenderWithForm = (props: Omit<DatePickerControllerProps, 'control'>) => {
	const localForm = useForm({
		mode: 'onChange',
		criteriaMode: 'all',
	});

	form = localForm;

	return <DatePickerController control={localForm.control} {...props} />;
};

const defaultProps: Omit<DatePickerControllerProps, 'control'> = {
	name: 'datepicker-test',
	dataTestId: 'Date',
};

const factoryComponent = (props: Partial<DatePickerControllerProps> = defaultProps) => {
	return render(<RenderWithForm name='datepicker-test' {...props} />);
};

describe(`<${DatePickerController.name} />`, () => {
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

			expect(component.getByTestId('datepicker-error-message')).toHaveTextContent(errorMessage);
			expect(component.asFragment()).toMatchSnapshot('WithError');
		});

		test('shouldnt show the error message if showErrors=false', async () => {
			const component = factoryComponent({ showErrors: false });

			const errorMessage = 'Expired';
			act(() => {
				form.setError(defaultProps.name, { type: 'expired', message: errorMessage });
			});

			expect(component.queryByTestId('datepicker-error-message')).toBeNull();
		});

		test('should be disabled if disabled=true', () => {
			const component = factoryComponent({
				disabled: true,
				placeholder: 'datepicker-placeholder',
			});
			const inputDatePicker = component.getByPlaceholderText('datepicker-placeholder');

			expect(inputDatePicker).toBeDisabled();
			expect(component.asFragment()).toMatchSnapshot('Disabled');
		});
	});

	describe('.events', () => {
		test('calls onChangeAux', async () => {
			const onChangeCustom = jest.fn();

			const component = factoryComponent({
				onChangeAux: onChangeCustom,
				placeholder: 'datepicker-placeholder',
			});
			const inputDatePicker = component.getByPlaceholderText('datepicker-placeholder');

			fireEvent.change(inputDatePicker, { target: { value: '12/21/2024' } });

			await waitFor(() => {
				expect(onChangeCustom).toHaveBeenCalled();
			});
		});
	});
});
