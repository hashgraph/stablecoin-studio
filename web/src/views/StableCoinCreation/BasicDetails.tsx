import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import { useSelector } from 'react-redux';
import type { CreateRequest } from 'hedera-stable-coin-sdk';
import { SELECTED_WALLET_PAIRED } from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';
interface BasicDetailsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
}

const BasicDetails = (props: BasicDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);
	const pairingData = useSelector(SELECTED_WALLET_PAIRED);

	const { request } = props;

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
						label={t('stableCoinCreation:basicDetails.name')}
						placeholder={t('stableCoinCreation:basicDetails.namePlaceholder')}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`),
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
						label={t('stableCoinCreation:basicDetails.symbol')}
						placeholder={t('stableCoinCreation:basicDetails.symbolPlaceholder')}
					/>
					<InputController
						isRequired
						control={control}
						name={'autorenewAccount'}
						label={t('stableCoinCreation:basicDetails.autorenewAccount')}
						placeholder={t('stableCoinCreation:basicDetails.autorenewAccountPlaceholder')}
						value={pairingData ? pairingData.account?.id.toString() : ''}
						isReadOnly
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default BasicDetails;
