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
import { forwardRef, SyntheticEvent } from 'react';
import { Control, Controller, UseControllerProps } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Icon from '../Icon';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerControllerProps {
	control: Control<Record<string, string | number>>;
	dataTestId?: string;
	dateFormat?: string;
	isClearable?: boolean;
	isRequired?: boolean;
	label?: string;
	labelProps?: object;
	minimumDate?: Date;
	name: string;
	onChangeAux?: (date: Date | [Date | null, Date | null] | null) => void;
	placeholder?: string;
	rules?: UseControllerProps['rules'];
}

const CustomInput = forwardRef<any, any>((props, ref) => {
	return (
		<InputGroup p={2} border='1px solid' borderColor='brand.black' borderRadius='8px'>
			<InputLeftElement h='full' p={3}>
				<Flex justifyContent='center' alignItems='center'>
					<Icon name='CalendarBlank' fontSize={24} color='brand.primary' />
				</Flex>
			</InputLeftElement>
			<Input pl='40px' {...props} ref={ref} />
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

const DatepickerController = ({
	control,
	dataTestId,
	dateFormat = 'MMM dd, yyy',
	isClearable = false,
	isRequired = false,
	label,
	labelProps,
	minimumDate,
	name,
	onChangeAux,
	placeholder,
	rules,
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
					<Stack w='full'>
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
								dropdownMode='select'
								formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 1)}
								isClearable={isClearable}
								minDate={minimumDate}
								onChange={(date, e) => onChangeCustom(date, e)}
								onBlur={onBlur}
								onSelect={onBlur}
								placeholderText={placeholder}
								renderCustomHeader={CustomHeader}
								selected={value ? new Date(value) : undefined}
								showPopperArrow={false}
								{...props}
							/>
							<FormErrorMessage>{error && error.message}</FormErrorMessage>
						</FormControl>
					</Stack>
				);
			}}
		/>
	);
};

export default DatepickerController;
