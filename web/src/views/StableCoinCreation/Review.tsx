import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../components/DetailsReview';
import { OTHER_KEY_VALUE } from './components/KeySelector';
import { OTHER_ACCOUNT_VALUE } from './components/RoleSelector';

interface ReviewProps {
	form: UseFormReturn;
}

const Review = (props: ReviewProps) => {
	const { form } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const { getValues } = form;
	const {
		hederaERC20Id,
		name,
		symbol,
		autorenewAccount,
		initialSupply,
		supplyType,
		maxSupply,
		decimals,
		managementPermissions,
		isKycRequired,
		adminKey,
		supplyKey,
		wipeKey,
		freezeKey,
		kycRequired,
		kycKey,
		pauseKey,
		cashInRoleAccount,
		burnRoleAccount,
		wipeRoleAccount,
		rescueRoleAccount,
		pauseRoleAccount,
		freezeRoleAccount,
		deleteRoleAccount,
		kycRoleAccount,
		cashInAllowance,
		cashInAllowanceType,
		manageCustomFees,
		feeScheduleKey,
		reserveAddress,
		reserveInitialAmount,
		grantKYCToOriginalSender,
	} = getValues();

	const getKey = (keySelected: { value: number; label: string }, nameOtherKey: string) => {
		const { value, label } = keySelected;

		if (value === OTHER_KEY_VALUE) {
			return label + ': ' + form.watch(nameOtherKey);
		}

		return label;
	};

	const getExtraInfo = (label: string, value: string) => {
		if (label === t('stableCoinCreation:managementPermissions.cashin')) {
			if (cashInAllowanceType) {
				return `${value} - UNLIMITED`;
			} else {
				return `${value} - ${cashInAllowance}`;
			}
		} else {
			return value;
		}
	};

	const getRole = (accountSelected: { value: number; label: string }, nameOtherAccount: string) => {
		let { value, label } = accountSelected;
		if (value === OTHER_ACCOUNT_VALUE) {
			label = `${label}: ${form.watch(nameOtherAccount)}`;
		}
		return label;
	};

	const setRoleAccountInfo = (label: string, roleValue: { value: number; label: string }) => {
		const { value } = roleValue;
		if (roleValue.label !== t('stableCoinCreation:managementPermissions.none')) {
			roleDetails.push({
				label: label,
				value:
					value === 1
						? getExtraInfo(label, t('stableCoinCreation:managementPermissions.currentUserAccount'))
						: getExtraInfo(label, getRole(roleValue, `${label.toLowerCase()}RoleAccountOther`)),
			});
		}
	};

	const setRoleAccountInfoByKey = (
		label: string,
		roleValue: { value: number; label: string },
		keyValue: { value: number; label: string },
	) => {
		if (managementPermissions || (keyValue && keyValue.value === 2)) {
			setRoleAccountInfo(label, roleValue);
		}
	};

	const setKycRoleAccountInfoByKey = (
		label: string,
		roleValue: { value: number; label: string },
		keyValue: { value: number; label: string },
	) => {
		if (isKycRequired || (keyValue && keyValue.value === 2)) {
			setRoleAccountInfo(label, roleValue);
		}
	};

	const roleDetails: any[] = [];
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.cashin'),
		cashInRoleAccount,
		supplyKey,
	);
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.burn'),
		burnRoleAccount,
		supplyKey,
	);
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.wipe'),
		wipeRoleAccount,
		wipeKey,
	);
	setRoleAccountInfo(
		t('stableCoinCreation:managementPermissions.rescue'), 
		rescueRoleAccount
	);
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.pause'),
		pauseRoleAccount,
		pauseKey,
	);
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.freeze'),
		freezeRoleAccount,
		freezeKey,
	);
	setRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.delete'),
		deleteRoleAccount,
		adminKey,
	);
	setKycRoleAccountInfoByKey(
		t('stableCoinCreation:managementPermissions.kyc'),
		kycRoleAccount,
		kycKey,
	);

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
								label: t('stableCoinCreation:basicDetails.hederaERC20'),
								value: hederaERC20Id.value || '',
							},
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
							},
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
								value: kycRequired
									? getKey(kycKey, 'kycKeyOther')
									: t('stableCoinCreation:managementPermissions.none'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.pause'),
								value: managementPermissions
									? t('stableCoinCreation:managementPermissions.theSmartContract')
									: getKey(pauseKey, 'pauseKeyOther'),
							},
							{
								label: t('stableCoinCreation:managementPermissions.feeSchedule'),
								value: manageCustomFees
									? getKey(feeScheduleKey, 'feeScheduleKeyOther')
									: t('stableCoinCreation:managementPermissions.none'),
							},
						]}
					/>

					{roleDetails && roleDetails.length > 0 &&(
						<DetailsReview
							title={t('stableCoinCreation:review.rolesAssignment')}
							titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
							details={roleDetails}
						/>
					)}

					<DetailsReview
						title={t('stableCoinCreation:managementPermissions.CreatorKYCFlag')}
						titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
						details={[
							{
								label: t('stableCoinCreation:managementPermissions.grantKYCToOriginalSender'),
								value: grantKYCToOriginalSender
									? t('stableCoinCreation:managementPermissions.CreatorGrantedKYC')
									: t('stableCoinCreation:managementPermissions.CreatorNotGrantedKYC'),
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

					{!reserveAddress && !reserveInitialAmount ? (
						<DetailsReview
							title={t('stableCoinCreation:proofOfReserve.title')}
							titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
							details={[
								{
									label: t('stableCoinCreation:proofOfReserve.hasPor'),
									value: t('stableCoinCreation:proofOfReserve.hasPorValueFalse'),
								},
							]}
						/>
					) : (
						<DetailsReview
							title={t('stableCoinCreation:proofOfReserve.title')}
							titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
							details={[
								{
									label: t('stableCoinCreation:proofOfReserve.hasPor'),
									value: t('stableCoinCreation:proofOfReserve.hasPorValue'),
								},
								{
									label: t('stableCoinCreation:proofOfReserve.addressPor'),
									value: reserveAddress || t('stableCoinCreation:proofOfReserve.createDataFeed'),
								},
								{
									label: t('stableCoinCreation:proofOfReserve.initialSupplyPor'),
									value: reserveInitialAmount || '-',
								},
							]}
						/>
					)}
				</Stack>
			</Stack>
		</VStack>
	);
};

export default Review;
