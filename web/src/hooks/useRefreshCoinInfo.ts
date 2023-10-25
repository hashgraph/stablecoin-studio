/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetProxyConfigRequest, GetStableCoinDetailsRequest } from '@hashgraph/stablecoin-npm-sdk';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SDKService from '../services/SDKService';
import {
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../store/slices/walletSlice';

export const useRefreshCoinInfo = () => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const [lastId, setLastId] = useState<string>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const dispatch = useDispatch();
	useEffect(() => {
		if (!lastId || lastId !== selectedStableCoin?.tokenId?.toString()) {
			getStableCoinDetails();
		}
	}, [
		selectedStableCoin?.deleted,
		selectedStableCoin?.paused,
		selectedStableCoin?.tokenId?.toString(),
	]);
	const getStableCoinDetails = async () => {
		setIsLoading(true);
		const resp = await SDKService.getStableCoinDetails(
			new GetStableCoinDetailsRequest({
				id: selectedStableCoin?.tokenId?.toString() ?? '',
			}),
		);
		const proxyConfig = await SDKService.getProxyConfig(
			new GetProxyConfigRequest({
				tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			}),
		);
		setLastId(resp?.tokenId?.toString());
		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: resp?.tokenId?.toString(),
				initialSupply: resp?.initialSupply,
				totalSupply: resp?.totalSupply,
				maxSupply: resp?.maxSupply,
				name: resp?.name,
				symbol: resp?.symbol,
				decimals: resp?.decimals,
				metadata: resp?.metadata,
				id: resp?.tokenId?.toString(),
				treasury: resp?.treasury?.toString(),
				autoRenewAccount: resp?.autoRenewAccount?.toString(),
				autoRenewPeriod: resp?.autoRenewPeriod?.toString(),
				expirationTimestamp: resp?.expirationTimestamp?.toString(),
				proxyAddress: resp?.proxyAddress?.toString(),
				proxyAdminAddress: resp?.proxyAdminAddress?.toString(),
				paused: resp?.paused,
				deleted: resp?.deleted,
				adminKey: resp?.adminKey?.toString() && JSON.parse(JSON.stringify(resp.adminKey)),
				kycKey: resp?.kycKey?.toString() && JSON.parse(JSON.stringify(resp.kycKey)),
				freezeKey: resp?.freezeKey?.toString() && JSON.parse(JSON.stringify(resp.freezeKey)),
				wipeKey: resp?.wipeKey?.toString() && JSON.parse(JSON.stringify(resp.wipeKey)),
				supplyKey: resp?.supplyKey?.toString() && JSON.parse(JSON.stringify(resp.supplyKey)),
				feeScheduleKey:
					resp?.feeScheduleKey?.toString() && JSON.parse(JSON.stringify(resp.feeScheduleKey)),
				pauseKey: resp?.pauseKey?.toString() && JSON.parse(JSON.stringify(resp.pauseKey)),
				reserveAmount: resp?.reserveAmount?.toString(),
				reserveAddress: resp?.reserveAddress?.toString(),
				customFees: resp?.customFees && JSON.parse(JSON.stringify(resp.customFees)),
			}),
		);
		dispatch(
			walletActions.setSelectedStableCoinProxyConfig({
				owner: proxyConfig?.owner?.toString(),
				implementationAddress: proxyConfig?.implementationAddress?.toString(),
				pendingOwner: proxyConfig?.pendingOwner?.toString(),
			}),
		);
		dispatch(
			walletActions.setIsProxyOwner(proxyConfig?.owner?.toString() === accountInfo?.id?.toString()),
		);
		dispatch(
			walletActions.setIsPendingOwner(
				proxyConfig?.pendingOwner?.toString() !== proxyConfig?.owner?.toString() &&
					proxyConfig?.pendingOwner?.toString() !== accountInfo?.id?.toString() &&
					proxyConfig?.pendingOwner?.toString() !== '0.0.0' &&
					proxyConfig?.pendingOwner?.toString() !== '' &&
					proxyConfig?.pendingOwner?.toString() !== undefined,
			),
		);
		dispatch(
			walletActions.setIsAcceptOwner(
				proxyConfig?.pendingOwner?.toString() === accountInfo?.id?.toString(),
			),
		);
		setIsLoading(false);
	};

	return { getStableCoinDetails, isLoading };
};
