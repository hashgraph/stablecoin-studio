import type {
	InputProps as ChakraInputProps,
	FormControlProps,
	FormLabelProps,
	StackProps,
} from '@chakra-ui/react';
import { Flex, FormControl, FormErrorMessage, Input, InputGroup, Link, Stack } from '@chakra-ui/react';
import type { Control, FieldValues, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { ChangeEventHandler, ChangeEvent, FocusEvent, ReactNode } from 'react';
import InputLabel from './InputLabel';
import { InfoIcon } from '@chakra-ui/icons';

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
	containerStyle?: StackProps;
	link?: string | null;
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
	defaultValue,
	containerStyle,
	link,
	...props
}: InputControllerProps) => {
	return (
		<Controller
			control={control}
			name={name}
			defaultValue={defaultValue}
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
					<Stack w='full' {...containerStyle}>
						<FormControl isInvalid={!!error} {...formStyle}>
							<Flex justifyContent='space-between'>
								{label && (
									<InputLabel isRequired={isRequired} style={labelStyle}>
										{label}
									</InputLabel>
								)}
								{link && <Link href={link} isExternal><InfoIcon /></Link>} 
							</Flex>
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

export default InputController;
