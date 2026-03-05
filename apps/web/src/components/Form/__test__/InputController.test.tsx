import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { act, fireEvent, waitFor } from '@testing-library/react';
import type { InputControllerProps } from '../InputController';
import InputController from '../InputController';
import { render } from '../../../test/index';

let form: UseFormReturn;

const RenderWithForm = (props: Omit<InputControllerProps, 'control'>) => {
	const localForm = useForm({
		mode: 'onChange',
		criteriaMode: 'all',
	});

	form = localForm;

	return <InputController control={localForm.control} {...props} />;
};

const defaultProps: Omit<InputControllerProps, 'control'> = {
	type: 'text',
	name: 'input-test',
	'data-testid': 'input',
	label: '',
};

const factoryComponent = (props: Partial<InputControllerProps> = defaultProps) => {
	return render(<RenderWithForm name='input-test' {...props} />);
};

describe(`<${InputController.name} />`, () => {
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

		test('should render the right element', () => {
			const component = factoryComponent({
				rightElement: <span data-testid='right-element' />,
			});
			const rightElement = component.getByTestId('right-element');

			expect(rightElement).toBeInTheDocument();
			expect(component.asFragment()).toMatchSnapshot('WithRightElement');
		});

		test('should render the left element', () => {
			const component = factoryComponent({
				leftElement: <span data-testid='left-element' />,
			});
			const leftElement = component.getByTestId('left-element');

			expect(leftElement).toBeInTheDocument();
			expect(component.asFragment()).toMatchSnapshot('WithLeftElement');
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

			fireEvent.change(input, { target: { value: 'test' } });

			await waitFor(() => {
				expect(onChangeCustom).toHaveBeenCalled();
			});
		});
	});
});
