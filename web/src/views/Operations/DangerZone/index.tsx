import { Box, Heading, Stack, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../../components/BaseContainer';
import GridDirectAction from '../../../components/GridDirectAction';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	SELECTED_TOKEN_ROLES,
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	walletActions,
} from '../../../store/slices/walletSlice';
import type { DirectActionProps } from '../../../components/DirectAction';
import type { StableCoinCapabilities } from '@hashgraph-dev/stablecoin-npm-sdk';
import {
	PauseRequest,
	DeleteRequest,
	Operation,
	Access,
	StableCoinRole,
} from '@hashgraph-dev/stablecoin-npm-sdk';
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
	const dispatch = useDispatch();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities: StableCoinCapabilities | undefined = useSelector(
		SELECTED_WALLET_CAPABILITIES,
	);
	const roles = useSelector(SELECTED_TOKEN_ROLES)!;

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

	const [isPaused, setPaused] = useState(false);
	const [isDeleted, setDeleted] = useState(false);

	useEffect(() => {
		if (selectedStableCoin) {
			checkTokenStatus();
			getAvailableFeatures();
		}
	}, [selectedStableCoin]);

	const checkTokenStatus = async () => {
		setPaused(selectedStableCoin?.paused || false);
		setDeleted(selectedStableCoin?.deleted || false);
		if (selectedStableCoin?.deleted) {
			RouterManager.to(navigate, NamedRoutes.Operations);
		}
	};

	const getAvailableFeatures = () => {
		let isExternalToken = false;
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
						(operations?.includes(Operation.PAUSE) &&
							getAccessByOperation(Operation.PAUSE) !== Access.HTS &&
							!roles.includes(StableCoinRole.PAUSE_ROLE)) ||
						selectedStableCoin?.paused) ??
				  false,
			unpause: !isExternalToken
				? (!canPause || (canPause && !selectedStableCoin?.paused)) ?? false
				: (!operations?.includes(Operation.PAUSE) ||
						(operations?.includes(Operation.PAUSE) &&
							getAccessByOperation(Operation.PAUSE) !== Access.HTS &&
							!roles.includes(StableCoinRole.PAUSE_ROLE)) ||
						!selectedStableCoin?.paused) ??
				  false,
			delete: !isExternalToken
				? (!canPause || selectedStableCoin?.paused || selectedStableCoin?.deleted) ?? false
				: (!operations?.includes(Operation.DELETE) ||
						(operations?.includes(Operation.DELETE) &&
							getAccessByOperation(Operation.DELETE) !== Access.HTS &&
							!roles.includes(StableCoinRole.DELETE_ROLE)) ||
						selectedStableCoin?.paused ||
						selectedStableCoin?.deleted) ??
				  false,
		};

		setDisabledFeatures(areDisabled);

		function getAccessByOperation(operation: Operation): Access | undefined {
			return (
				capabilities?.capabilities.filter((capability) => {
					return capability.operation === operation;
				})[0].access ?? undefined
			);
		}
	};

	const handlePause: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.pause(requestPause);
			dispatch(walletActions.setPausedToken(true));
			dispatch(walletActions.setSelectedStableCoin({ ...selectedStableCoin, paused: true }));
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorPauseOperation(error.message);
			onError();
		}
	};

	const handleUnpause: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.unpause(requestPause);
			dispatch(walletActions.setPausedToken(false));
			dispatch(walletActions.setSelectedStableCoin({ ...selectedStableCoin, paused: false }));
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorUnpauseOperation(error.message);
			onError();
		}
	};

	const handleDelete: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.delete(requestDelete);
			onSuccess();
			dispatch(walletActions.setDeletedToken(true));
			dispatch(walletActions.setSelectedStableCoin({ ...selectedStableCoin, deleted: true }));
			RouterManager.to(navigate, NamedRoutes.Operations);
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorDeleteOperation(error.message);
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

	const filteredDirectActions = directActions.filter((access) => !access.isDisabled);

	return (
		<Stack h='full'>
			<HStack spacing={6} w='full'>
				{isPaused && (
					<Text
						fontSize='16px'
						color='brand.secondary'
						fontWeight={700}
						align='right'
						w='full'
						as='i'
						data-testid='paused-subtitle'
					>
						{t('pausedToken')}
					</Text>
				)}
				{isDeleted && (
					<Text
						fontSize='16px'
						color='brand.secondary'
						fontWeight={700}
						align='right'
						w='full'
						as='i'
						data-testid='deleted-subtitle'
					>
						{t('deletedToken')}
					</Text>
				)}
			</HStack>
			<BaseContainer title={t('title')}>
				<Box p={{ base: 4, md: '128px' }}>
					<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
						{t('subtitle')}
					</Heading>
					<GridDirectAction directActions={filteredDirectActions} />
				</Box>
			</BaseContainer>
		</Stack>
	);
};

export default DangerZoneOperations;
