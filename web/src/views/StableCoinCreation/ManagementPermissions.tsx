import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';
import { useEffect } from 'react';
import type { Control, FieldValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SwitchController from '../../components/Form/SwitchController';
import KeySelector from './components/KeySelector';

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
	
	useEffect(() => {
		if (watch('kycKey')?.value !== 2 || watch('supplyKey')?.value === 1) {
			setValue('grantKYCToOriginalSender', false);
		} else {
			setValue('grantKYCToOriginalSender', true);
		}
	}, [watch('kycKey'), watch('supplyKey')]);

	const keys = [
		{
			name: 'adminKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.admin'),
		},
		{
			name: 'supplyKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.supply'),
		},
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
					{t('stableCoinCreation:managementPermissions.title')}
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
						<SwitchController
							control={control}
							name={'kycRequired'}
							defaultValue={false}
						/>
					</HStack>	
					{ isKycRequired === true && (
						<KeySelector
							key={kycKey.name}
							control={control}
							name={kycKey.name}
							label={kycKey.nameTranslate}
							request={request}
						/>
					)}				
					{ watch('kycKey')?.value === 2 &&
					  watch('supplyKey')?.value !== 1 && (
						<Stack minW={400}>
							<HStack mb={4} justifyContent='space-between'>
								<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
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
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:managementPermissions.manageCustomFees')}
						</Text>
						<SwitchController
							control={control}
							name={'manageCustomFees'}
							defaultValue={true}
						/>
					</HStack>	
					{ isManageCustomFees !== false && (
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
		</VStack>
	);
};

export default ManagementPermissions;
