import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../components/DetailsReview';
import { OTHER_KEY_VALUE } from './components/KeySelector';

interface ReviewProps {
	form: UseFormReturn;
}

const Review = (props: ReviewProps) => {
	const { form } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const { getValues } = form;
	const {
		name,
		symbol,
		autorenewAccount,
		initialSupply,
		supplyType,
		maxSupply,
		decimals,
		managementPermissions,
		adminKey,
		supplyKey,
		wipeKey,
		freezeKey,
		kycKey,
		pauseKey,
		reserveAddress,
		reserveInitialAmount

	} = getValues();

	const getKey = (keySelected: { value: number; label: string }, nameOtherKey: string) => {
		const { value, label } = keySelected;

		if (value === OTHER_KEY_VALUE) {
			return label + ': ' + form.watch(nameOtherKey);
		}

		return label;
	};

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
					{t('stableCoinCreation:review.title')}
				</Heading>
				<Stack as='form' spacing={9} pb='50px'>
					<DetailsReview
						title={t('stableCoinCreation:review.basicDetails')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:basicDetails.name'),
								value: name || '',
							},
							{
								label: t('stableCoinCreation:basicDetails.symbol'),
								value: symbol || '',
							},
							{
								label: t('stableCoinCreation:basicDetails.autorenewAccount'),
								value: autorenewAccount || '',
							},
						]}
					/>
					<DetailsReview
						title={t('stableCoinCreation:review.optionalDetails')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:optionalDetails.initialSupply'),
								value: initialSupply.toString() || '',
							},
							{
								label: t('stableCoinCreation:optionalDetails.typeSupply'),
								value: supplyType?.label || '',
							},
							{
								label: t('stableCoinCreation:optionalDetails.maxSupply'),
								value: supplyType?.value === 1 ? maxSupply.toString() : supplyType?.label,
							},
							{
								label: t('stableCoinCreation:optionalDetails.decimals'),
								value: decimals || '',
							}
						]}
					/>
					<DetailsReview
						title={t('stableCoinCreation:review.managementPermissions')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:managementPermissions.admin'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(adminKey, 'adminKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.supply'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(supplyKey, 'supplyKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.wipe'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(wipeKey, 'wipeKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.freeze'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(freezeKey, 'freezeKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.kyc'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(kycKey, 'kycKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.pause'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(pauseKey, 'pauseKeyOther'),
							},
						]}
					/>
					<DetailsReview
						title={t('stableCoinCreation:managementPermissions.treasuryAccountAddress')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:managementPermissions.treasuryAccountAddress'),
								value:
									!managementPermissions && supplyKey.value === 1
										? t('stableCoinCreation:managementPermissions.currentUserKey')
										: t('stableCoinCreation:managementPermissions.theSmartContract'),
							},
						]}
					/>

					{ (!reserveAddress && !reserveInitialAmount  )  ?  (
						<DetailsReview
						title={t('stableCoinCreation:proofOfReserve.title')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:proofOfReserve.hasPor'),
								value: t('stableCoinCreation:proofOfReserve.notHasPor'),
							},
							
						]}
					/>
					):(
						<DetailsReview
						title={t('stableCoinCreation:proofOfReserve.title')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:proofOfReserve.hasPor'),
								value: t('stableCoinCreation:proofOfReserve.hasPor')
							},
							{
								label: t('stableCoinCreation:proofOfReserve.addressPor'),
								value: 	reserveAddress || t('stableCoinCreation:proofOfReserve.createDataFeed') 
								
							},
							{
								label: t('stableCoinCreation:proofOfReserve.initialSupplyPor'),
								value: reserveInitialAmount || "undefined" 
							},
						]}
					/>

					)
					}

				</Stack>
			</Stack>
		</VStack>
	);
};

export default Review;
