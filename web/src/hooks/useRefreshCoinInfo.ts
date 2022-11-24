/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStableCoinDetailsRequest, type IStableCoinDetail } from 'hedera-stable-coin-sdk';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SDKService from '../services/SDKService';
import { walletActions, SELECTED_WALLET_COIN } from '../store/slices/walletSlice';

export const useRefreshCoinInfo = async (): Promise<void> => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const dispatch = useDispatch();
	useEffect(() => {
		getStableCoinDetails();
	}, [selectedStableCoin?.deleted, selectedStableCoin?.paused, selectedStableCoin]);

	const getStableCoinDetails = async () => {
		const resp = await SDKService.getStableCoinDetails(
			new GetStableCoinDetailsRequest({
				id: selectedStableCoin?.tokenId ?? '',
			}),
		);
		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: resp?.tokenId,
				initialSupply: resp?.initialSupply,
				totalSupply: resp?.totalSupply,
				maxSupply: resp?.maxSupply,
				name: resp?.name,
				symbol: resp?.symbol,
				decimals: resp?.decimals,
				id: resp?.tokenId,
				treasuryId: resp?.treasuryId,
				autoRenewAccount: resp?.autoRenewAccount,
				memo: resp?.memo,
				paused: resp?.paused,
				deleted: resp?.deleted,
				adminKey: resp?.adminKey && JSON.parse(JSON.stringify(resp.adminKey)),
				kycKey: resp?.kycKey && JSON.parse(JSON.stringify(resp.kycKey)),
				freezeKey: resp?.freezeKey && JSON.parse(JSON.stringify(resp.freezeKey)),
				wipeKey: resp?.wipeKey && JSON.parse(JSON.stringify(resp.wipeKey)),
				supplyKey: resp?.supplyKey && JSON.parse(JSON.stringify(resp.supplyKey)),
			}),
		);
	};
	// return stableCoinDetails;
};
