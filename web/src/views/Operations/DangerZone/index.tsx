import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../../components/BaseContainer';
import GridDirectAction from '../../../components/GridDirectAction';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
} from '../../../store/slices/walletSlice';
import type { DirectActionProps } from '../../../components/DirectAction';
import type { StableCoinCapabilities } from 'hedera-stable-coin-sdk';
import {
	PauseRequest,
	DeleteRequest,
	Operation,
	Access,
	StableCoinRole,
} from 'hedera-stable-coin-sdk';
import type { IAccountToken } from '../../../interfaces/IAccountToken';
import type { IExternalToken } from '../../../interfaces/IExternalToken';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import SDKService from '../../../services/SDKService';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../../Router/NamedRoutes';
import { RouterManager } from '../../../Router/RouterManager';

const DangerZoneOperations = () => {
	const { t } = useTranslation('operations');

	const navigate = useNavigate();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities: StableCoinCapabilities | undefined = useSelector(
		SELECTED_WALLET_CAPABILITIES,
	);

	const [disabledFeatures, setDisabledFeatures] = useState({
		pause: false,
		delete: false,
		unpause: false,
	});
	const [errorPauseOperation, setErrorPauseOperation] = useState('');
	const [errorUnpauseOperation, setErrorUnpauseOperation] = useState('');
	const [errorDeleteOperation, setErrorDeleteOperation] = useState('');
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();

	const [requestPause] = useState(
		new PauseRequest({
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
		}),
	);
	const [requestDelete] = useState(
		new DeleteRequest({
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
		}),
	);
	useEffect(() => {
		if (selectedStableCoin) {
			getAvailableFeatures();
		}
	}, [selectedStableCoin]);

	const getAvailableFeatures = () => {
		let isExternalToken = false;
		let roles = [];
		const tokensAccount = localStorage?.tokensAccount;
		if (tokensAccount) {
			const tokensAccountParsed = JSON.parse(tokensAccount);
			if (tokensAccountParsed) {
				const myAccount = tokensAccountParsed.find(
					(acc: IAccountToken) => acc.id === accountId?.toString(),
				);
				if (myAccount) {
					const externalToken = myAccount?.externalTokens.find(
						(coin: IExternalToken) => coin.id === selectedStableCoin?.tokenId?.toString(),
					);
					if (externalToken) {
						isExternalToken = true;
						roles = externalToken.roles.map((role: string) => role);
					}
				}
			}
		}

		const operations = capabilities?.capabilities.map((x) => x.operation);
		const canPause = operations?.includes(Operation.PAUSE);
		const areDisabled: {
			pause: boolean;
			unpause: boolean;
			delete: boolean;
		} = {
			pause: !isExternalToken
				? (!canPause || (canPause && selectedStableCoin?.paused)) ?? false
				: (!operations?.includes(Operation.PAUSE) ||
				  (operations?.includes(Operation.PAUSE) && (getAccessByOperation(Operation.PAUSE) !== Access.HTS) && 
				   !roles.includes(StableCoinRole.PAUSE_ROLE)) &&
				   selectedStableCoin?.paused) ?? 
				   false,
			unpause: !isExternalToken
				? (!canPause || (canPause && !selectedStableCoin?.paused)) ?? false
				: (!operations?.includes(Operation.PAUSE) ||
				  (operations?.includes(Operation.PAUSE) && (getAccessByOperation(Operation.PAUSE) !== Access.HTS) && 
				   !roles.includes(StableCoinRole.PAUSE_ROLE)) &&
				   !selectedStableCoin?.paused) ??
				   false,
			delete: !isExternalToken
				? (!canPause || (selectedStableCoin?.paused || selectedStableCoin?.deleted)) ?? false
				: (!operations?.includes(Operation.DELETE) ||
				  (operations?.includes(Operation.DELETE) && (getAccessByOperation(Operation.DELETE) !== Access.HTS) && 
				   !roles.includes(StableCoinRole.DELETE_ROLE)) &&
				  (!selectedStableCoin?.paused || !selectedStableCoin?.deleted)) ?? 
				false
		};

		setDisabledFeatures(areDisabled);

		function getAccessByOperation(operation: Operation): Access | undefined {
			return capabilities?.capabilities.filter((capability) => {
				return (capability.operation === operation);
			})[0].access ?? undefined;
		}
	};

	const handlePause: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError, onLoading }) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.pause(requestPause);
			setDisabledFeatures({
				...disabledFeatures,
				pause: !disabledFeatures.pause,
				unpause: !disabledFeatures.unpause,
				delete: true,
			});
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorPauseOperation(error.toString());
			onError();
		}
	};

	const handleUnpause: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError, onLoading }) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.unpause(requestPause);
			setDisabledFeatures({
				...disabledFeatures,
				pause: !disabledFeatures.pause,
				unpause: !disabledFeatures.unpause,
			});
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorUnpauseOperation(error.toString());
			onError();
		}
	};

	const handleDelete: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError, onLoading }) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.delete(requestDelete);
			setDisabledFeatures({
				...disabledFeatures,
				pause: true,
				unpause: true,
				delete: true,
			});
			onSuccess();
			RouterManager.to(navigate, NamedRoutes.Operations);
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorDeleteOperation(error.toString());
			onError();
		}
	};

	const directActions: DirectActionProps[] = [
		{
			icon: 'Pause',
			handleAction: handlePause,
			title: t('dangerZone.pauseOperation'),
			isDisabled: disabledFeatures?.pause,
			errorNotification: errorPauseOperation,
			errorTransactionUrl,
			operationTranslate: 'pause',
		},
		{
			icon: 'Play',
			handleAction: handleUnpause,
			title: t('dangerZone.unpauseOperation'),
			isDisabled: disabledFeatures?.unpause,
			errorNotification: errorUnpauseOperation,
			errorTransactionUrl,
			operationTranslate: 'unpause',
		},
		{
			icon: 'Trash',
			handleAction: handleDelete,
			title: t('dangerZone.deleteOperation'),
			isDisabled: disabledFeatures?.delete,
			errorNotification: errorDeleteOperation,
			errorTransactionUrl,
			operationTranslate: 'delete',
		},
	];

	return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				<GridDirectAction directActions={directActions} />
			</Box>
		</BaseContainer>
	);
};

export default DangerZoneOperations;
