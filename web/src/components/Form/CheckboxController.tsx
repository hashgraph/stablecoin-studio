import { omit as _omit } from 'lodash';
import type { Control, FieldValues, UseControllerProps } from 'react-hook-form';
import { useController } from 'react-hook-form';
import React from 'react';
import type { CheckboxProps } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';

export interface CheckboxControllerProps
	extends Omit<CheckboxProps, 'defaultValue' | 'defaultChecked'> {
	control: Control<FieldValues>;
	id: UseControllerProps<FieldValues>['name'];
	rules?: Record<string, unknown>;
	showErrors?: boolean;
	defaultValue?: UseControllerProps<FieldValues>['defaultValue'];
	// errorMessageVariant?: FieldControllerProps['errorMessageVariant'];
}

export const CheckboxController = (props: CheckboxControllerProps) => {
	const {
		control,
		id,
		variant,
		showErrors = true,
		onChange,
		onBlur,
		defaultValue,
		// errorMessageVariant,
		rules = {},
	} = props;

	const {
		fieldState,
		field: { onChange: onChangeDefault, onBlur: onBlurDefault, value },
	} = useController<FieldValues>({
		name: id,
		control,
		rules,
		defaultValue,
	});

	const checkboxProps = _omit(props, [
		'control',
		'rules',
		'showErrors',
		'onChange',
		'onBlur',
		'defaultValue',
		'errorMessageVariant',
	]);

	return (
		<Checkbox
			variant={variant}
			data-testid={id}
			isInvalid={!!fieldState?.error}
			defaultChecked={value || defaultValue}
			onChange={(e) => {
				onChange?.(e);
				onChangeDefault(e);
			}}
			onBlur={(e) => {
				onBlur?.(e);
				onBlurDefault();
			}}
			{...checkboxProps}
		/>
	);
};
