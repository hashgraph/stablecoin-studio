import type { ChangeEvent, ReactNode, Ref } from 'react';
import { useState, useEffect } from 'react';
import type React from 'react';
import type { Control, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { SelectOption, SelectThemeStyle } from './SelectController';
import { useComponents, useStyles } from './SelectController';
import type { Props as ReactSelectProps } from 'react-select';
import { FormControl, FormErrorMessage, FormLabel, HStack, Stack, Text } from '@chakra-ui/react';
import type { GroupBase, SelectInstance } from 'chakra-react-select';
import { CreatableSelect } from 'chakra-react-select';
import type { Variant } from 'chakra-react-select/dist/types/types';

export type Option = { label: string | ReactNode; value: number | string };
interface SelectCreatableControllerProps {
	name: string;
	rules?: UseControllerProps['rules'];
	label?: string | null;
	placeholder?: string | null;
	options: Array<Option>;
	control: Control<Record<string, SelectOption['value']>>;
	isRequired?: boolean;
	isSearchable?: boolean;
	isDisabled?: boolean;
	onChangeAux?: React.ChangeEventHandler<HTMLInputElement>;
	onBlurAux?: ReactSelectProps['onBlur'];
	showErrors?: boolean;
	labelProps?: Object;
	'data-testid'?: string;
	onMenuOpen?: () => void;
	onMenuClose?: () => void;
	defaultValue?: SelectOption['value'];
	addonDown?: ReactNode;
	addonRight?: ReactNode;
	addonError?: ReactNode;
	addonLeft?: ReactNode;
	size?: ReactSelectProps['size'];
	overrideStyles?: Partial<SelectThemeStyle>;
	noOptionsMessage?: ReactSelectProps['noOptionsMessage'];
	isMulti?: ReactSelectProps['isMulti'];
	createOptionPosition?: 'first' | 'last';
	formatCreateLabel?: (inputValue: string) => ReactNode;
	variant?: Variant;
	onCreateOption?: (inputValue: string) => void;
	isLoading?: boolean;
	ref?: Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>;
}

const SelectCreatableController = ({
	control,
	name,
	defaultValue,
	rules,
	options,
	label,
	labelProps,
	onChangeAux,
	onBlurAux,
	placeholder,
	isRequired = false,
	isDisabled = false,
	variant = 'outline',
	overrideStyles,
	onCreateOption,
	createOptionPosition = 'last',
	showErrors = true,
	formatCreateLabel,
	addonRight,
	addonError,
	addonDown,
	addonLeft,
	size,
	isLoading = false,
	ref,
	...props
}: SelectCreatableControllerProps) => {
	const [isInvalid, setIsInvalid] = useState(false);
	const styles = useStyles({
		variant,
		addonRight,
		addonError,
		addonDown,
		addonLeft,
		size,
		isInvalid,
		isDisabled,
		overrideStyles,
	});
	const components = useComponents({
		addonLeft,
		addonRight,
		addonError,
		addonDown,
		placeholder,
		isInvalid,
		isDisabled,
		styles,
		variant,
	});
	return (
		<Controller
			control={control}
			name={name}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field, fieldState: { invalid, error } }) => {
				const { onChange } = field;

				useEffect(() => {
					if (defaultValue) {
						const index = parseInt(defaultValue as string);
						const defaultOption = options[index];

						onChange(defaultOption);
					}
				}, []);

				useEffect(() => {
					setIsInvalid(invalid);
				}, [invalid]);

				const onChangeCustom = (event: ChangeEvent<HTMLInputElement>) => {
					onChange(event);
					onChangeAux && onChangeAux(event);
				};

				const onBlurCustom = (event: React.FocusEvent<HTMLInputElement>) => {
					onBlurAux && onBlurAux(event);
				};

				return (
					<Stack w='full'>
						<FormControl data-testid='form_control' isInvalid={invalid}>
							{label && (
								<FormLabel {...labelProps}>
									<HStack>
										<Text data-testid='selector-label'>{label}</Text>
										{isRequired && <Text color='red'>*</Text>}
									</HStack>
								</FormLabel>
							)}

							<CreatableSelect
								isInvalid={isInvalid}
								options={options}
								isClearable={true}
								components={components}
								placeholder={placeholder}
								isDisabled={isDisabled || isLoading}
								isRequired={isRequired}
								createOptionPosition={createOptionPosition}
								formatCreateLabel={formatCreateLabel}
								onCreateOption={onCreateOption}
								variant={variant}
								isLoading={isLoading}
								{...field}
								onChange={onChangeCustom as ReactSelectProps['onChange']}
								onBlur={onBlurCustom as ReactSelectProps['onBlur']}
								ref={ref}
								chakraStyles={{
									control: (baseStyles, state) => ({
										...baseStyles,
										borderWidth: '0px',
										boxShadow: 'none !important',
									}),
									dropdownIndicator: (baseStyles, state) => ({
										...baseStyles,
										paddingRight: '0px',
									}),

									// dropdownIndicator: (baseStyles, state) => ({
									// 	...baseStyles,
									// 	paddingRight:'0px'
									// }),
								}}
								{...props}
							/>
							{showErrors && (
								<FormErrorMessage data-testid='form-error-msg'>
									{error && error.message}
								</FormErrorMessage>
							)}
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};

export default SelectCreatableController;
