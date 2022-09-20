import { useDisclosure } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ModalActionProps } from '../../components/ModalAction';
import ModalAction from '../../components/ModalAction';
import ModalNotification from '../../components/ModalNotification';

export interface OperationModalActionProps
	extends Pick<ModalActionProps, 'title' | 'confirmButtonLabel' | 'isOpen' | 'onClose'> {
	onConfirm: ({ onSuccess, onError }: Record<'onSuccess' | 'onError', () => void>) => void;
}

export interface OperationModalsProps {
	ModalActionChildren: ReactNode;
	modalActionProps: OperationModalActionProps;
}

const OperationModals = ({ modalActionProps, ModalActionChildren }: OperationModalsProps) => {
	const { t } = useTranslation(['global', 'operations']);
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
				title={t('operations:modalSuccessTitle')}
				description={t('operations:modalSuccessDesc')}
				isOpen={isOpenModalSuccess}
				onClose={onCloseModalSuccess}
			/>
			<ModalNotification
				variant='error'
				title={t('operations:modalErrorTitle')}
				description={t('operations:modalErrorDesc')}
				isOpen={isOpenModalError}
				onClose={onCloseModalError}
			/>
		</>
	);
};

export default OperationModals;
