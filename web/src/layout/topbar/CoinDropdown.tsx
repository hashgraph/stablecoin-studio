import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import SearchSelectController from '../../components/Form/SearchSelectController';
import type { Option } from '../../components/Form/SelectController';
import SDKService from '../../services/SDKService';
import type { AppDispatch } from '../../store/store';
import {
	getStableCoinList,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	STABLE_COIN_LIST,
	walletActions,
} from '../../store/slices/walletSlice';
import { RouterManager } from '../../Router/RouterManager';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { HashPackAccount } from 'hedera-stable-coin-sdk';

const CoinDropdown = () => {
	const stableCoinList = useSelector(STABLE_COIN_LIST);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const dispatch = useDispatch<AppDispatch>();
	const [options, setOptions] = useState<Option[]>([]);
	const navigate = useNavigate();
	const location = useLocation();
	const isInStableCoinNotSelected = !!matchPath(
		location.pathname,
		RouterManager.getUrl(NamedRoutes.StableCoinNotSelected),
	);

	useEffect(() => {
		if (selectedStableCoin && isInStableCoinNotSelected) {
			RouterManager.to(navigate, NamedRoutes.Operations);
		}
	}, [selectedStableCoin]);

	useEffect(() => {
		if (accountId) {
			const id = new HashPackAccount(accountId);
			dispatch(getStableCoinList(id));
		}
	}, [accountId]);

	useEffect(() => {
		formatOptionsStableCoins();
	}, [stableCoinList]);

	const formatOptionsStableCoins = async () => {
		if (stableCoinList) {
			const options = stableCoinList.map(({ id, symbol }) => ({
				label: `${id} - ${symbol}`,
				value: id,
			}));
			setOptions(options);
		}
	};

	const formatSupplyParam = ({
		supply,
		decimals,
	}: {
		supply: string | undefined;
		decimals: number;
	}) => {
		if (supply !== '0') return supply?.slice(0, -decimals);

		return supply;
	};

	const handleSelectCoin = async (event: any) => {
		const selectedCoin = event.value;

		const stableCoinDetails = await SDKService.getStableCoinDetails({
			id: selectedCoin,
		});

		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: stableCoinDetails?.tokenId,
				initialSupply: formatSupplyParam({
					supply: stableCoinDetails?.initialSupply?.toString(),
					decimals: stableCoinDetails?.decimals ?? 0,
				}),
				totalSupply: formatSupplyParam({
					supply: stableCoinDetails?.totalSupply?.toString(),
					decimals: stableCoinDetails?.decimals ?? 0,
				}),
				maxSupply: formatSupplyParam({
					supply: stableCoinDetails?.maxSupply?.toString(),
					decimals: stableCoinDetails?.decimals ?? 0,
				}),
				name: stableCoinDetails?.name,
				symbol: stableCoinDetails?.symbol,
				decimals: stableCoinDetails?.decimals,
				id: stableCoinDetails?.tokenId,
				treasuryId: stableCoinDetails?.treasuryId,
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
	};

	return (
		<Box w={{ base: 'full', md: '280px' }} data-testid='coin-dropdown'>
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
