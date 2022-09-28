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
	const { t, i18n } = useTranslation(['global', 'stableCoinCreation']);

	const { getValues } = form;
	const {
		name,
		symbol,
		initialSupply,
		totalSupply,
		decimals,
		expirationDate,
		managementPermissions,
		adminKey,
		supplyKey,
		rescueKey,
		wipeKey,
		freezeKey,
		feeScheduleKey,
		treasuryAccountAddress,
	} = getValues();

	const formatDate = (date = '') => {
		return new Date(date).toLocaleDateString(i18n.language, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	};

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
						]}
					/>
					<DetailsReview
						title={t('stableCoinCreation:review.optionalDetails')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:optionalDetails.initialSupply'),
								value: initialSupply || '',
							},
							{
								label: t('stableCoinCreation:optionalDetails.totalSupply'),
								value: totalSupply || '',
							},
							{
								label: t('stableCoinCreation:optionalDetails.decimals'),
								value: decimals || '',
							},
							{
								label: t('stableCoinCreation:optionalDetails.expirationDate'),
								value: expirationDate ? formatDate(expirationDate) : '',
							},
						]}
					/>
					<DetailsReview
						title={t('stableCoinCreation:review.managementPermissions')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:managementPermissions.stableCoinAdmin'),
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
								label: t('stableCoinCreation:managementPermissions.rescue'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(rescueKey, 'rescueKeyOther'),
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
								label: t('stableCoinCreation:managementPermissions.feeSchedule'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(feeScheduleKey, 'feeScheduleKeyOther'),
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
									!managementPermissions && supplyKey.value === OTHER_KEY_VALUE
										? treasuryAccountAddress
										: t('stableCoinCreation:managementPermissions.theSmartContract'),
							},
						]}
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default Review;
