import { Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import SearchSelectController from '../../components/Form/SearchSelectController';
import type { Option } from '../../components/Form/SelectController';
import SDKService from '../../services/SDKService';
import type { AppDispatch } from '../../store/store';
import {
	EXTERNAL_TOKEN_LIST,
	getStableCoinList,
	getExternalTokenList,
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	STABLE_COIN_LIST,
	walletActions,
	SELECTED_TOKEN_DELETED,
	SELECTED_TOKEN_PAUSED,
	SELECTED_NETWORK,
	SELECTED_WALLET_COIN_PROXY_CONFIG,
} from '../../store/slices/walletSlice';
import { RouterManager } from '../../Router/RouterManager';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import {
	GetStableCoinDetailsRequest,
	GetAccountInfoRequest,
	GetRolesRequest,
	GetProxyConfigRequest,
	GetFactoryProxyConfigRequest,
	Network,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import type { GroupBase, SelectInstance } from 'chakra-react-select';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import ModalNotification from '../../components/ModalNotification';

const CoinDropdown = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const location = useLocation();

	const searcheableRef = useRef<SelectInstance<unknown, boolean, GroupBase<unknown>>>(null);

	const stableCoinList = useSelector(STABLE_COIN_LIST);
	const externalTokenList = useSelector(EXTERNAL_TOKEN_LIST);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const network = useSelector(SELECTED_NETWORK);
	const proxyConfig = useSelector(SELECTED_WALLET_COIN_PROXY_CONFIG);

	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const tokenIsPaused = useSelector(SELECTED_TOKEN_PAUSED);
	const tokenIsDeleted = useSelector(SELECTED_TOKEN_DELETED);

	const [options, setOptions] = useState<Option[]>([]);
	const [success, setSuccess] = useState<boolean>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isLoadingImportToken, setLoadingImportToken] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [stableCoinListLoad, setStableCoinListLoad] = useState(false);

	const isInStableCoinNotSelected = !!matchPath(
		location.pathname,
		RouterManager.getUrl(NamedRoutes.StableCoinNotSelected),
	);

	useEffect(() => {
		if (selectedStableCoin) {
			getCapabilities();
		} else {
			searcheableRef.current?.clearValue();
		}
	}, [selectedStableCoin]);

	useEffect(() => {
		if (capabilities?.capabilities.length !== 0 && isInStableCoinNotSelected) {
			RouterManager.to(navigate, NamedRoutes.Operations);
		}
	}, [capabilities]);

	useEffect(() => {
		if (accountId) {
			dispatch(getStableCoinList(accountId.toString()))
				.unwrap()
				.then(() => setStableCoinListLoad(true))
				.catch(() => onOpen());
			dispatch(getExternalTokenList(accountId.toString()));
			getAccountInfo(accountId.toString());
		}
	}, [accountId, network]);

	useEffect(() => {
		formatOptionsStableCoins();
	}, [stableCoinList, externalTokenList, selectedStableCoin]);

	const getAccountInfo = async (id: string) => {
		const accountInfo = await SDKService.getAccountInfo(
			new GetAccountInfoRequest({
				account: {
					accountId: id,
				},
			}),
		);

		const factoryId = await Network.getFactoryAddress();

		if (factoryId) {
			const factoryProxyConfig = await SDKService.getFactoryProxyConfig(
				new GetFactoryProxyConfigRequest({
					factoryId,
				}),
			);
			dispatch(
				walletActions.setIsFactoryProxyOwner(
					factoryProxyConfig?.owner?.toString() === accountInfo?.id?.toString(),
				),
			);
			dispatch(
				walletActions.setIsFactoryPendingOwner(
					factoryProxyConfig?.pendingOwner?.toString() !== factoryProxyConfig?.owner?.toString() &&
						factoryProxyConfig?.pendingOwner?.toString() !== accountInfo?.id?.toString() &&
						factoryProxyConfig?.pendingOwner?.toString() !== '0.0.0' &&
						factoryProxyConfig?.pendingOwner?.toString() !== '' &&
						factoryProxyConfig?.pendingOwner?.toString() !== undefined,
				),
			);
			dispatch(
				walletActions.setIsFactoryAcceptOwner(
					factoryProxyConfig?.pendingOwner?.toString() === accountInfo?.id?.toString(),
				),
			);
		}

		dispatch(walletActions.setAccountInfo(accountInfo));
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
	};

	const getCapabilities = async () => {
		if (!selectedStableCoin?.tokenId || !accountInfo.id) return;
		const capabilities = await SDKService.getCapabilities({
			tokenId: selectedStableCoin.tokenId.toString(),
			account: {
				accountId: accountInfo.id,
				evmAddress: accountInfo.accountEvmAddress,
			},
			tokenIsDeleted,
			tokenIsPaused,
		});
		dispatch(walletActions.setCapabilities(capabilities));
	};

	const formatOptionsStableCoins = async () => {
		let options = [];
		if (stableCoinList?.coins) {
			options = stableCoinList.coins.map(({ id, symbol }) => ({
				label: <Text whiteSpace={'normal'}>{`${id} - ${symbol}`}</Text>,
				value: id,
			}));
			if (externalTokenList && externalTokenList.length !== 0) {
				options = options
					.filter((coin) => {
						if (
							externalTokenList.find(
								(externalCoin: IExternalToken) => externalCoin.id === coin.value,
							)
						) {
							return false;
						}
						return true;
					})
					.concat(
						externalTokenList.map((item: IExternalToken) => {
							return {
								label: (
									<HStack justifyContent={'space-between'} alignItems={'center'}>
										<Text whiteSpace={'normal'}>{`${item.id} - ${item.symbol}`}</Text>
									</HStack>
								),
								value: item.id,
							};
						}),
					)
					.sort((token1, token2) =>
						+token1.value.split('.').slice(-1)[0] > +token2.value.split('.').slice(-1)[0] ? -1 : 1,
					);
			}
			setOptions(options);
		}
	};

	const handleSelectCoin = async (event: any) => {
		if (!event?.value) return;
		dispatch(walletActions.setSelectingStableCoin(true));

		try {
			const selectedCoin = event.value;

			const stableCoinDetails: any = await Promise.race([
				SDKService.getStableCoinDetails(
					new GetStableCoinDetailsRequest({
						id: selectedCoin,
					}),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Stable coin details couldn't be obtained in a reasonable time."));
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				setIsSelecting(true);
				onOpen();
				throw e;
			});

			const proxyConfig: any = await Promise.race([
				SDKService.getProxyConfig(
					new GetProxyConfigRequest({
						tokenId: selectedCoin,
					}),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Stable coin details couldn't be obtained in a reasonable time."));
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				setIsSelecting(true);
				onOpen();
				throw e;
			});

			const roles = await Promise.race([
				SDKService.getRoles(
					new GetRolesRequest({
						targetId: accountInfo && accountInfo.id ? accountInfo?.id : '',
						tokenId: stableCoinDetails?.tokenId?.toString(),
					}),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(
							new Error("Account's roles for the coin couldn't be obtained in a reasonable time."),
						);
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				setIsSelecting(true);
				onOpen();
				throw e;
			});

			dispatch(walletActions.setDeletedToken(undefined));
			dispatch(walletActions.setPausedToken(undefined));
			dispatch(walletActions.setRoles(roles));

			dispatch(walletActions.setSelectingStableCoin(false));

			dispatch(
				walletActions.setSelectedStableCoin({
					tokenId: stableCoinDetails?.tokenId,
					initialSupply: stableCoinDetails?.initialSupply,
					totalSupply: stableCoinDetails?.totalSupply,
					maxSupply: stableCoinDetails?.maxSupply,
					name: stableCoinDetails?.name,
					symbol: stableCoinDetails?.symbol,
					decimals: stableCoinDetails?.decimals,
					treasury: stableCoinDetails?.treasury,
					autoRenewAccount: stableCoinDetails?.autoRenewAccount,
					proxyAddress: stableCoinDetails?.proxyAddress,
					proxyAdminAddress: stableCoinDetails?.proxyAdminAddress,
					paused: stableCoinDetails?.paused,
					deleted: stableCoinDetails?.deleted,
					adminKey:
						stableCoinDetails?.adminKey && JSON.parse(JSON.stringify(stableCoinDetails.adminKey)),
					kycKey: stableCoinDetails?.kycKey && JSON.parse(JSON.stringify(stableCoinDetails.kycKey)),
					freezeKey:
						stableCoinDetails?.freezeKey && JSON.parse(JSON.stringify(stableCoinDetails.freezeKey)),
					wipeKey:
						stableCoinDetails?.wipeKey && JSON.parse(JSON.stringify(stableCoinDetails.wipeKey)),
					supplyKey:
						stableCoinDetails?.supplyKey && JSON.parse(JSON.stringify(stableCoinDetails.supplyKey)),
					pauseKey:
						stableCoinDetails?.pauseKey && JSON.parse(JSON.stringify(stableCoinDetails.pauseKey)),
					feeScheduleKey:
						stableCoinDetails?.feeScheduleKey &&
						JSON.parse(JSON.stringify(stableCoinDetails.feeScheduleKey)),
					customFees:
						stableCoinDetails?.customFees &&
						JSON.parse(JSON.stringify(stableCoinDetails.customFees)),
				}),
			);
			dispatch(
				walletActions.setSelectedStableCoinProxyConfig({
					owner: proxyConfig?.owner,
					implementationAddress: proxyConfig?.implementationAddress,
					pendingOwner: proxyConfig?.pendingOwner,
				}),
			);
			dispatch(
				walletActions.setIsProxyOwner(
					proxyConfig?.owner?.toString() === accountInfo?.id?.toString(),
				),
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

			RouterManager.to(navigate, NamedRoutes.Operations);
		} catch (e) {
			setSuccess(false);
			dispatch(walletActions.setSelectingStableCoin(false));
			throw e;
		}
	};

	const handleImportToken = async (inputValue: string) => {
		setLoadingImportToken(true);
		try {
			const details: any = await Promise.race([
				SDKService.getStableCoinDetails(
					new GetStableCoinDetailsRequest({
						id: inputValue,
					}),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Stable coin details couldn't be obtained in a reasonable time."));
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				setIsSelecting(true);
				onOpen();
				throw e;
			});

			const tokensAccount = localStorage?.tokensAccount;
			if (tokensAccount) {
				const tokensAccountParsed = JSON.parse(tokensAccount);
				const accountToken = tokensAccountParsed.find(
					(account: IAccountToken) => account.id === accountInfo.id,
				);
				if (
					accountToken &&
					accountToken.externalTokens.find((coin: IExternalToken) => coin.id === inputValue)
				) {
					accountToken.externalTokens = accountToken.externalTokens.filter(
						(coin: IExternalToken) => coin.id !== inputValue,
					);
				}
				accountToken
					? accountToken.externalTokens.push({
							id: inputValue,
							symbol: details!.symbol,
					  })
					: tokensAccountParsed.push({
							id: accountInfo.id,
							externalTokens: [
								{
									id: inputValue,
									symbol: details!.symbol,
								},
							],
					  });
				localStorage.setItem('tokensAccount', JSON.stringify(tokensAccountParsed));
			} else {
				localStorage.setItem(
					'tokensAccount',
					JSON.stringify([
						{
							id: accountInfo.id,
							externalTokens: [
								{
									id: inputValue,
									symbol: details!.symbol,
								},
							],
						},
					]),
				);
			}
			dispatch(getExternalTokenList(accountInfo.id!));
			handleSelectCoin({ value: inputValue });
			setLoadingImportToken(false);
		} catch (error) {
			console.log(error);
			setSuccess(false);
			setLoadingImportToken(false);
			setIsSelecting(false);
			onOpen();
		}
	};

	const { t } = useTranslation(['global', 'externalTokenInfo']);

	const { control } = useForm();

	const styles = {
		menuList: {
			maxH: '244px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
			color: 'gray.800',
		},
		wrapperOpened: { borderWidth: '0' },
		container: {
			w: 'fit-content',
		},
	};

	return (
		<Box minW={{ base: 'full', md: '380px' }} data-testid='coin-dropdown'>
			<SearchSelectController
				control={control}
				styles={styles}
				name='coin-dropdown'
				options={options}
				placeholder={
					selectedStableCoin
						? selectedStableCoin.tokenId + ' - ' + selectedStableCoin.symbol
						: t('global:topbar.coinDropdown.placeholder')
				}
				iconStyles={{ color: 'brand.primary200' }}
				isLoading={isLoadingImportToken}
				onChangeAux={handleSelectCoin}
				// noOptionsMessage={handleNoOptionsMessage}
				formatCreateLabel={(inputValue) =>
					t('global:topbar.coinDropdown.importToken', { tokenId: inputValue })
				}
				onCreateOption={handleImportToken}
			/>
			<ModalNotification
				variant={success ? 'success' : 'error'}
				title={
					!stableCoinListLoad
						? t('externalTokenInfo:notification.titleLoading', {
								result: success ? 'Success' : 'Error',
						  })
						: isSelecting
						? t('externalTokenInfo:notification.titleSelecting', {
								result: success ? 'Success' : 'Error',
						  })
						: t('externalTokenInfo:notification.titleAdding', {
								result: success ? 'Success' : 'Error',
						  })
				}
				description={
					!stableCoinListLoad
						? t(`externalTokenInfo:notification.descriptionLoading${success ? 'Success' : 'Error'}`)
						: isSelecting
						? t(
								`externalTokenInfo:notification.descriptionSelecting${
									success ? 'Success' : 'Error'
								}`,
						  )
						: t(`externalTokenInfo:notification.descriptionAdding${success ? 'Success' : 'Error'}`)
				}
				isOpen={isOpen}
				onClose={onClose}
				closeOnOverlayClick={false}
				closeButton={true}
			/>
		</Box>
	);
};

export default CoinDropdown;
