import { useDisclosure } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ModalAction, { ModalActionProps } from '../../components/ModalAction';
import ModalNotification from '../../components/ModalNotification';

export interface RoleModalActionProps
	extends Pick<ModalActionProps, 'title' | 'confirmButtonLabel' | 'isOpen' | 'onClose'> {
	onConfirm: ({ onSuccess, onError }: Record<'onSuccess' | 'onError', () => void>) => void;
}

export interface RoleModalsProps {
	errorNotificationDescription?: string;
	errorNotificationTitle: string;
	ModalActionChildren: ReactNode;
	modalActionProps: RoleModalActionProps;
	successNotificationDescription?: string;
	successNotificationTitle: string;
}

const RoleModals = (props: RoleModalsProps) => {
	const {
		errorNotificationDescription,
		errorNotificationTitle,
		modalActionProps,
		ModalActionChildren,
		successNotificationTitle,
	} = props;
	const { t } = useTranslation(['global', 'roles']);
	const {
		isOpen: isOpenModalSuccess,
		onOpen: onOpenModalSuccess,
		onClose: onCloseModalSuccess,
	} = useDisclosure();
	const {
		isOpen: isOpenModalError,
		onOpen: onOpenModalError,
		onClose: onCloseModalError,
	} = useDisclosure();

	return (
		<>
			<ModalAction
				{...modalActionProps}
				onConfirm={() => {
					modalActionProps.onClose();
					modalActionProps.onConfirm({ onSuccess: onOpenModalSuccess, onError: onOpenModalError });
				}}
				cancelButtonLabel={t('global:common.goBack')}
			>
				{ModalActionChildren}
			</ModalAction>
			<ModalNotification
				variant='success'
				// title={t('roles:giveRole.modalSuccessTitle')}
				title={successNotificationTitle}
				isOpen={isOpenModalSuccess}
				onClose={onCloseModalSuccess}
			/>
			<ModalNotification
				variant='error'
				// title={t('roles:giveRole.modalErrorTitle')}
				// description={t('roles:giveRole.modalErrorDescription')}
				title={errorNotificationTitle}
				description={errorNotificationDescription}
				isOpen={isOpenModalError}
				onClose={onCloseModalError}
			/>
		</>
	);
};

export default RoleModals;
