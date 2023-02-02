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

	useEffect(() => {
		if (watch('kycKey')?.value !== 2 || watch('supplyKey')?.value === 1) {
			setValue('grantKYCToOriginalSender', false);
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
			name: 'kycKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.kyc'),
		},
		{
			name: 'pauseKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.pause'),
		},
	];

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
								return <Text key={index}>{item.nameTranslate}</Text>;
							})}
						</Stack>
					)}

					{(watch('kycKey') === undefined ||
						(watch('kycKey')?.value === 2 && watch('supplyKey')?.value !== 1)) && (
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
				</Stack>
			</Stack>
		</VStack>
	);
};

export default ManagementPermissions;
