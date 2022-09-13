import { SelectController } from '../SelectController';
import type { SelectControllerProps as BaseSelectControllerProps } from '../SelectController';
import { render } from '../../../test/index';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// eslint-disable-next-line react/display-name
jest.mock('react-select', () => ({ name, options, value, onChange, onBlurAux }: any) => {
	function handleChange(event: any) {
		const option = options.find((option: any) => option.value === event.currentTarget.value);

		onChange(option);
	}

	return (
		<select data-testid={name} value={value} onChange={handleChange} onBlur={onBlurAux}>
			{options.map(({ label, value }: any) => (
				<option key={value} value={value}>
					{label}
				</option>
			))}
		</select>
	);
});

describe(`<${SelectController.name} />`, () => {
	type SelectControllerProps = Omit<BaseSelectControllerProps, 'control'>;

	const defaultProps = {
		name: 'selection',
		options: [
			{ value: 'value1', label: 'Value 1' },
			{ value: 'value2', label: 'Value 2' },
			{ value: 'value3', label: 'Value 3' },
		],
		label: 'Select an option',
		rules: {},
	};

	let form: UseFormReturn;

	const RenderWithForm = (props: Omit<SelectControllerProps, 'control'>) => {
		const localForm = useForm({
			mode: 'onChange',
			criteriaMode: 'all',
		});

		form = localForm;

		return <SelectController control={localForm.control} {...props} />;
	};

	const factoryComponent = (props: SelectControllerProps = defaultProps) => {
		return render(<RenderWithForm {...props} />);
	};

	test.skip('reports correctly the values', async () => {
		const component = factoryComponent();

		const { value } = defaultProps.options[1];

		act(() => {
			userEvent.selectOptions(component.getByTestId(defaultProps.name), value);
		});

		expect((component.getByTestId(defaultProps.name) as HTMLInputElement).value).toEqual(value);

		await waitFor(() => {
			expect(form.getValues()[defaultProps.name]).toEqual(value);
		});
	});

	test('shows selected value provided by defaultValue', () => {
		const { value: defaultValue } = defaultProps.options[1];
		const component = factoryComponent({ ...defaultProps, defaultValue });

		expect(form.getValues()[defaultProps.name]).toEqual(defaultValue);

		expect((component.getByTestId(defaultProps.name) as HTMLInputElement).value).toEqual(
			defaultValue,
		);
	});

	test.skip('incorporates rules to the controller', async () => {
		const { value: notSelectableOption } = defaultProps.options[1];

		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
			rules: {
				validate: {
					blacklist: (value: string) => value !== notSelectableOption,
				},
			},
		});
		expect(component.getByTestId('selection')).toBeInTheDocument();
		act(() => {
			fireEvent.change(component.getByTestId('selection'), {
				target: { value: notSelectableOption },
			});
		});

		await act(async () => {
			expect((component.getByTestId(defaultProps.name) as HTMLInputElement).value).toBe(
				notSelectableOption,
			);
		});

		await waitFor(() => {
			expect(component.getByTestId('form-error-msg-top')).toBeInTheDocument();
		});
	});

	test('shows placeholder with default value or the provided value', () => {
		const componentDefaultPlaceholder = factoryComponent({
			...defaultProps,
			placeholder: undefined,
		});
		expect(componentDefaultPlaceholder.asFragment()).toMatchSnapshot('DefaultPlaceholder');

		const componentPlaceholder = factoryComponent({
			...defaultProps,
			placeholder: 'Value of placeholder',
		});
		expect(componentPlaceholder.asFragment()).toMatchSnapshot('CustomPlaceholder');
	});

	test.only('shows error with showErrors=true', () => {
		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
		});

		act(() => {
			form.setError(defaultProps.name, { type: 'expired' });
		});

		expect(component.asFragment()).toMatchSnapshot('ShowingError');
		expect(component.getByTestId('form-error-msg')).toBeInTheDocument();
	});

	test("doesn't show error with showError=false", () => {
		const component = factoryComponent({
			...defaultProps,
			showErrors: false,
		});

		act(() => {
			form.setError(defaultProps.name, { type: 'expired' });
		});

		expect(component.asFragment()).toMatchSnapshot('NotShowingError');
		expect(component.queryByTestId('form-error-msg-top')).toBeNull();
	});

	test("doesn't require field with isRequired=false", async () => {
		const component = factoryComponent({
			...defaultProps,
			isRequired: false,
		});

		act(() => {
			userEvent.selectOptions(component.getByTestId(defaultProps.name), '');
		});

		await waitFor(() => {
			expect(component.queryByTestId('form-error-msg-top')).toBeNull();
		});
	});

	test('requires field with isRequired=true', async () => {
		const component = factoryComponent({
			...defaultProps,
			isRequired: true,
		});

		act(() => {
			userEvent.selectOptions(component.getByTestId(defaultProps.name), '');
		});

		await waitFor(() => {
			expect(component.getByTestId('form-error-msg-top')).toBeInTheDocument();
		});
	});

	test('propagates other props as onChange to select', () => {
		const onChange = jest.fn();
		const onBlur = jest.fn();
		const component = factoryComponent({
			...defaultProps,
			onChangeAux: onChange,
		});

		const { value } = defaultProps.options[1];

		act(() => {
			userEvent.selectOptions(component.getByTestId(`${defaultProps.name}-select`), value);
		});

		expect(onChange).toHaveBeenCalled();
		expect(onBlur).not.toHaveBeenCalled();

		userEvent.click(document.body);

		expect(onBlur).toHaveBeenCalled();
	});

	test.skip('shows label', async () => {
		const textLabel = 'LabelForSelect';
		factoryComponent({
			...defaultProps,
			label: textLabel,
		});

		const label = document.querySelector(`label[for="${defaultProps.name}"]`);

		expect(label).not.toBeNull();
		await waitFor(() => {
			expect(label!.textContent).toEqual(textLabel);
		});
	});

	test('dont show label when label is empty', async () => {
		factoryComponent({
			...defaultProps,
			label: '',
		});

		const label = document.querySelector(`label[for="${defaultProps.name}"]`);

		expect(label).toBeNull();
	});

	test.skip('cannot be used when is disabled', () => {
		// isn't working with mock
		const component = factoryComponent({
			...defaultProps,
			isDisabled: true,
		});

		expect(component.getByTestId(defaultProps.name)).toBeDisabled();

		expect(component.asFragment()).toMatchSnapshot('Disabled');
	});
});
