import type { StackProps } from '@chakra-ui/react';
import {
	chakra,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Stack,
	Text,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import type { SyntheticEvent } from 'react';
import { forwardRef } from 'react';
import type { Control, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { ReactDatePickerProps } from 'react-datepicker';
import DatePicker from 'react-datepicker';
import Icon from '../Icon';
import 'react-datepicker/dist/react-datepicker.css';

export interface DatePickerControllerProps extends Omit<ReactDatePickerProps, 'onChange'> {
	control: Control<Record<string, string | number>>;
	dataTestId?: string;
	dateFormat?: string;
	disabled?: boolean;
	isClearable?: boolean;
	isRequired?: boolean;
	label?: string;
	labelProps?: object;
	minimumDate?: Date;
	maximumDate?: Date;
	name: string;
	onChangeAux?: (date: Date | [Date | null, Date | null] | null) => void;
	placeholder?: string;
	rules?: UseControllerProps['rules'];
	showErrors?: boolean;
	containerStyle?: StackProps;
	customHeader?: boolean;
}

const InputStyle = {
	fontSize: '14px',
	_focus: {
		boxShadow: 'none',
	},
	_focusVisible: {
		borderColor: 'inherit',
	},
	_hover: {
		borderColor: 'brand.black',
	},
	_placeholder: {
		color: 'brand.black',
		fontSize: '14px',
	},
	_invalid: {
		borderColor: 'brand.red',
	},
};

const CustomInput = forwardRef<any, any>((props, ref) => {
	return (
		<InputGroup p={2} border='1px solid' borderColor='brand.black' borderRadius='8px'>
			<InputLeftElement h='full' p={3}>
				<Flex justifyContent='center' alignItems='center'>
					<Icon name='CalendarBlank' fontSize={24} color='brand.primary' />
				</Flex>
			</InputLeftElement>
			<Input pl='34px' {...props} ref={ref} variant='unstyled' {...InputStyle} />
		</InputGroup>
	);
});
CustomInput.displayName = 'CustomInput';

const CustomHeader = ({
	date,
	decreaseMonth,
	increaseMonth,
	prevMonthButtonDisabled,
	nextMonthButtonDisabled,
}: any) => {
	return (
		<Stack pb={1} isInline alignItems='center' textAlign='left' pl={4} pr={2}>
			<Text color='gray.700' flex={1} fontSize='sm' fontWeight='medium'>
				{new Intl.DateTimeFormat('en-AU', {
					year: 'numeric',
					month: 'long',
				}).format(date)}
			</Text>
			<IconButton
				borderRadius='full'
				size='sm'
				variant='ghost'
				aria-label='Previous Month'
				icon={<ChevronLeftIcon fontSize='14px' />}
				onClick={decreaseMonth}
				disabled={prevMonthButtonDisabled}
			/>
			<IconButton
				borderRadius='full'
				size='sm'
				variant='ghost'
				aria-label='Next Month'
				icon={<ChevronRightIcon fontSize='14px' />}
				onClick={increaseMonth}
				disabled={nextMonthButtonDisabled}
			/>
		</Stack>
	);
};

const StyledDatePicker = chakra(DatePicker);

const DatePickerController = ({
	control,
	dataTestId,
	dateFormat = 'MMM dd, yyy',
	disabled,
	isClearable = false,
	isRequired = false,
	label,
	labelProps,
	minimumDate,
	maximumDate,
	name,
	onChangeAux,
	placeholder,
	rules,
	showErrors,
	containerStyle,
	customHeader = true,
	...props
}: DatePickerControllerProps) => {
	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, onBlur, value }, fieldState: { invalid, error } }) => {
				const onChangeCustom = (
					date: Date | [Date | null, Date | null] | null,
					event: SyntheticEvent<HTMLInputElement> | undefined,
				) => {
					event?.preventDefault();

					onChange(date);
					onChangeAux && onChangeAux(date);
				};

				return (
					<Stack w='full' {...containerStyle}>
						<FormControl data-testid='form-control' isInvalid={invalid}>
							{label && (
								<FormLabel {...labelProps}>
									<HStack>
										<Text>{label}</Text>
										{isRequired && <Text color='red'>*</Text>}
									</HStack>
								</FormLabel>
							)}
							<StyledDatePicker
								calendarStartDay={1}
								customInput={<CustomInput />}
								data-testid={dataTestId || name}
								dateFormat={dateFormat}
								disabled={disabled}
								dropdownMode='select'
								formatWeekDay={(nameOfDay) => nameOfDay.toString().substring(0, 1)}
								isClearable={isClearable}
								minDate={minimumDate}
								maxDate={maximumDate}
								onChange={(date, e) => onChangeCustom(date, e)}
								onBlur={onBlur}
								onSelect={onBlur}
								placeholderText={placeholder}
								renderCustomHeader={customHeader ? CustomHeader : undefined}
								selected={value ? new Date(value) : undefined}
								showPopperArrow={false}
								{...props}
							/>
							{showErrors && (
								<FormErrorMessage data-testid='datepicker-error-message'>
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

export default DatePickerController;
