import type { ChangeEvent, ReactNode } from 'react';
import { useEffect } from 'react';
import type React from 'react';
import type { Control, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { SelectOption, SelectThemeStyle } from './SelectController';
import type { GroupBase, Props as ReactSelectProps } from 'react-select';
import { FormControl, FormLabel, HStack, Stack, Text } from '@chakra-ui/react';
import type { ChakraStylesConfig } from 'chakra-react-select';
import { CreatableSelect } from 'chakra-react-select';

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
	styles?: ChakraStylesConfig<any, false, GroupBase<any>>;
}

const SelectCreatableController = ({
	control,
	name,
	defaultValue,
	rules,
	options,
	isRequired,
	label,
	labelProps,
	styles,
	onChangeAux,
	onBlurAux,
	placeholder,
	isDisabled,
}: SelectCreatableControllerProps) => {
	return (
		<Controller
			control={control}
			name={name}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field, fieldState: { invalid } }) => {
				const { onChange } = field;

				useEffect(() => {
					if (defaultValue) {
						const index = parseInt(defaultValue as string);
						const defaultOption = options[index];

						onChange(defaultOption);
					}
				}, []);

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
								isInvalid={invalid}
								options={options}
								isClearable={true}
								chakraStyles={styles}
								placeholder={placeholder}
								isDisabled={isDisabled}
								{...field}
								onChange={onChangeCustom as ReactSelectProps['onChange']}
								onBlur={onBlurCustom as ReactSelectProps['onBlur']}
							/>
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};

export default SelectCreatableController;
