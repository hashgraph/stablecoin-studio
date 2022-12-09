import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import { SelectController } from '../../components/Form/SelectController';
import SwitchController from '../../components/Form/SwitchController';
import { validateAccount } from '../../utils/validationsHelper';
import { roleExternalTokens } from '../Roles/constants';

const styles = {
	menuList: {
		maxH: '220px',
		overflowY: 'auto',
		bg: 'brand.white',
		p: 4,
	},
	wrapper: {
		border: '1px',
		borderColor: 'brand.black',
		borderRadius: '8px',
		height: 'initial',
	},
	valueSelected: {
		backgroundColor: '#ccacac',
	},
	optionSelected: {
		backgroundColor: '#ccacac',
	},
	container: {
		color: 'brand.gray',
	},
	multiValue: {
		backgroundColor: 'brand.purple',
		background: 'brand.purple',
	},
};

interface ImportedTokenInfoProps {
	control: Control<FieldValues>;
}

const ImportedTokenInfo = (props: ImportedTokenInfoProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'externalTokenInfo']);

	const askRolesToSDK = useWatch({
		control,
		name: 'autoCheckRoles',
	});

	return (
		<VStack h='full' justify={'space-between'} pt='80px'>
			<Stack minW={600}>
				<Heading
					data-testid='title'
					fontSize='16px'
					fontWeight='600'
					mb={10}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{t('externalTokenInfo:externalTokenInfo.title')}
				</Heading>
				<Stack as='form' spacing={6}>
					<InputController
						rules={{
							required: t(`global:validations.required`),
							validate: {
								validCoinId: (value: string) => {
									return validateAccount(value) || t('global:validations.invalidCoinId');
								},
							},
						}}
						isRequired
						control={control}
						name={'stableCoinId'}
						label={t('externalTokenInfo:externalTokenInfo.stableCoinId')}
						placeholder={t('externalTokenInfo:externalTokenInfo.stableCoinIdPlaceholder')}
					/>
					<HStack mb={4}>
						<Text fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('externalTokenInfo:externalTokenInfo.autoCheckRoles')}
						</Text>
						<SwitchController control={control} name={'autoCheckRoles'} defaultValue={false} />
					</HStack>
					{!askRolesToSDK && (
						<SelectController
							control={control}
							name={'roles'}
							label={'Roles'}
							placeholder={t('externalTokenInfo:externalTokenInfo.rolesPlaceholder')}
							options={roleExternalTokens}
							addonLeft={true}
							variant='unstyled'
							overrideStyles={styles}
							isMulti
						/>
					)}
				</Stack>
			</Stack>
		</VStack>
	);
};

export default ImportedTokenInfo;
