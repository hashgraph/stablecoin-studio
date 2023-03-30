/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStableCoinDetailsRequest } from '@hashgraph-dev/stablecoin-npm-sdk';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SDKService from '../services/SDKService';
import { walletActions, SELECTED_WALLET_COIN } from '../store/slices/walletSlice';

export const useRefreshCoinInfo = (): boolean => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
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
				id: resp?.tokenId?.toString(),
				treasury: resp?.treasury?.toString(),
				autoRenewAccount: resp?.autoRenewAccount?.toString(),
				proxyAddress: resp?.proxyAddress?.toString(),
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
				customFees: resp.customFees && JSON.parse(JSON.stringify(resp.customFees)),
			}),
		);
		setIsLoading(false);
	};

	return isLoading;
};
