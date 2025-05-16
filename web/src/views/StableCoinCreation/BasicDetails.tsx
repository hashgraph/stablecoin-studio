import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import type { CreateRequest } from '@hashgraph/stablecoin-npm-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';

interface BasicDetailsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
	setValue: UseFormSetValue<FieldValues>;
}

const BasicDetails = ({ request, control }: BasicDetailsProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	return (
		<VStack h='full' justify={'space-between'} pt='80px'>
			<Stack minW={500}>
				<Heading
					data-testid='title'
					fontSize='16px'
					fontWeight='600'
					mb={10}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{t('stableCoinCreation:basicDetails.title')}
				</Heading>
				<Stack as='form' spacing={6}>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.name = value;
									const res = handleRequestValidation(request.validate('name'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'name'}
						label={t('stableCoinCreation:basicDetails.name') ?? propertyNotFound}
						placeholder={t('stableCoinCreation:basicDetails.namePlaceholder') ?? propertyNotFound}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.symbol = value;
									const res = handleRequestValidation(request.validate('symbol'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'symbol'}
						label={t('stableCoinCreation:basicDetails.symbol') ?? propertyNotFound}
						placeholder={t('stableCoinCreation:basicDetails.symbolPlaceholder') ?? propertyNotFound}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.configId = value;
									const res = handleRequestValidation(request.validate('configId'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'configId'}
						label={t('stableCoinCreation:basicDetails.configId') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:basicDetails.configIdPlaceholder') ?? propertyNotFound
						}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.configVersion = Number(value);
									const res = handleRequestValidation(request.validate('configVersion'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'configVersion'}
						label={t('stableCoinCreation:basicDetails.configVersion') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:basicDetails.configVersionPlaceholder') ?? propertyNotFound
						}
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default BasicDetails;
