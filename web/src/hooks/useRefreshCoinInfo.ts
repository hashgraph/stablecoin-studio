/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStableCoinDetailsRequest } from 'hedera-stable-coin-sdk';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SDKService from '../services/SDKService';
import { walletActions, SELECTED_WALLET_COIN } from '../store/slices/walletSlice';

export const useRefreshCoinInfo = async (): Promise<void> => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const dispatch = useDispatch();
	useEffect(() => {
		getStableCoinDetails();
	}, [selectedStableCoin?.deleted, selectedStableCoin?.paused, selectedStableCoin?.tokenId]);

	const getStableCoinDetails = async () => {
		const resp = await SDKService.getStableCoinDetails(
			new GetStableCoinDetailsRequest({
				id: selectedStableCoin?.tokenId?.toString() ?? '',
			}),
		);
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
			}),
		);
	};
	// return stableCoinDetails;
};
