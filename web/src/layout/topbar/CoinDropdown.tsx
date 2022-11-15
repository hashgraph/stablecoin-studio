import { Box, HStack, Tag, Text } from '@chakra-ui/react';
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
import { GetStableCoinDetailsRequest, HashPackAccount, GetAccountInfoRequest } from 'hedera-stable-coin-sdk';
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
		const accountInfo = await SDKService.getAccountInfo(
			new GetAccountInfoRequest({ 
				account: {
					accountId: hashpackAccount.accountId.id,
				}
			})
		);

		dispatch(walletActions.setAccountInfo(accountInfo));
	};

	const getCapabilities = async () => {
		if (!selectedStableCoin?.tokenId || !accountInfo.publicKey?.key) return;

		const capabilities = await SDKService.getCapabilities({
			id: selectedStableCoin.tokenId,
			publicKey: accountInfo.publicKey.key
		});
		dispatch(walletActions.setCapabilities(capabilities));
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
										</HStack>
									</HStack>
								),
								value: item.id,
							};
						}),
					);
			}
			setOptions(options);
		}
	};

	const handleSelectCoin = async (event: any) => {
		const selectedCoin = event.value;
		const stableCoinDetails = await SDKService.getStableCoinDetails(new GetStableCoinDetailsRequest ({
			id: selectedCoin,
		}));

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
	};

	const { t } = useTranslation('global');
	const { control } = useForm();
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
