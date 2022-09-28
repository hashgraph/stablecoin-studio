import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DatePickerController from '../../components/Form/DatePickerController';
import InputNumberController from '../../components/Form/InputNumberController';

interface OptionalDetailsProps {
	control: Control<FieldValues>;
}

const OptionalDetails = (props: OptionalDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	return (
		<VStack h='full' justify={'space-between'} pt='80px'>
			<Stack minW={400}>
				<Heading
					data-testid='title'
					fontSize='16px'
					fontWeight='600'
					mb={10}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{t('stableCoinCreation:optionalDetails.title')}
				</Heading>
				<Stack as='form' spacing={6}>
					<InputNumberController
						rules={{
							required: t(`global:validations.required`),
						}}
						isRequired
						control={control}
						name={'initialSupply'}
						label={t('stableCoinCreation:optionalDetails.initialSupply')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.initialSupply'),
						})}
					/>
					<InputNumberController
						rules={{
							required: t(`global:validations.required`),
						}}
						isRequired
						control={control}
						name={'totalSupply'}
						label={t('stableCoinCreation:optionalDetails.totalSupply')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.totalSupply'),
						})}
					/>
					<InputNumberController
						rules={{
							required: t(`global:validations.required`),
						}}
						isRequired
						control={control}
						name={'decimals'}
						label={t('stableCoinCreation:optionalDetails.decimals')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.decimals'),
						})}
						maxValue={18}
						initialValue={6}
					/>
					<DatePickerController
						rules={{
							required: t(`global:validations.required`),
						}}
						isRequired
						control={control}
						name={'expirationDate'}
						label={t('stableCoinCreation:optionalDetails.expirationDate')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.expirationDate'),
						})}
						minimumDate={new Date()}
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default OptionalDetails;
