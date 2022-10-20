import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
import KeySelector, { OTHER_KEY_VALUE } from './components/KeySelector';

interface ManagementPermissionsProps {
	control: Control<FieldValues>;
}

const ManagementPermissions = (props: ManagementPermissionsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const isManagementPermissions = useWatch({
		control,
		name: 'managementPermissions',
	});

	const isOtherKeySupplySelected =
		useWatch({
			control,
			name: 'supplyKey',
		})?.value === OTHER_KEY_VALUE;

	const keys = [
		{
			name: 'adminKey',
			nameTranslate: t('stableCoinCreation:managementPermissions.stableCoinAdmin'),
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
					<HStack mb={4}>
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
				</Stack>
				{isManagementPermissions === false && isOtherKeySupplySelected && (
					<Stack as='form' spacing={6} pb='60px'>
						<Heading
							data-testid='title'
							fontSize='16px'
							fontWeight='600'
							mb={1}
							lineHeight='15.2px'
							textAlign={'left'}
						>
							{t('stableCoinCreation:managementPermissions.treasuryAccountAddress')}
						</Heading>
						<InputController
							rules={{
								required: t(`global:validations.required`),
							}}
							isRequired
							control={control}
							name={'treasuryAccountAddress'}
							placeholder={t('stableCoinCreation:managementPermissions.introduce', {
								name: t('stableCoinCreation:managementPermissions.treasuryAccountAddress'),
							})}
							label={t('stableCoinCreation:managementPermissions.treasuryAccountAddress')}
						/>
					</Stack>
				)}
			</Stack>
		</VStack>
	);
};

export default ManagementPermissions;
