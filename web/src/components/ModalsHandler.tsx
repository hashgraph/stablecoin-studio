import { useDisclosure } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ModalAction from './ModalAction';
import type { ModalActionProps } from './ModalAction';
import ModalNotification from './ModalNotification';

export interface ModalsHandlerActionsProps
	extends Pick<ModalActionProps, 'title' | 'confirmButtonLabel' | 'isOpen' | 'onClose'> {
	onConfirm: ({ onSuccess, onError }: Record<'onSuccess' | 'onError', () => void>) => void;
}

export interface ModalsHandlerProps {
	errorNotificationDescription?: string;
	errorNotificationTitle: string;
	errorTransactionUrl?:string;
	ModalActionChildren: ReactNode;
	modalActionProps: ModalsHandlerActionsProps;
	successNotificationDescription?: string;
	successNotificationTitle: string;
	handleOnCloseModalSuccess?: () => void;
	handleOnCloseModalError?: () => void;
}

const ModalsHandler = (props: ModalsHandlerProps) => {
	const {
		errorNotificationDescription,
		errorNotificationTitle,
		errorTransactionUrl,
		modalActionProps,
		ModalActionChildren,
		successNotificationDescription,
		successNotificationTitle,
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
		</>
	);
};

export default ModalsHandler;
