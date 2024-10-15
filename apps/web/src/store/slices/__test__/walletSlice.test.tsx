import { configureStore } from '@reduxjs/toolkit';
import { walletSlice, getStableCoinList, getExternalTokenList, initialState } from '../walletSlice';
import SDKService from '../../../services/SDKService';
import { ConnectionState, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';

const store = configureStore({ reducer: walletSlice.reducer });

describe(`<${walletSlice.name} />`, () => {
	describe('reducers', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		test('should post data getStableCoinList', async () => {
			const coins = {
				coins: [
					{
						symbol: 'TEST',
						id: 'id',
					},
				],
			};
			jest.spyOn(SDKService, 'getStableCoins').mockResolvedValueOnce(coins);
			await store.dispatch(getStableCoinList('0.0.12345'));
			expect(store.getState().stableCoinList).toEqual(coins);
		});

		test('should post data getStableCoinList empty', async () => {
			const coins = {
				coins: [],
			};
			jest.spyOn(SDKService, 'getStableCoins').mockImplementation(() => {
				throw new Error();
			});
			await store.dispatch(getStableCoinList('0.0.12345'));
			expect(store.getState().stableCoinList).toEqual(coins);
		});

		test('should post data getStableCoinList rejected', async () => {
			const coins = {
				coins: [],
			};
			jest.spyOn(SDKService, 'getStableCoins').mockResolvedValueOnce(coins);
			await store.dispatch(getStableCoinList('0.0.12345'));
			expect(store.getState().stableCoinList).toEqual(coins);
		});

		test('should post data getExternalTokenList', async () => {
			const externalTokens = [
				{
					id: '0.0.12345',
					symbol: 'symbol',
				},
			];
			localStorage.setItem(
				'tokensAccount',
				JSON.stringify([
					{
						id: '0.0.12345',
						externalTokens,
					},
				]),
			);

			await store.dispatch(getExternalTokenList('0.0.12345'));
			expect(store.getState().externalTokenList).toEqual(externalTokens);
		});

		it('Should initially set wallet to an empty object', () => {
			expect(store.getState().data).toEqual(undefined);
		});

		it('Should be able to setLastWallet', async () => {
			store.dispatch(walletSlice.actions.setLastWallet(SupportedWallets.HASHPACK));

			expect(store.getState().lastWallet).toEqual(SupportedWallets.HASHPACK);
			expect(localStorage.lastWallet).toEqual(SupportedWallets.HASHPACK);
		});

		it('Should be able to setData', async () => {
			const account = 'account';
			store.dispatch(walletSlice.actions.setData({ account }));

			expect(store.getState().data?.account).toEqual(account);
		});

		it('Should be able to setAccount', async () => {
			const account = 'account';
			store.dispatch(walletSlice.actions.setAccount(account));

			expect(store.getState().data?.account).toEqual(account);
		});

		it('Should be able to setSelectedStableCoin', async () => {
			const tokenId = 'tokenId';
			store.dispatch(walletSlice.actions.setSelectedStableCoin({ tokenId }));

			expect(store.getState().selectedStableCoin?.tokenId).toEqual(tokenId);
		});

		it('Should be able to setSelectedStableCoinProxyConfig', async () => {
			const implementationAddress = 'tokenId';
			const owner = '';
			store.dispatch(
				walletSlice.actions.setSelectedStableCoinProxyConfig({ implementationAddress, owner }),
			);

			expect(store.getState().selectedStableCoinProxyConfig?.implementationAddress).toEqual(
				implementationAddress,
			);
			expect(store.getState().selectedStableCoinProxyConfig?.owner).toEqual(owner);
		});

		it('Should be able to setSelectedNetworkFactoryProxyConfig', async () => {
			const implementationAddress = 'tokenId';
			const owner = '';
			store.dispatch(
				walletSlice.actions.setSelectedNetworkFactoryProxyConfig({ implementationAddress, owner }),
			);

			expect(store.getState().selectedNetworkFactoryProxyConfig?.implementationAddress).toEqual(
				implementationAddress,
			);
			expect(store.getState().selectedNetworkFactoryProxyConfig?.owner).toEqual(owner);
		});

		it('Should be able to setSelectingStableCoin', async () => {
			store.dispatch(walletSlice.actions.setSelectingStableCoin(true));

			expect(store.getState().selectingStableCoin).toEqual(true);
		});

		it('Should be able to setStableCoinList', async () => {
			const coins = {
				coins: [
					{
						symbol: 'TEST',
						id: 'id',
					},
				],
			};
			store.dispatch(walletSlice.actions.setStableCoinList({ coins }));

			expect(store.getState().stableCoinList?.coins).toEqual(coins);
		});

		it('Should be able to setExternalTokenList', async () => {
			const externalTokenList = {
				symbol: 'TEST',
				id: 'id',
				roles: [],
			};

			store.dispatch(walletSlice.actions.setExternalTokenList([externalTokenList]));

			expect(store.getState().externalTokenList?.[0].symbol).toEqual(externalTokenList.symbol);
			expect(store.getState().externalTokenList?.[0].id).toEqual(externalTokenList.id);
		});

		it('Should be able to setHasWalletExtension', async () => {
			store.dispatch(walletSlice.actions.setHasWalletExtension(SupportedWallets.HASHPACK));

			expect(store.getState().foundWallets?.[0]).toEqual(SupportedWallets.HASHPACK);
			expect(store.getState().hasWalletExtension).toEqual(true);
		});

		it('Should be able to setCapabilities', async () => {
			const stableCoinCapabilities = {
				coin: {
					name: 'name',
					symbol: 'Test',
					decimals: 6,
				},
				account: {
					id: 'id',
				},
				capabilities: [],
			};

			store.dispatch(walletSlice.actions.setCapabilities(stableCoinCapabilities));

			expect(store.getState().capabilities).toEqual(stableCoinCapabilities);
		});

		it('Should be able to setAccountInfo', async () => {
			const id = 'id';
			store.dispatch(walletSlice.actions.setAccountInfo({ id }));

			expect(store.getState().accountInfo.id).toEqual(id);
		});

		it('Should be able to setStatus', async () => {
			const status = ConnectionState.Connected;
			store.dispatch(walletSlice.actions.setStatus(status));

			expect(store.getState().status).toEqual(status);
		});

		it('Should be able to setPausedToken', async () => {
			const pausedToken = true;
			store.dispatch(walletSlice.actions.setPausedToken(pausedToken));

			expect(store.getState().pausedToken).toEqual(pausedToken);
		});

		it('Should be able to setDeletedToken', async () => {
			const deletedToken = true;
			store.dispatch(walletSlice.actions.setDeletedToken(deletedToken));

			expect(store.getState().deletedToken).toEqual(deletedToken);
		});

		it('Should be able to setNetwork', async () => {
			const network = 'testnet';
			store.dispatch(walletSlice.actions.setNetwork(network));

			expect(store.getState().network).toEqual(network);
		});

		it('Should be able to setNetworkRecognized', async () => {
			const networkRecognized = true;
			store.dispatch(walletSlice.actions.setNetworkRecognized(networkRecognized));

			expect(store.getState().networkRecognized).toEqual(networkRecognized);
		});

		it('Should be able to setIsProxyOwner', async () => {
			const isProxyOwner = true;
			store.dispatch(walletSlice.actions.setIsProxyOwner(isProxyOwner));

			expect(store.getState().isProxyOwner).toEqual(isProxyOwner);
		});

		it('Should be able to setIsFactoryProxyOwner', async () => {
			const isFactoryProxyOwner = true;
			store.dispatch(walletSlice.actions.setIsFactoryProxyOwner(isFactoryProxyOwner));

			expect(store.getState().isFactoryProxyOwner).toEqual(isFactoryProxyOwner);
		});

		it('Should be able to setAccountRecognized', async () => {
			const accountRecognized = true;
			store.dispatch(walletSlice.actions.setAccountRecognized(accountRecognized));

			expect(store.getState().accountRecognized).toEqual(accountRecognized);
		});

		it('Should be able to setFactoryId', async () => {
			const factoryId = '0.0.12345';
			store.dispatch(walletSlice.actions.setFactoryId(factoryId));

			expect(store.getState().factoryId).toEqual(factoryId);
		});

		it('Should be able to clearData', async () => {
			store.dispatch(walletSlice.actions.clearData());

			expect(store.getState().data).toEqual(initialState.data);
			expect(store.getState().lastWallet).toEqual(undefined);
			expect(store.getState().accountInfo).toEqual(initialState.accountInfo);
			expect(store.getState().capabilities).toEqual(initialState.capabilities);
			expect(store.getState().status).toEqual(ConnectionState.Disconnected);
			expect(store.getState().roles).toEqual(undefined);
			expect(store.getState().network).toEqual(initialState.network);
			expect(store.getState().networkRecognized).toEqual(initialState.networkRecognized);
			expect(store.getState().accountRecognized).toEqual(initialState.accountRecognized);
			expect(store.getState().factoryId).toEqual(initialState.factoryId);
			expect(store.getState().selectingStableCoin).toEqual(initialState.selectingStableCoin);
		});

		it('Should be able to setRoles', async () => {
			store.dispatch(walletSlice.actions.setRoles(['role']));

			expect(store.getState().roles?.[0]).toEqual('role');
		});

		it('Should be able to clearSelectedStableCoin', async () => {
			store.dispatch(walletSlice.actions.clearSelectedStableCoin());

			expect(store.getState().selectedStableCoin).toEqual(initialState.selectedStableCoin);
			expect(store.getState().isProxyOwner).toEqual(initialState.isProxyOwner);
		});

		it('Should be able to clearSelectedStableCoinProxyConfig', async () => {
			store.dispatch(walletSlice.actions.clearSelectedStableCoinProxyConfig());

			expect(store.getState().selectedStableCoinProxyConfig).toEqual(
				initialState.selectedStableCoinProxyConfig,
			);
			expect(store.getState().isProxyOwner).toEqual(initialState.isProxyOwner);
		});

		it('Should be able to clearSelectedNetworkFactoryProxyConfig', async () => {
			store.dispatch(walletSlice.actions.clearSelectedNetworkFactoryProxyConfig());

			expect(store.getState().selectedNetworkFactoryProxyConfig).toEqual(
				initialState.selectedNetworkFactoryProxyConfig,
			);
			expect(store.getState().isProxyOwner).toEqual(initialState.isProxyOwner);
		});

		it('Should be able to reset', async () => {
			store.dispatch(walletSlice.actions.reset());

			expect(store.getState()).toEqual(initialState);
		});
	});
});
