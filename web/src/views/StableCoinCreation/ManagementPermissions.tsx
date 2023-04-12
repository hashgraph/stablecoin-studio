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
} from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';
import type { Control, FieldValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SwitchController from '../../components/Form/SwitchController';
import InputController from '../../components/Form/InputController';
import KeySelector from './components/KeySelector';
import RoleSelector from './components/RoleSelector';
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';

interface ManagementPermissionsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
	watch: UseFormWatch<FieldValues>;
	setValue: UseFormSetValue<FieldValues>;
}

const ManagementPermissions = ({ control, watch, request }: ManagementPermissionsProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

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
					{t('stableCoinCreation:managementPermissions.keysTitle')}
				</Heading>
				<Stack as='form' spacing={6} pb={6}>
					<HStack mb={4} justifyContent='space-between'>
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
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
													' - ' +
													t('stableCoinCreation:managementPermissions.none')}
											</Text>
										);
									case t('feeScheduleKey'):
										return (
											<Text key={index}>
												{item.nameTranslate +
													' - ' +
													t('stableCoinCreation:managementPermissions.currentUserKey')}
											</Text>
										);
									default:
										return (
											<Text key={index}>
												{item.nameTranslate +
													' - ' +
													t('stableCoinCreation:managementPermissions.theSmartContract')}
											</Text>
										);
								}
							})}
						</Stack>
					)}

					<HStack mb={4} justifyContent='space-between'>
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:managementPermissions.wantKyc')}
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
					<HStack mb={4} justifyContent='space-between'>
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:managementPermissions.manageCustomFees')}
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
								{t('stableCoinCreation:managementPermissions.rolesTitle')}
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
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			</Stack>
		</Box>
	);
};

export default ManagementPermissions;
