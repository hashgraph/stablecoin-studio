import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import GridDirectAction from '../../components/GridDirectAction';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	SELECTED_WALLET_ACCOUNT_INFO
} from '../../store/slices/walletSlice';
import type { DirectActionProps } from '../../components/DirectAction';
import {
	Capabilities,
	Roles,
	PauseStableCoinRequest,
	DeleteStableCoinRequest,
} from 'hedera-stable-coin-sdk';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import SDKService from '../../services/SDKService';

const DangerZoneOperations = () => {
	const { t } = useTranslation('operations');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities: Capabilities[] | undefined = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	
	const [disabledFeatures, setDisabledFeatures] = useState({
		pause: false,
		delete: false,
		unpause: false,
	});
	const [errorPauseOperation, setErrorPauseOperation] = useState('');
	const [errorUnpauseOperation, setErrorUnpauseOperation] = useState('');
	const [errorDeleteOperation, setErrorDeleteOperation] = useState('');

	const [requestPause] = useState(
		new PauseStableCoinRequest({
			account: {
				accountId
			},
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			tokenId: selectedStableCoin?.tokenId ?? '',
			publicKey:{
				key:accountInfo.publicKey?.key??'',
				type:accountInfo.publicKey?.type ??'ED25519'
			}
		}),
	);
	const [requestDelete] = useState(
		new DeleteStableCoinRequest({
			account: {
				accountId,
			},
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			tokenId: selectedStableCoin?.tokenId ?? '',
			publicKey:{
				key:accountInfo.publicKey?.key??'',
				type:accountInfo.publicKey?.type ??'ED25519'
			}
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
				const myAccount = tokensAccountParsed.find((acc: IAccountToken) => acc.id === accountId);
				if (myAccount) {
					const externalToken = myAccount?.externalTokens.find(
						(coin: IExternalToken) => coin.id === selectedStableCoin?.tokenId,
					);
					if (externalToken) {
						isExternalToken = true;
						roles = externalToken.roles.map((role: string) => role);
					}
				}
			}
		}
		const areDisabled = {
			pause: !isExternalToken
				? (!capabilities?.includes(Capabilities.PAUSE) ||
						!capabilities?.includes(Capabilities.PAUSE_HTS)) &&
				  selectedStableCoin?.paused === 'PAUSED'
				: !roles.includes(Roles.PAUSE_ROLE) &&
				  !capabilities?.includes(Capabilities.PAUSE_HTS) &&
				  selectedStableCoin?.paused === 'PAUSED',
			unpause: !isExternalToken
				? (!capabilities?.includes(Capabilities.PAUSE) ||
						!capabilities?.includes(Capabilities.PAUSE_HTS)) &&
				  selectedStableCoin?.paused === 'UNPAUSED'
				: !roles.includes(Roles.PAUSE_ROLE) &&
				  !capabilities?.includes(Capabilities.PAUSE_HTS) &&
				  selectedStableCoin?.paused === 'UNPAUSED',
			delete: !isExternalToken
				? (!capabilities?.includes(Capabilities.DELETE) ||
						!capabilities?.includes(Capabilities.DELETE_HTS)) &&
				  !!selectedStableCoin?.deleted
				: !roles.includes(Roles.DELETE_ROLE) && !capabilities?.includes(Capabilities.DELETE_HTS),
		};

		setDisabledFeatures(areDisabled);
	};

	const handlePause: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.pause(requestPause);
			setDisabledFeatures({
				...disabledFeatures,
				pause: !disabledFeatures.pause,
				unpause: !disabledFeatures.unpause,
			});
			onSuccess();
		} catch (error: any) {
			setErrorPauseOperation(error.toString());
			onError();
		}
	};
	const handleUnpause: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
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
			setErrorUnpauseOperation(error.toString());
			onError();
		}
	};

	const handleDelete: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.delete(requestDelete);
			onSuccess();
		} catch (error: any) {
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
			operationTranslate: 'pause',
		},
		{
			icon: 'Play',
			handleAction: handleUnpause,
			title: t('dangerZone.unpauseOperation'),
			isDisabled: disabledFeatures?.unpause,
			errorNotification: errorUnpauseOperation,
			operationTranslate: 'unpause',
		},
		{
			icon: 'Trash',
			handleAction: handleDelete,
			title: t('dangerZone.deleteOperation'),
			isDisabled: disabledFeatures?.delete,
			errorNotification: errorDeleteOperation,
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
