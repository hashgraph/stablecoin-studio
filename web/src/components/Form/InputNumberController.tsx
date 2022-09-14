/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// TODO: Improve TS
import { useState } from 'react';
import {
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import Icon from '../Icon';

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
	rigthAddon = false,
	showErrors = true,
	'data-testid': dataTestId,
	formStyle,
	handleAllowedCustom,
	readOnly,
	decimalScale,
	decimalPrecision,
	...props
}) => {
	const [inputFloatValue, setInputFloatValue] = useState();

	return (
		<Controller
			control={control}
			rules={rules}
			name={name}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
				const onChangeCustom = (values) => {
					onChange(values.floatValue === undefined ? '' : values.floatValue);
					setInputFloatValue(values.floatValue);
					onChangeAux &&
						onChangeAux(values, values.value, values.isMax !== undefined ? values.isMax : false);
				};

				const onBlurCustom = (event) => {
					onBlur(event);

					onBlurAux && onBlurAux(inputFloatValue);
				};

				const handleAllowed = (inputObj) => {
					if (maxValue === 0) return false;

					if (maxValue && minValue) {
						const { floatValue } = inputObj;
						let floatAux = floatValue;

						if (floatValue === undefined) floatAux = minValue;

						if (minValue <= floatAux && floatAux <= maxValue) return true;
						return false;
					}

					if (maxValue) {
						const { floatValue } = inputObj;
						let floatAux = floatValue;
						if (!floatValue) floatAux = 0;
						if (floatAux <= maxValue) return true;
						return false;
					}

					if (minValue) {
						const { floatValue } = inputObj;
						let floatAux = floatValue;
						if (!floatValue) floatAux = minValue;
						if (floatAux >= minValue) return true;
						return false;
					}
					return true;
				};

				const incrementValue = () => {
					if (maxValue) {
						maxValue !== value &&
							onChangeCustom({ value: !value ? 1 : value++, floatValue: !value ? '1' : value++ });
					} else {
						onChangeCustom({ value: !value ? 1 : value++, floatValue: !value ? '1' : value++ });
					}
				};

				const decrementValue = () => {
					if (minValue || minValue === 0) {
						minValue !== value &&
							onChangeCustom({
								value: !value ? minValue : value--,
								floatValue: !value ? minValue : value--,
							});
					} else {
						onChangeCustom({ value: !value ? 0 : value--, floatValue: !value ? '0' : value-- });
					}
				};

				return (
					<Stack w='full'>
						<FormControl data-testid='formControl' isInvalid={!!error} id={id} {...formStyle}>
							{label && (
								<FormLabel fontSize='14px' color='brand.formLabel' pt='20px' {...labelStyle}>
									<HStack>
										<Text>{label}</Text>
										{isRequired && <Text color='red'>*</Text>}
									</HStack>
								</FormLabel>
							)}
							<InputGroup>
								<NumericFormat
									data-testid={dataTestId || name}
									suffix={suffix}
									value={value}
									displayType='input'
									type='text'
									thousandSeparator={thousandSeparator}
									decimalSeparator={decimalPrecision === 0 ? false : decimalSeparator}
									placeholder={placeholder}
									onValueChange={(values, e) => onChangeCustom(values, e)}
									onBlur={(e) => onBlurCustom(e)}
									isAllowed={handleAllowedCustom || handleAllowed}
									allowNegative={allowNegative}
									disabled={disabled}
									customInput={Input}
									decimalScale={decimalScale || 2}
									{...props}
								/>

								<InputRightElement gap='10px' zIndex='1'>
									{hasArrows && (
										<Flex>
											<Button borderRadius='0px' w='20px' onClick={incrementValue}>
												<Icon name='CaretUp' size={24} weight='fill' />
											</Button>
											<Button
												borderRadius='0px'
												borderTopRightRadius='5px'
												borderBottomRightRadius='5px'
												w='20px'
												onClick={(e) => decrementValue(e)}
											>
												<Icon name='CaretDown' size={24} weight='fill' />
											</Button>
										</Flex>
									)}
								</InputRightElement>
							</InputGroup>
							{showErrors && (
								<FormErrorMessage whiteSpace='nowrap'>{error && error.message}</FormErrorMessage>
							)}
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};

export default InputNumberController;
