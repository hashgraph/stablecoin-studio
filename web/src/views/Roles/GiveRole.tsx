import { useTranslation } from 'react-i18next';
import { Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import RoleLayout from './RoleLayout';
import ModalsHandler from '../../components/ModalsHandler';
import DetailsReview from '../../components/DetailsReview';
import SwitchController from '../../components/Form/SwitchController';
import InputNumberController from '../../components/Form/InputNumberController';
import { fakeOptions, fields } from './constans';
import type { Detail } from '../../components/DetailsReview';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';

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
	const { isOpen, onOpen, onClose } = useDisclosure();

	const account: string | undefined = watch(fields.account);
	const amount: string | undefined = watch(fields.amount);
	const infinity: boolean = watch(fields.supplierQuantitySwitch);
	const role = watch(fields.role);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSubmit: ModalsHandlerActionsProps['onConfirm'] = ({ onSuccess, onError }) => {
		console.log(`Give role ${role.label} to account ${account}`);
		if (role.label === supplier) {
			if (infinity) {
				console.log('With a infinity quantity of tokens');
			} else {
				console.log(`With a supply of ${amount} tokens`);
			}
		}

		onSuccess();
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

	const getDetails: () => Detail[] = () => {
		const details: Detail[] = [
			{
				label: t('roles:giveRole.modalActionDetailAccount'),
				value: account as string,
			},
			{
				label: t('roles:giveRole.modalActionDetailRole'),
				value: role?.label,
				valueInBold: true,
			},
		];

		if (role?.label === supplier) {
			const value = infinity ? t('roles:giveRole.infinity') : amount!;
			const tokenQuantity: Detail = {
				label: t('roles:giveRole.modalActionDetailSupplierQuantity'),
				value,
			};

			details.push(tokenQuantity);
		}

		return details;
	};

	const details = getDetails();

	return (
		<>
			<RoleLayout
				accountLabel={t('roles:giveRole.accountLabel')}
				accountPlaceholder={t('roles:giveRole.accountPlaceholder')}
				buttonConfirmEnable={isValid}
				control={control}
				onConfirm={onOpen}
				options={fakeOptions}
				selectorLabel={t('roles:giveRole.selectLabel')}
				selectorPlaceholder={t('roles:giveRole.selectPlaceholder')}
				title={t('roles:give')}
			>
				{role?.label === supplier && renderSupplierQuantity()}
			</RoleLayout>
			<ModalsHandler
				errorNotificationTitle={t('roles:giveRole.modalErrorTitle')}
				errorNotificationDescription={t('roles:giveRole.modalErrorDescription')}
				modalActionProps={{
					isOpen,
					onClose,
					title: t('roles:giveRole.modalActionTitle'),
					confirmButtonLabel: t('roles:giveRole.modalActionConfirmButton'),
					onConfirm: handleSubmit,
				}}
				ModalActionChildren={
					<DetailsReview title={t('roles:giveRole.modalActionSubtitle')} details={details} />
				}
				successNotificationTitle={t('roles:giveRole.modalSuccessTitle')}
			/>
		</>
	);
};

export default GiveRole;
