import React, { ReactNode } from 'react';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Stack,
	Text,
	useMultiStyleConfig as useChakraMultiStyleConfig,
	Flex,
	type SystemStyleObject,
	Box,
} from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { Controller } from 'react-hook-form';
import { Props as ReactSelectProps } from 'react-select';
import type { Control, UseControllerProps } from 'react-hook-form';

import {
	Select as ChakraSelect,
	type SelectComponentsConfig,
	type GroupBase,
} from 'chakra-react-select';
import Icon from '../Icon';
import { merge as _merge } from 'lodash';
import { Variant } from 'chakra-react-select/dist/types/types';

export interface SelectOption {
	value: string | number;
	label: string | number;
}

export const partsListByTheme: Array<
	| 'wrapper'
	| 'container'
	| 'addonLeft'
	| 'addonRight'
	| 'addonError'
	| 'addonDown'
	| 'menuList'
	| 'label'
	| 'valueSelected'
	| 'option'
	| 'optionSelected'
> = [
	'wrapper',
	'container',
	'addonLeft',
	'addonRight',
	'addonError',
	'addonDown',
	'menuList',
	'label',
	'valueSelected',
	'option',
	'optionSelected',
];

type Parts = typeof partsListByTheme;

export type SelectThemeStyle = Record<Parts[number], SystemStyleObject>;
export interface SelectControllerProps {
	id: string;
	name: string;
	rules?: UseControllerProps['rules'];
	label?: string;
	placeholder?: string;
	options: ReactSelectProps['options'];
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
	addonDown?: ReactNode;
	addonRight?: ReactNode;
	addonError?: ReactNode;
	addonLeft?: ReactNode;
	variant: Variant;
	size?: ReactSelectProps['size'];
	overrideStyles?: Partial<SelectThemeStyle>;
}

export type SelectConfigProps = {
	variant: Record<string, SystemStyleObject>;
	isInvalid?: boolean;
	isDisabled?: boolean;
	addonDown?: ReactNode;
	addonError?: ReactNode;
	addonLeft?: ReactNode;
	addonRight?: ReactNode;
	hasValue?: boolean;
};

const IconContainer = ({ children, sx }: { children: ReactNode; sx?: SystemStyleObject }) => (
	<Flex alignItems='center' justifyContent='center' sx={sx}>
		{children}
	</Flex>
);

const useStyles = ({
	variant,
	size,
	isInvalid,
	isDisabled,
	addonLeft,
	addonRight,
	addonError,
	addonDown,
	overrideStyles,
}: {
	variant: Variant;
	size: ReactSelectProps['size'];
	isInvalid: boolean;
	isDisabled: boolean;
	addonDown: ReactNode;
	addonRight: ReactNode;
	addonError: ReactNode;
	addonLeft: ReactNode;
	overrideStyles?: Partial<SelectThemeStyle>;
}) => {
	const themeStyles = useChakraMultiStyleConfig('Select', {
		variant,
		size,
		isInvalid,
		isDisabled,
		addonLeft,
		addonRight,
		addonError,
		addonDown,
	});
	const styles = React.useMemo(
		() => _merge({}, themeStyles, overrideStyles),
		[themeStyles, overrideStyles],
	);
	return styles as SelectThemeStyle;
};

const useComponents = ({
	variant,
	addonLeft,
	addonRight,
	addonError,
	addonDown,
	size,
	isInvalid,
	isDisabled,
	placeholder,
	styles,
}: {
	variant: Variant;
	addonLeft?: ReactNode;
	addonRight?: ReactNode;
	addonError?: ReactNode;
	addonDown?: ReactNode;
	size?: ReactSelectProps['size'];
	isInvalid?: boolean;
	isDisabled?: boolean;
	placeholder?: string | ReactNode;
	styles: SelectThemeStyle;
}): SelectComponentsConfig<unknown, boolean, GroupBase<unknown>> => {
	return {
		Placeholder: () => null,
		IndicatorSeparator: () => null,
		DropdownIndicator: () => <IconContainer sx={styles.addonDown}>{addonDown}</IconContainer>,
		SelectContainer: ({ children }) => {
			return (
				<Box sx={styles.wrapper}>
					{addonLeft && <IconContainer sx={styles.addonLeft}>{addonLeft}</IconContainer>}
					{children}
					{addonRight && !isInvalid && (
						<IconContainer sx={styles.addonRight}>{addonRight}</IconContainer>
					)}
					{isInvalid && <IconContainer sx={styles.addonError}>{addonError}</IconContainer>}
				</Box>
			);
		},
		ValueContainer: ({ children, hasValue, selectProps: { inputValue } }) => {
			const _styles = useChakraMultiStyleConfig('Select', {
				variant,
				size,
				isInvalid,
				isDisabled,
				hasValue: hasValue || inputValue,
			}) as SelectThemeStyle;
			return (
				<Box sx={_styles.container}>
					<Text as='span' sx={_styles.label}>
						{placeholder}
					</Text>
					{children}
				</Box>
			);
		},
		SingleValue: ({ children }) => <Box sx={styles.valueSelected}>{children}</Box>,
		MenuList: ({ children }) => <Box sx={styles.menuList}>{children}</Box>,
	};
};

export const SelectController = ({
	name,
	rules,
	label,
	placeholder,
	options,
	control,
	isRequired = false,
	isDisabled = false,
	onChangeAux,
	onBlurAux,
	showErrors = true,
	size,
	variant,
	addonLeft,
	addonRight,
	addonError,
	addonDown = <Icon name='CaretDown' />,
	labelProps,
	overrideStyles,
	'data-testid': dataTestId = `${name}-select`,
	...props
}: SelectControllerProps) => {
	const styles = useStyles({
		variant,
		addonRight,
		addonError,
		addonDown,
		addonLeft,
		size,
		isInvalid: false,
		isDisabled,
		overrideStyles,
	});
	const components = useComponents({
		addonLeft,
		addonRight,
		addonError,
		addonDown,
		placeholder,
		isInvalid: false,
		isDisabled,
		styles,
		variant,
	});

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, value }, fieldState: { invalid, error } }) => {
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
										<Text>{label}</Text>
										{isRequired && <Text color='red'>*</Text>}
									</HStack>
								</FormLabel>
							)}

							<ChakraSelect
								isInvalid={invalid}
								options={options}
								onChange={onChangeCustom as ReactSelectProps['onChange']}
								onBlur={onBlurCustom as ReactSelectProps['onBlur']}
								placeholder={placeholder}
								value={value}
								data-testid={dataTestId || name}
								components={components}
								chakraStyles={{
									option: (_, state) => ({
										// option needs to be styled like this, otherwise it doesn't let user select the options
										...styles.option,
										...(state.isSelected && styles.optionSelected),
									}),
								}}
								variant={variant}
								{...props}
							/>
							{showErrors && <FormErrorMessage>{error && error.message}</FormErrorMessage>}
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};
