import { useDisclosure } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ModalAction from './ModalAction';
import type { ModalActionProps } from './ModalAction';
import ModalNotification from './ModalNotification';

export interface ModalsHandlerActionsProps
	extends Pick<ModalActionProps, 'title' | 'confirmButtonLabel' | 'isOpen' | 'onClose'> {
	onConfirm: ({ onSuccess, onError, onWarning }: Record<'onSuccess' | 'onError' | 'onWarning', () => void>) => void;
}

export interface ModalsHandlerProps {
	errorNotificationDescription?: string;
	errorNotificationTitle: string;
	errorTransactionUrl?:string;
	warningNotificationDescription?: string;
	warningNotificationTitle?: string;
	ModalActionChildren: ReactNode;
	modalActionProps: ModalsHandlerActionsProps;
	successNotificationDescription?: string;
	successNotificationTitle: string;
	handleOnCloseModalSuccess?: () => void;
	handleOnCloseModalError?: () => void;
	handleOnCloseModalWarning?: () => void;
}

const ModalsHandler = (props: ModalsHandlerProps) => {
	const {
		errorNotificationDescription,
		errorNotificationTitle,
		errorTransactionUrl,
		warningNotificationDescription,
		warningNotificationTitle,
		modalActionProps,
		ModalActionChildren,
		successNotificationDescription,
		successNotificationTitle,
		handleOnCloseModalWarning,
		handleOnCloseModalSuccess,
		handleOnCloseModalError
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
	const {
		isOpen: isOpenModalWarning,
		onOpen: onOpenModalWarning,
		onClose: onCloseModalWarning,
	} = useDisclosure();

	return (
		<>
			<ModalAction
				{...modalActionProps}
				onConfirm={() => {
					modalActionProps.onClose();
					modalActionProps.onConfirm({ onSuccess: onOpenModalSuccess, onError: onOpenModalError, onWarning: onOpenModalWarning });
				}}
				cancelButtonLabel={t('global:common.goBack')}
			>
				{ModalActionChildren}
			</ModalAction>
			<ModalNotification
				variant='success'
				title={successNotificationTitle}
				description={successNotificationDescription}
				isOpen={isOpenModalSuccess}
				onClose={handleOnCloseModalSuccess ?? onCloseModalSuccess}
			/>
			<ModalNotification
				variant='error'
				title={errorNotificationTitle}
				description={errorNotificationDescription}
				isOpen={isOpenModalError}
				onClose={handleOnCloseModalError ?? onCloseModalError}
				errorTransactionUrl={errorTransactionUrl}
			/>
			<ModalNotification
				variant='warning'
				title={warningNotificationTitle ?? 'Warning'}
				description={warningNotificationDescription}
				isOpen={isOpenModalWarning}
				onClose={handleOnCloseModalWarning ?? onCloseModalWarning}
			/>
		</>
	);
};

export default ModalsHandler;
