/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import React, { ReactNode } from 'react';
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
import { Icon } from '../Icon';

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
}
const IconContainer = ({ children, sx }: { children: ReactNode; sx?: SystemStyleObject }) => (
	<Flex alignItems='center' justifyContent='center' sx={sx}>
		{children}
	</Flex>
);

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
}): any => {
	const styles = useChakraMultiStyleConfig('Select', {
		variant,
		size,
		isInvalid,
		isDisabled,
		addonLeft,
		addonRight,
		addonError,
		addonDown,
	}) as any;

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
	'data-testid': dataTestId,
	...props
}: SelectControllerProps) => {
	const components = useComponents({
		size,
		variant,
		addonLeft,
		addonRight,
		addonError,
		addonDown,
		placeholder,
		isInvalid: false,
		isDisabled,
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
							{/* <Select
								data-testid={dataTestId || name}
								id={id || name}
								name={name}
								placeholder={placeholder || ''}
								value={value}
								options={options}
								isDisabled={disabled}
								isSearchable={isSearchable}
								onChange={onChangeCustom as Props['onChange']}
								onBlur={onBlurCustom as Props['onBlur']}
								styles={chakraStyles}
								{...props}
							/> */}
							<ChakraSelect
								isInvalid={invalid}
								isDisabled={isDisabled}
								options={options}
								components={components}
								// {...props}
							/>
							{showErrors && <FormErrorMessage>{error && error.message}</FormErrorMessage>}
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};
