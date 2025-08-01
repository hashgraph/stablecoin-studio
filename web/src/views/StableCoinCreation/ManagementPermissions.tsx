import {
	Box,
	Heading,
	HStack,
	Stack,
	Text,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionIcon,
	AccordionPanel,
	Flex,
	Link,
} from '@chakra-ui/react';
import { SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import type { CreateRequest } from '@hashgraph/stablecoin-npm-sdk';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { Control, FieldValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SwitchController from '../../components/Form/SwitchController';
import InputController from '../../components/Form/InputController';
import KeySelector from './components/KeySelector';
import RoleSelector from './components/RoleSelector';
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';
import { SELECTED_WALLET } from '../../store/slices/walletSlice';
import { InfoIcon } from '@chakra-ui/icons';

interface ManagementPermissionsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
	watch: UseFormWatch<FieldValues>;
	setValue: UseFormSetValue<FieldValues>;
}

const ManagementPermissions = ({
	control,
	watch,
	request,
	setValue,
}: ManagementPermissionsProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const wallet = useSelector(SELECTED_WALLET);

	const decimals = useWatch({
		control,
		name: 'decimals',
	});

	const isManagementPermissions = useWatch({
		control,
		name: 'managementPermissions',
	});

	const isKycRequired = useWatch({
		control,
		name: 'kycRequired',
	});

	const isManageCustomFees = useWatch({
		control,
		name: 'manageCustomFees',
	});

	const cashInRoleAccount = watch('cashInRoleAccount');
	const infinity: boolean = watch('cashInAllowanceType');

	useEffect(() => {
		if (watch('kycKey')?.value !== 2 || watch('supplyKey')?.value === 1) {
			setValue('grantKYCToOriginalSender', false);
		} else {
			setValue('grantKYCToOriginalSender', true);
		}
	}, [watch('kycKey'), watch('supplyKey')]);

	useEffect(() => {
		setValue('isKycRequired', isKycRequired);
		if (!isKycRequired) {
			request.kycRoleAccount = undefined;
			request.grantKYCToOriginalSender = false;
			setValue('kycKey', undefined);
			setValue('kycRoleAccount', undefined);
			setValue('grantKYCToOriginalSender', false);
		}
	}, [watch('kycRequired')]);

	useEffect(() => {
		if (!isManageCustomFees) {
			request.feeRoleAccount = undefined;
			setValue('feeScheduleKey', undefined);
			setValue('feeRoleAccount', undefined);
		}
	}, [watch('manageCustomFees')]);

	const keys = [
		{
			name: 'wipeKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.wipe'),
		},
		{
			name: 'freezeKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.freeze'),
		},
		{
			name: 'pauseKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.pause'),
		},
	];

	const kycKey = {
		name: 'kycKey',
		nameTranslate: t('stableCoinCreation:managementPermissions.kyc'),
	};

	const feeScheduleKey = {
		name: 'feeScheduleKey',
		nameTranslate: t('stableCoinCreation:managementPermissions.feeSchedule'),
	};

	return (
		<Box pt='80px'>
			<Stack minW={400}>
				<Heading
					data-testid='title'
					fontSize='16px'
					fontWeight='600'
					mb={10}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					<Flex justifyContent='space-between'>
						{t('stableCoinCreation:managementPermissions.keysTitle')}
						{
							<Link
								href={t('stableCoinCreation:managementPermissions.titleLink') || undefined}
								isExternal
							>
								<InfoIcon />
							</Link>
						}
					</Flex>
				</Heading>
				<Stack as='form' spacing={6} pb={6}>
					<HStack mb={4} justifyContent='space-between'>
						<Text
							maxW={'252px'}
							fontSize='14px'
							fontWeight='400'
							lineHeight='17px'
							whiteSpace='nowrap'
						>
							{t('stableCoinCreation:managementPermissions.description')}
						</Text>
						<SwitchController
							control={control}
							name={'managementPermissions'}
							defaultValue={true}
						/>
					</HStack>
					{isManagementPermissions === false ? (
						<>
							{keys.map((item) => {
								return (
									<KeySelector
										key={item.name}
										control={control}
										name={item.name}
										label={item.nameTranslate}
										request={request}
									/>
								);
							})}
						</>
					) : (
						<Stack spacing={2} fontSize='14px' fontWeight='400'>
							{keys.map((item, index) => {
								switch (item.name) {
									case t('kycKey'):
										return (
											<Text key={index} color='red'>
												{item.nameTranslate +
													' | ' +
													t('stableCoinCreation:managementPermissions.none')}
											</Text>
										);
									case t('feeScheduleKey'):
										return (
											<Text key={index}>
												{item.nameTranslate +
													' | ' +
													t('stableCoinCreation:managementPermissions.currentUserKey')}
											</Text>
										);
									default:
										return (
											<Text key={index}>
												{item.nameTranslate +
													' | ' +
													t('stableCoinCreation:managementPermissions.theSmartContract')}
											</Text>
										);
								}
							})}
						</Stack>
					)}

					<HStack mb={4} justifyContent='space-between'>
						<Text
							maxW={'252px'}
							fontSize='14px'
							fontWeight='400'
							lineHeight='17px'
							whiteSpace='nowrap'
						>
							{t('stableCoinCreation:managementPermissions.wantKyc')}{' '}
							{
								<Link
									href={t('stableCoinCreation:managementPermissions.wantKycLink') || undefined}
									isExternal
								>
									<InfoIcon />
								</Link>
							}
						</Text>
						<SwitchController control={control} name={'kycRequired'} defaultValue={false} />
					</HStack>
					{isKycRequired === true && (
						<KeySelector
							key={kycKey.name}
							control={control}
							name={kycKey.name}
							label={kycKey.nameTranslate}
							request={request}
						/>
					)}
					{isKycRequired === true &&
						watch('kycKey')?.value === 2 &&
						wallet.lastWallet !== SupportedWallets.METAMASK && (
							<Stack minW={400}>
								<HStack mb={4} justifyContent='space-between'>
									<Text
										maxW={'252px'}
										fontSize='14px'
										fontWeight='400'
										lineHeight='17px'
										whiteSpace='nowrap'
									>
										{t('stableCoinCreation:managementPermissions.grantKYCToOriginalSender')}
									</Text>

									<SwitchController
										control={control}
										name={'grantKYCToOriginalSender'}
										defaultValue={true}
									/>
								</HStack>
							</Stack>
						)}
					<HStack mb={4} justifyContent='space-between'>
						<Text
							maxW={'252px'}
							fontSize='14px'
							fontWeight='400'
							lineHeight='17px'
							whiteSpace='nowrap'
						>
							{t('stableCoinCreation:managementPermissions.manageCustomFees')}{' '}
							{
								<Link
									href={
										t('stableCoinCreation:managementPermissions.manageCustomFeesLink') || undefined
									}
									isExternal
								>
									<InfoIcon />
								</Link>
							}
						</Text>
						<SwitchController control={control} name={'manageCustomFees'} defaultValue={false} />
					</HStack>
					{isManageCustomFees === true && (
						<KeySelector
							key={feeScheduleKey.name}
							control={control}
							name={feeScheduleKey.name}
							label={feeScheduleKey.nameTranslate}
							request={request}
						/>
					)}
				</Stack>
			</Stack>
			<Stack minW={400}>
				<Accordion defaultIndex={[1]} allowMultiple>
					<AccordionItem>
						<AccordionButton>
							<Box as='span' flex='1' textAlign='left' fontSize='16px' fontWeight='600'>
								{t('stableCoinCreation:managementPermissions.rolesTitle')}{' '}
								{
									<Link
										href={t('stableCoinCreation:managementPermissions.rolesLink') || undefined}
										isExternal
									>
										<InfoIcon />
									</Link>
								}
							</Box>
							<AccordionIcon />
						</AccordionButton>
						<AccordionPanel pb={4} marginBottom='106px'>
							<Box data-testid='supplier-quantity'>
								<RoleSelector
									key={'cashinRole'}
									control={control}
									name={'cashInRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.cashin')}
									request={request}
								/>
								{cashInRoleAccount && cashInRoleAccount.value !== 3 && (
									<HStack mt='20px'>
										<Text mr='10px'>
											{t('stableCoinCreation:managementPermissions.cashInAllowanceType')}
										</Text>
										<SwitchController control={control} name={'cashInAllowanceType'} />
									</HStack>
								)}
								{infinity === false && cashInRoleAccount && cashInRoleAccount.value !== 3 && (
									<Box mt='20px'>
										<InputController
											data-testid='input-supplier-quantity'
											rules={{
												required: t(`global:validations.required`) ?? propertyNotFound,
												validate: {
													validDecimals: (value: string) => {
														return (
															validateDecimalsString(value, decimals) ||
															(t('global:validations.decimalsValidation') ?? propertyNotFound)
														);
													},
													validation: (value: string) => {
														if (request && 'cashInRoleAllowance' in request) {
															request.cashInRoleAllowance = value;
															const res = handleRequestValidation(
																request.validate('cashInRoleAllowance'),
															);
															return res;
														}
													},
												},
											}}
											isRequired
											control={control}
											name={'cashInAllowance'}
											placeholder={
												t(
													'stableCoinCreation:managementPermissions.cashInAllowanceInputPlaceholder',
												) ?? propertyNotFound
											}
										/>
									</Box>
								)}
							</Box>

							<RoleSelector
								key={'burnRole'}
								control={control}
								name={'burnRoleAccount'}
								label={t('stableCoinCreation:managementPermissions.burn')}
								request={request}
							/>
							{(isManagementPermissions !== false || watch('wipeKey')?.value === 2) && (
								<RoleSelector
									key={'wipeRole'}
									control={control}
									name={'wipeRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.wipe')}
									request={request}
								/>
							)}
							<RoleSelector
								key={'rescueRole'}
								control={control}
								name={'rescueRoleAccount'}
								label={t('stableCoinCreation:managementPermissions.rescue')}
								request={request}
							/>
							{(isManagementPermissions !== false || watch('pauseKey')?.value === 2) && (
								<RoleSelector
									key={'pauseRole'}
									control={control}
									name={'pauseRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.pause')}
									request={request}
								/>
							)}
							{(isManagementPermissions !== false || watch('freezeKey')?.value === 2) && (
								<RoleSelector
									key={'freezeRole'}
									control={control}
									name={'freezeRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.freeze')}
									request={request}
								/>
							)}
							<RoleSelector
								key={'deleteRole'}
								control={control}
								name={'deleteRoleAccount'}
								label={t('stableCoinCreation:managementPermissions.delete')}
								request={request}
							/>
							{isKycRequired === true && watch('kycKey')?.value === 2 && (
								<RoleSelector
									key={'kycRole'}
									control={control}
									name={'kycRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.kyc')}
									request={request}
								/>
							)}
							{isManageCustomFees === true && watch('feeScheduleKey')?.value === 2 && (
								<RoleSelector
									key={'feeScheduleRole'}
									control={control}
									name={'feeRoleAccount'}
									label={t('stableCoinCreation:managementPermissions.feeSchedule')}
									request={request}
								/>
							)}
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			</Stack>
		</Box>
	);
};

export default ManagementPermissions;
