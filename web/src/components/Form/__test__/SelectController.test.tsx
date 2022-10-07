import { SelectController } from '../SelectController';
import type {
	SelectControllerProps as BaseSelectControllerProps,
	SelectOption,
} from '../SelectController';
import { render } from '../../../test/index';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import translations from '../../../translations/en/global.json';

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

	test('reports correctly the values', () => {
		const component = factoryComponent();

		expect(form.getValues()[defaultProps.name]).toBeUndefined();

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();
		userEvent.click(selector);

		const optionToSelect = component.getByText(defaultProps.options[1].label);
		userEvent.click(optionToSelect);

		expect(form.getValues()[defaultProps.name]).toEqual(defaultProps.options[1]);
	});

	test('shows selected value provided by defaultValue', () => {
		const indexOption = 1;
		const defaultValue = defaultProps.options[indexOption];
		const component = factoryComponent({ ...defaultProps, defaultValue: indexOption.toString() });

		expect(component.queryByText(defaultProps.options[0].label)).not.toBeInTheDocument();
		expect(component.queryByText(defaultProps.options[1].label)).toBeInTheDocument();
		expect(component.queryByText(defaultProps.options[2].label)).not.toBeInTheDocument();

		expect(form.getValues()[defaultProps.name]).toEqual(defaultValue);
	});

	test('incorporates rules to the controller', async () => {
		const notSelectableOption = defaultProps.options[1];
		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
			rules: {
				validate: {
					blacklist: (value: SelectOption) => value.value !== notSelectableOption.value,
				},
			},
		});

		let errorMessage = component.queryByTestId('form-error-msg');
		expect(errorMessage).not.toBeInTheDocument();

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();
		userEvent.click(selector);

		const optionToSelect = component.getByText(notSelectableOption.label);
		userEvent.click(optionToSelect);

		await waitFor(() => {
			errorMessage = component.getByTestId('form-error-msg');
			expect(errorMessage).toBeInTheDocument();
		});
	});

	test('shows placeholder with default value', () => {
		const component = factoryComponent();

		const placeholder = component.getByTestId('select-placeholder');
		expect(placeholder).toBeEmptyDOMElement();

		expect(component.asFragment()).toMatchSnapshot('DefaultPlaceholder');
	});

	test('shows placeholder with the provided value', () => {
		const placeholderText = 'Value of placeholder';
		const component = factoryComponent({
			...defaultProps,
			placeholder: placeholderText,
		});

		const placeholder = component.getByTestId('select-placeholder');
		expect(placeholder).toHaveTextContent(placeholderText);

		expect(component.asFragment()).toMatchSnapshot('CustomPlaceholder');
	});

	test('shows error with showErrors=true', () => {
		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
		});

		act(() => {
			form.setError(defaultProps.name, { type: 'expired' });
		});

		expect(component.getByTestId('form-error-msg')).toBeInTheDocument();
		expect(component.asFragment()).toMatchSnapshot('ShowingError');
	});

	test("doesn't show error with showError=false", () => {
		const component = factoryComponent({
			...defaultProps,
			showErrors: false,
		});

		act(() => {
			form.setError(defaultProps.name, { type: 'expired' });
		});

		expect(component.queryByTestId('form-error-msg')).toBeNull();
		expect(component.asFragment()).toMatchSnapshot('NotShowingError');
	});

	test("doesn't require field with isRequired=false", async () => {
		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
		});

		expect(form.getValues()[defaultProps.name]).toBeUndefined();

		act(() => {
			form.setValue(defaultProps.name, '', {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		});

		await waitFor(() => {
			expect(component.queryByTestId('form-error-msg')).not.toBeInTheDocument();
		});
	});

	test('requires field with isRequired=true', async () => {
		const required = translations.validations.required;
		const component = factoryComponent({
			...defaultProps,
			showErrors: true,
			rules: {
				required,
			},
		});

		act(() => {
			form.setValue(defaultProps.name, '', {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		});

		await waitFor(() => {
			expect(component.getByTestId('form-error-msg')).toBeInTheDocument();
		});
	});

	test('propagates prop onChange to select', async () => {
		const onChange = jest.fn();
		const component = factoryComponent({
			...defaultProps,
			onChangeAux: onChange,
		});

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();
		userEvent.click(selector);

		const optionToSelect = component.getByText(defaultProps.options[1].label);
		userEvent.click(optionToSelect);

		expect(onChange).toHaveBeenCalled();
	});

	test('propagates prop onBlur to select', async () => {
		const onBlur = jest.fn();
		const component = factoryComponent({
			...defaultProps,
			onBlurAux: onBlur,
		});

		const selector = component.getByRole('combobox');
		expect(selector).toBeInTheDocument();
		userEvent.click(selector);
		userEvent.click(document.body);

		expect(onBlur).toHaveBeenCalled();
	});

	test('shows label', async () => {
		const textLabel = 'LabelForSelect';
		const component = factoryComponent({
			...defaultProps,
			label: textLabel,
		});

		const label = component.getByTestId('selector-label');
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent(textLabel);
	});

	test('dont show label when label is empty', async () => {
		const component = factoryComponent({
			...defaultProps,
			label: '',
		});

		const label = component.queryByTestId('selector-label');
		expect(label).not.toBeInTheDocument();
	});

	test('cannot be used when is disabled', () => {
		const onChange = jest.fn();
		const placeholderText = 'disabled selector';
		const component = factoryComponent({
			...defaultProps,
			isDisabled: true,
			onChangeAux: onChange,
			placeholder: placeholderText,
		});

		const selector = component.queryByRole('combobox');
		expect(selector).not.toBeInTheDocument();

		const placeholder = component.getByText(placeholderText);
		userEvent.click(placeholder);

		defaultProps.options.forEach((option) => {
			expect(component.queryByText(option.label)).not.toBeInTheDocument();
		});

		expect(onChange).not.toHaveBeenCalled();
	});
});
