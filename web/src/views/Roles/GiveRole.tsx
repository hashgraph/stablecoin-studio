import { useTranslation } from 'react-i18next';
import { Box, HStack, Text } from '@chakra-ui/react';
import RoleLayout from './RoleLayout';
import { useForm } from 'react-hook-form';
import SwitchController from '../../components/Form/SwitchController';
import InputNumberController from '../../components/Form/InputNumberController';
import { fakeOptions, fields } from './constans';

const supplier = 'Supplier';

const GiveRole = () => {
	const { t } = useTranslation(['global', 'roles']);
	const {
		control,
		formState: { isValid },
		register,
		watch,
	} = useForm({ mode: 'onChange' });
	register(fields.supplierQuantitySwitch, { value: true });

	const account = watch(fields.account);
	const amount = watch(fields.amount);
	const infinity = watch(fields.supplierQuantitySwitch);
	const role = watch(fields.role);

	const handleSubmit = () => {
		console.log(`Give role ${role.label} to account ${account}`);
		if (role.label === supplier) {
			if (infinity) {
				console.log('With a infinity quantity of tokens');
			} else {
				console.log(`With a supply of ${amount} tokens`);
			}
		}
	};

	const renderSupplierQuantity = () => {
		return (
			<Box data-testid='supplier-quantity'>
				<HStack>
					<Text>{t('roles:giveRole.supplierQuantityQuestion')}</Text>
				</HStack>
				<HStack mt='20px'>
					<Text mr='10px'>{t('roles:giveRole.switchLabel')}</Text>
					<SwitchController control={control} name={fields.supplierQuantitySwitch} />
				</HStack>
				{!infinity && (
					<Box mt='20px'>
						<InputNumberController
							data-testid='input-supplier-quantity'
							rules={{
								required: t('global:validations.required'),
							}}
							isRequired
							control={control}
							name={fields.amount}
							placeholder={t('roles:giveRole.supplierQuantityInputPlaceholder')}
						/>
					</Box>
				)}
			</Box>
		);
	};

	return (
		<RoleLayout
			accountLabel={t('roles:giveRole.accountLabel')}
			accountPlaceholder={t('roles:giveRole.accountPlaceholder')}
			buttonConfirmEnable={isValid}
			control={control}
			onConfirm={() => handleSubmit()}
			options={fakeOptions}
			selectorLabel={t('roles:giveRole.selectLabel')}
			selectorPlaceholder={t('roles:giveRole.selectPlaceholder')}
			title={t('roles:give')}
		>
			{role?.label === supplier && renderSupplierQuantity()}
		</RoleLayout>
	);
};

export default GiveRole;
