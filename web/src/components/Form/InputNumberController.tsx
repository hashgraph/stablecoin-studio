import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import type {
	InputProps as ChakraInputProps,
	FormControlProps,
	FormLabelProps,
} from '@chakra-ui/react';
import {
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
} from '@chakra-ui/react';
import type { Control, FieldValues, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { NumericFormatProps } from 'react-number-format';
import { NumericFormat } from 'react-number-format';
import Icon from '../Icon';
import InputLabel from './InputLabel';
import type { InputAttributes } from 'react-number-format/types/types';

/**
 * NumberFormatValues copied from 'react-number-format' since it isn't exported from the library right now
 */
interface NumberFormatValues {
	floatValue: number | undefined;
	formattedValue: string;
	value: string;
}
export interface InputNumberControllerProps
	extends Omit<
			ChakraInputProps,
			'name' | 'width' | 'value' | 'defaultValue' | 'color' | 'height' | 'size' | 'type'
		>,
		NumericFormatProps {
	rules?: UseControllerProps['rules'];
	control: Control<FieldValues>;
	label?: string;
	disabled?: boolean;
	onChangeAux?: (values: NumberFormatValues) => void;
	onBlurAux?: (floatValue: NumberFormatValues['floatValue']) => void;
	showErrors?: boolean;
	'data-testid'?: string;
	formStyle?: FormControlProps;
	labelStyle?: FormLabelProps;
	name: string;
	hasArrows?: boolean;
	maxValue?: number;
	minValue?: number;
	initialValue?: number;
}

const InputNumberController = ({
	control,
	name,
	id,
	label = '',
	labelStyle,
	rules,
	isRequired = false,
	placeholder,
	onChangeAux,
	onBlurAux,
	maxValue,
	minValue,
	allowNegative = false,
	suffix,
	disabled,
	decimalSeparator = '.',
	thousandSeparator = ',',
	hasArrows = false,
	showErrors = true,
	'data-testid': dataTestId = name,
	formStyle,
	decimalScale = 2,
	initialValue,
	...props
}: InputNumberControllerProps) => {
	const [inputFloatValue, setInputFloatValue] = useState<number>();

	return (
		<Controller
			control={control}
			rules={rules}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				useEffect(() => {
					if (initialValue) onChange(initialValue);
				}, []);

				const onChangeCustom = (values: NumberFormatValues) => {
					onChange(values.floatValue === undefined ? '' : values.floatValue);
					setInputFloatValue(values?.floatValue!);
					onChangeAux && onChangeAux(values);
				};

				const onBlurCustom = () => {
					onBlurAux && onBlurAux(inputFloatValue);
				};

				const getIsAllowedValue = (values: NumberFormatValues) => {
					if (maxValue === 0) return false;

					if (maxValue && minValue) {
						const { floatValue = 0 } = values;

						return minValue <= floatValue && floatValue <= maxValue;
					}

					if (maxValue) {
						const { floatValue = 0 } = values;

						return floatValue <= maxValue;
					}

					if (minValue) {
						const { floatValue = 0 } = values;

						return floatValue >= minValue;
					}
					return true;
				};

				const incrementValue = () => {
					if (maxValue) {
						maxValue !== value &&
							onChangeCustom({
								value: !value ? '1' : (value++).toString(),
								floatValue: !value ? 1 : value++,
								formattedValue: value,
							});
					} else {
						onChangeCustom({
							value: !value ? '1' : (value++).toString(),
							floatValue: !value ? 1 : value++,
							formattedValue: value,
						});
					}
				};

				const decrementValue = () => {
					if (minValue || minValue === 0) {
						minValue !== value &&
							onChangeCustom({
								value: !value ? minValue.toString() : (value--).toString(),
								floatValue: !value ? minValue : value--,
								formattedValue: value,
							});
					} else {
						onChangeCustom({
							value: !value ? '0' : (value--).toString(),
							floatValue: !value ? 0 : value--,
							formattedValue: value,
						});
					}
				};

				return (
					<Stack w='full'>
						<FormControl data-testid='formControl' isInvalid={!!error} id={id} {...formStyle}>
							{label && (
								<InputLabel isRequired={isRequired} style={labelStyle}>
									{label}
								</InputLabel>
							)}
							<InputGroup>
								<NumericFormat
									data-testid={dataTestId}
									suffix={suffix}
									value={value}
									displayType='input'
									type='text'
									thousandSeparator={thousandSeparator}
									decimalSeparator={decimalSeparator}
									placeholder={placeholder}
									onValueChange={(values) => onChangeCustom(values)}
									onBlur={onBlurCustom}
									isAllowed={getIsAllowedValue}
									allowNegative={allowNegative}
									disabled={disabled}
									customInput={Input as ComponentType<InputAttributes>}
									decimalScale={decimalScale}
									{...props}
								/>

								<InputRightElement w='auto'>
									{hasArrows && (
										<Flex>
											<Button variant='unstyled' w='20px' onClick={incrementValue}>
												<Icon name='CaretUp' w={6} />
											</Button>
											<Button variant='unstyled' w='20px' onClick={decrementValue}>
												<Icon name='CaretDown' w={6} />
											</Button>
										</Flex>
									)}
								</InputRightElement>
							</InputGroup>
							{showErrors && error && (
								<FormErrorMessage data-testid='input-error-message'>
									{error.message}
								</FormErrorMessage>
							)}
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};

export default InputNumberController;
