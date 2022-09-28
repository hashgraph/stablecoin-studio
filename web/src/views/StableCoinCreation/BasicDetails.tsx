import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';

interface BasicDetailsProps {
	control: Control<FieldValues>;
}

const BasicDetails = (props: BasicDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	return (
		<VStack h='full' justify={'space-between'}>
			<VStack pt='80px'>
				<Stack minW={400}>
					<Heading
						data-testid='title'
						fontSize='24px'
						fontWeight='700'
						mb={10}
						lineHeight='16px'
						textAlign={'left'}
					>
						{t('stableCoinCreation:basicDetails.title')}
					</Heading>
					<Stack as='form' spacing={6}>
						<InputController
							rules={{
								required: t(`global:validations.required`),
							}}
							isRequired
							control={control}
							name={'name'}
							label={t('stableCoinCreation:basicDetails.name')}
							placeholder={t('stableCoinCreation:basicDetails.namePlaceholder')}
						/>
						<InputController
							rules={{
								required: t(`global:validations.required`),
							}}
							isRequired
							control={control}
							name={'symbol'}
							label={t('stableCoinCreation:basicDetails.symbol')}
							placeholder={t('stableCoinCreation:basicDetails.symbolPlaceholder')}
						/>
					</Stack>
				</Stack>
			</VStack>
		</VStack>
	);
};

export default BasicDetails;
