import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import { validateAccount } from '../../utils/validationsHelper';
import { useSelector } from 'react-redux';
import type { SavedPairingData } from 'hedera-stable-coin-sdk';
import { SELECTED_WALLET_PAIRED } from '../../store/slices/walletSlice';
interface BasicDetailsProps {
	control: Control<FieldValues>;
}

const BasicDetails = (props: BasicDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);
	const pairingData: SavedPairingData = useSelector(SELECTED_WALLET_PAIRED);

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
					<InputController
						rules={{
							required: t(`global:validations.required`),
							validate: {
								validAccount: (value: string) => {
									return validateAccount(value) || t('global:validations.invalidAccount');
								},
							},
						}}
						isRequired
						control={control}
						name={'autorenewAccount'}
						label={t('stableCoinCreation:basicDetails.autorenewAccount')}
						placeholder={t('stableCoinCreation:basicDetails.autorenewAccountPlaceholder')}
						defaultValue={pairingData ? pairingData.accountIds[0] : ''}
						isReadOnly
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default BasicDetails;
