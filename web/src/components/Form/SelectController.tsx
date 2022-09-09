/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import React, { ReactNode, useRef, useState } from 'react';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Stack,
	Text,
	useFormControlContext as useChakraFormControlContext,
	useMultiStyleConfig as useChakraMultiStyleConfig,
	Flex,
	type SystemStyleObject,
	Box,
} from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { Controller } from 'react-hook-form';
import { Props } from 'react-select';
import type { Control, UseControllerProps } from 'react-hook-form';
import { Select as ChakraSelect } from 'chakra-react-select';
import Icon from '../Icon';
import { merge as _merge } from 'lodash';

export interface SelectOption {
	value: string | number;
	label: string | number;
}

export interface SelectControllerProps {
	id: string;
	name: string;
	rules?: UseControllerProps['rules'];
	label?: string;
	placeholder?: string;
	options: Props['options'];
	control: Control<Record<string, SelectOption['value']>>;
	isRequired?: boolean;
	isSearchable?: boolean;
	isDisabled?: boolean;
	onChangeAux?: React.ChangeEventHandler<HTMLInputElement>;
	onBlurAux?: Props['onBlur'];
	showErrors?: boolean;
	chakraStyles?: Object;
	formStyle?: Object;
	labelStyle?: Object;
	'data-testid': string;
	onMenuOpen?: () => void;
	onMenuClose?: () => void;
	addonDown?: ReactNode;
	overrideStyles?: any;
}
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
}) => {
	console.log();

	const themeStyles = useChakraMultiStyleConfig('Select', {
		variant,
		size,
		isInvalid,
		isDisabled,
		addonLeft,
		addonRight,
		addonError,
		addonDown,
	}) as any;
	const styles = _merge(themeStyles, overrideStyles);

	return styles;
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
	variant: any;
	addonLeft?: ReactNode;
	addonRight?: ReactNode;
	addonError?: ReactNode;
	addonDown?: ReactNode;
	size?: any;
	isInvalid?: boolean;
	isDisabled?: boolean;
	placeholder?: string | ReactNode;
	overrideStyles?: any;
}): any => {
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
			}) as any;
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
	id,
	name,
	rules,
	label = '',
	placeholder,
	options,
	control,
	isRequired = false,
	isDisabled = false,
	onChangeAux,
	onBlurAux,
	showErrors = true,
	chakraStyles,
	formStyle,
	isSearchable,
	size,
	variant,
	addonLeft,
	addonRight,
	addonError,
	addonDown = <Icon name='CaretDown' />,
	labelStyle,
	overrideStyles,
	'data-testid': dataTestId,
	...props
}: SelectControllerProps) => {
	const styles = useStyles({
		variant,
		addonRight,
		addonError,
		addonDown,
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
						<FormControl data-testid='form_control' isInvalid={invalid} {...formStyle}>
							<FormLabel fontSize='14px' color='brand.formLabel' pt='20px' {...labelStyle}>
								<HStack>
									<Text>{label}</Text>
									{isRequired && <Text color='red'>*</Text>}
								</HStack>
							</FormLabel>

							<ChakraSelect
								isInvalid={invalid}
								options={options}
								onChange={onChangeCustom as Props['onChange']}
								onBlur={onBlurCustom as Props['onBlur']}
								placeholder={placeholder}
								value={value}
								data-testid={dataTestId || name}
								components={components}
								chakraStyles={{
									option: (provided, state) => {
										console.log(styles.optionSelected);

										return {
											...styles.option,
											...(state.isSelected && styles.optionSelected),
										};
									},
								}}
								variant='unstyled'
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
