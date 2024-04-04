import { useDisclosure } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ModalAction from './ModalAction';
import type { ModalActionProps } from './ModalAction';
import ModalNotification from './ModalNotification';
import { SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useSelector } from 'react-redux';
import { LAST_WALLET_SELECTED } from '../store/slices/walletSlice';

export interface ModalsHandlerActionsProps
	extends Pick<ModalActionProps, 'title' | 'confirmButtonLabel' | 'isOpen' | 'onClose'> {
	onConfirm: ({
		onSuccess,
		onError,
		onWarning,
	}: Record<
		'onSuccess' | 'onError' | 'onWarning' | 'onLoading' | 'onCloseModalLoading',
		() => void
	>) => void;
}

export interface ModalsHandlerProps {
	errorNotificationDescription?: string | null;
	errorNotificationTitle: string | null;
	errorTransactionUrl?: string | null;
	warningNotificationDescription?: string | null;
	warningNotificationTitle?: string | null;
	ModalActionChildren: ReactNode;
	modalActionProps: ModalsHandlerActionsProps;
	successNotificationDescription?: string | null;
	successNotificationTitle: string | null;
	handleOnCloseModalSuccess?: () => void;
	handleOnCloseModalError?: () => void;
	handleOnCloseModalWarning?: () => void;
	handleOnCloseModalLoading?: () => void;
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
		handleOnCloseModalError,
		handleOnCloseModalLoading,
	} = props;
	const { t } = useTranslation(['global', 'roles']);
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);
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
	const {
		isOpen: isOpenModalLoading,
		onOpen: onOpenModalLoading,
		onClose: onCloseModalLoading,
	} = useDisclosure();

	const anyMessageOpen = isOpenModalError || isOpenModalSuccess || isOpenModalWarning;

	// TODO: add to language.json
	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? 'MultiSig transaction has been successfully created and is now awaiting signatures. Accounts have 180 seconds to sign the transaction.' // Customize this as needed
			: successNotificationDescription;

	return (
		<>
			<ModalAction
				{...modalActionProps}
				onConfirm={() => {
					modalActionProps.onClose();
					modalActionProps.onConfirm({
						onSuccess: onOpenModalSuccess,
						onError: onOpenModalError,
						onWarning: onOpenModalWarning,
						onLoading: onOpenModalLoading,
						onCloseModalLoading,
					});
				}}
				cancelButtonLabel={t('global:common.goBack')}
			>
				{ModalActionChildren}
			</ModalAction>
			<ModalNotification
				variant='loading'
				title='Loading'
				isOpen={isOpenModalLoading && !anyMessageOpen}
				onClose={handleOnCloseModalLoading ?? onCloseModalLoading}
			/>
			<ModalNotification
				variant='success'
				title={successNotificationTitle}
				description={successDescription}
				isOpen={isOpenModalSuccess}
				onClose={
					handleOnCloseModalSuccess ??
					(() => {
						onCloseModalSuccess();
						onCloseModalLoading();
					})
				}
			/>
			<ModalNotification
				variant='error'
				title={errorNotificationTitle}
				description={errorNotificationDescription}
				isOpen={isOpenModalError}
				onClose={
					handleOnCloseModalError ??
					(() => {
						onCloseModalError();
						onCloseModalLoading();
					})
				}
				errorTransactionUrl={errorTransactionUrl}
			/>
			<ModalNotification
				variant='warning'
				title={warningNotificationTitle ?? 'Warning'}
				description={warningNotificationDescription}
				isOpen={isOpenModalWarning}
				onClose={
					handleOnCloseModalWarning ??
					(() => {
						onCloseModalWarning();
						onCloseModalLoading();
					})
				}
			/>
		</>
	);
};

export default ModalsHandler;
