import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import RoleLayout from './RoleLayout';
import ModalsHandler from '../../components/ModalsHandler';
import DetailsReview from '../../components/DetailsReview';
import { fakeOptions, fields } from './constans';
import type { Detail } from '../../components/DetailsReview';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';

const RevokeRole = () => {
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
	const role = watch(fields.role);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSubmit: ModalsHandlerActionsProps['onConfirm'] = ({ onSuccess, onError }) => {
		console.log(`Revoke role ${role.label} to account ${account}`);

		onSuccess();
	};

	const getDetails: () => Detail[] = () => {
		const details: Detail[] = [
			{
				label: t('roles:revokeRole.modalActionDetailAccount'),
				value: account as string,
			},
			{
				label: t('roles:revokeRole.modalActionDetailRole'),
				value: role?.label,
				valueInBold: true,
			},
		];

		return details;
	};

	const details = getDetails();

	return (
		<>
			<RoleLayout
				accountLabel={t('roles:revokeRole.accountLabel')}
				accountPlaceholder={t('roles:revokeRole.accountPlaceholder')}
				buttonConfirmEnable={isValid}
				control={control}
				onConfirm={onOpen}
				options={fakeOptions}
				selectorLabel={t('roles:revokeRole.selectLabel')}
				selectorPlaceholder={t('roles:revokeRole.selectPlaceholder')}
				title={t('roles:revoke')}
			/>
			<ModalsHandler
				errorNotificationTitle={t('roles:revokeRole.modalErrorTitle')}
				errorNotificationDescription={t('roles:revokeRole.modalErrorDescription')}
				modalActionProps={{
					isOpen,
					onClose,
					title: t('roles:revokeRole.modalActionTitle'),
					confirmButtonLabel: t('roles:revokeRole.modalActionConfirmButton'),
					onConfirm: handleSubmit,
				}}
				ModalActionChildren={
					<DetailsReview title={t('roles:revokeRole.modalActionSubtitle')} details={details} />
				}
				successNotificationTitle={t('roles:revokeRole.modalSuccessTitle')}
			/>
		</>
	);
};

export default RevokeRole;
