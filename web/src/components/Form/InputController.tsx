import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	Stack,
	Text,
	InputProps as ChakraInputProps,
	FormControlProps,
	FormLabelProps,
} from '@chakra-ui/react';
import { Control, Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import { ChangeEventHandler, ChangeEvent, FocusEvent, ReactNode } from 'react';

export interface InputControllerProps extends Omit<ChakraInputProps, 'name'> {
	rules?: UseControllerProps['rules'];
	control: Control<FieldValues>;
	label?: string;
	disabled?: boolean;
	onChangeAux?: ChangeEventHandler<HTMLInputElement>;
	onBlurAux?: (event: FocusEvent<HTMLInputElement>) => void;
	showErrors?: boolean;
	'data-testid'?: string;
	leftElement?: ReactNode;
	rightElement?: ReactNode;
	autoComplete?: 'on' | 'off';
	formStyle?: FormControlProps;
	labelStyle?: FormLabelProps;
	name: string;
}

const InputController = ({
	name,
	rules,
	label,
	placeholder,
	control,
	isRequired = false,
	disabled = false,
	onChangeAux,
	onBlurAux,
	showErrors = true,
	'data-testid': dataTestId = name,
	leftElement,
	rightElement,
	formStyle,
	autoComplete = 'off',
	labelStyle,
	...props
}: InputControllerProps) => {
	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, value = '' }, fieldState: { error } }) => {
				const onChangeCustom = (event: ChangeEvent<HTMLInputElement>) => {
					onChange(event);
					onChangeAux && onChangeAux(event);
				};

				const onBlurCustom = (event: FocusEvent<HTMLInputElement>) => {
					onBlurAux && onBlurAux(event);
				};

				return (
					<Stack w='full'>
						<FormControl isInvalid={!!error} {...formStyle}>
							{label && (
								<FormLabel {...labelStyle}>
									<HStack>
										<Text>{label}</Text>
										{isRequired && <Text color='red'>*</Text>}
									</HStack>
								</FormLabel>
							)}
							<InputGroup>
								{leftElement}
								<Input
									data-testid={dataTestId}
									name={name}
									placeholder={placeholder}
									value={value}
									disabled={disabled}
									onChange={onChangeCustom}
									onBlur={onBlurCustom}
									autoComplete={autoComplete}
									{...props}
								/>
								{rightElement}
							</InputGroup>
							{showErrors && (
								<FormErrorMessage data-testid='input-error-message'>
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

export default InputController;
