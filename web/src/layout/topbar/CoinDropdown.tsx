import { Box, Button, HStack, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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
} from '../../store/slices/walletSlice';
import { RouterManager } from '../../Router/RouterManager';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { HashPackAccount } from 'hedera-stable-coin-sdk';
import type { IAccountToken } from '../../interfaces/IAccountToken.js';
import type { IExternalToken } from '../../interfaces/IExternalToken.js';

const CoinDropdown = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const location = useLocation();

	const stableCoinList = useSelector(STABLE_COIN_LIST);
	const externalTokenList = useSelector(EXTERNAL_TOKEN_LIST);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [options, setOptions] = useState<Option[]>([]);
	const [remove, setRemove] = useState<boolean>(false);

	const isInStableCoinNotSelected = !!matchPath(
		location.pathname,
		RouterManager.getUrl(NamedRoutes.StableCoinNotSelected),
	);

	useEffect(() => {
		if (selectedStableCoin) {
			getCapabilities();
		}
	}, [selectedStableCoin]);

	useEffect(() => {
		if (capabilities?.length !== 0 && isInStableCoinNotSelected) {
			RouterManager.to(navigate, NamedRoutes.Operations);
		}
	}, [capabilities]);

	useEffect(() => {
		if (accountId) {
			const id = new HashPackAccount(accountId);
			dispatch(getStableCoinList(id));
			dispatch(getExternalTokenList(accountId));

			getAccountInfo(id);
		}
	}, [accountId]);

	useEffect(() => {
		formatOptionsStableCoins();
	}, [stableCoinList, externalTokenList, selectedStableCoin]);

	const getAccountInfo = async (hashpackAccount: HashPackAccount) => {
		const accountInfo = await SDKService.getAccountInfo({ account: hashpackAccount });

		dispatch(walletActions.setAccountInfo(accountInfo));
	};

	const getCapabilities = async () => {
		if (!selectedStableCoin?.tokenId || !accountInfo.publicKey?.key) return;

		const capabilities = await SDKService.getCapabilities({
			id: selectedStableCoin.tokenId,
			publicKey: accountInfo.publicKey.key,
		});
		dispatch(walletActions.setCapabilities(capabilities));
	};

	const handleRemoveExternalToken = (e: any) => {
		console.log('CLICK');
		const tokensAccount = JSON.parse(localStorage.tokensAccount);
		if (tokensAccount) {
			const currentAcc = tokensAccount.find((acc: IAccountToken) => acc.id === accountId);
			if (currentAcc) {
				currentAcc.externalTokens = currentAcc.externalTokens.filter(
					(coin: IExternalToken) =>
						coin.id !== e.target.parentElement.parentElement.innerText.split(' - ')[0],
				);
				localStorage.setItem('tokensAccount', JSON.stringify(tokensAccount));
				// window.location.reload();
				setRemove(true);
				setValue('coin-dropdown', undefined);
				dispatch(walletActions.clearSelectedStableCoin());
				console.log('VALUES', getValues());
				const id = new HashPackAccount(accountId);
				dispatch(getStableCoinList(id));
				dispatch(getExternalTokenList(accountId));
				RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
				console.log('VALUES', getValues());
			}
		}
	};

	const formatOptionsStableCoins = async () => {
		let options = [];
		if (stableCoinList) {
			options = stableCoinList.map(({ id, symbol }) => ({
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
										<HStack>
											<Tag
												variant='solid'
												size='md'
												backgroundColor={'light.purple4'}
												color={'dark.primary'}
											>
												External
											</Tag>

											<Button
												bgColor='red'
												size='xs'
												w='fit-content'
												fontSize={'sm'}
												_hover={{ bgColor: 'white', color: 'red' }}
												onClick={(e) => handleRemoveExternalToken(e)}
												isDisabled={selectedStableCoin?.tokenId === item.id}
											>
												Remove
											</Button>
										</HStack>
									</HStack>
								),
								value: item.id,
							};
						}),
					);
			}
			setOptions(options);
			/* const tokensAccount = localStorage.tokensAccount;
			if (tokensAccount) {
				const tokensAccountStoraged = JSON.parse(tokensAccount);
				const accountExternalToken = tokensAccountStoraged.find(
					(account: IAccountToken) => account.id === accountId,
				);
				setOptions(
					options
						.filter((coin) => {
							if (
								accountExternalToken?.externalTokens.find(
									(externalCoin: IExternalToken) => externalCoin.id === coin.value,
								)
							) {
								return false;
							}
							return true;
						})
						.concat(
							accountExternalToken?.externalTokens.map((item: IExternalToken) => {
								return {
									label: (
										<HStack justifyContent={'space-between'} alignItems={'center'}>
											<Text whiteSpace={'normal'}>{`${item.id} - ${item.symbol}`}</Text>
											<HStack>
												<Tag
													variant='solid'
													size='md'
													backgroundColor={'light.purple4'}
													color={'dark.primary'}
												>
													External
												</Tag>

												<Button
													bgColor='red'
													size='xs'
													w='fit-content'
													fontSize={'sm'}
													_hover={{ bgColor: 'white', color: 'red', border: 'red 0.5px solid' }}
													onClick={(e) => handleRemoveExternalToken(e)}
													isDisabled={selectedStableCoin?.tokenId === item.id}
												>
													Remove
												</Button>
											</HStack>
										</HStack>
									),
									value: item.id,
								};
							}),
						),
				);
			} */
		}
	};

	const handleSelectCoin = async (event: any) => {
		if (!remove) {
			const selectedCoin = event.value;
			console.log('SOY YO', selectedCoin);
			const stableCoinDetails = await SDKService.getStableCoinDetails({
				id: selectedCoin,
			});

			dispatch(
				walletActions.setSelectedStableCoin({
					tokenId: stableCoinDetails?.tokenId,
					initialSupply: stableCoinDetails?.initialSupply,
					totalSupply: stableCoinDetails?.totalSupply,
					maxSupply: stableCoinDetails?.maxSupply,
					name: stableCoinDetails?.name,
					symbol: stableCoinDetails?.symbol,
					decimals: stableCoinDetails?.decimals,
					id: stableCoinDetails?.tokenId,
					treasuryId: stableCoinDetails?.treasuryId,
					autoRenewAccount: stableCoinDetails?.autoRenewAccount,
					memo: stableCoinDetails?.memo,
					adminKey:
						stableCoinDetails?.adminKey && JSON.parse(JSON.stringify(stableCoinDetails.adminKey)),
					kycKey: stableCoinDetails?.kycKey && JSON.parse(JSON.stringify(stableCoinDetails.kycKey)),
					freezeKey:
						stableCoinDetails?.freezeKey && JSON.parse(JSON.stringify(stableCoinDetails.freezeKey)),
					wipeKey:
						stableCoinDetails?.wipeKey && JSON.parse(JSON.stringify(stableCoinDetails.wipeKey)),
					supplyKey:
						stableCoinDetails?.supplyKey && JSON.parse(JSON.stringify(stableCoinDetails.supplyKey)),
				}),
			);
		}
	};

	const { t } = useTranslation('global');
	const { control, getValues, setValue } = useForm();
	const styles = {
		menuList: {
			maxH: '244px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
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
				placeholder={t('topbar.coinDropdown.placeholder')}
				iconStyles={{ color: 'brand.primary200' }}
				onChangeAux={handleSelectCoin}
				noOptionsMessage={() => t('topbar.coinDropdown.noStableCoin')}
			/>
		</Box>
	);
};

export default CoinDropdown;
