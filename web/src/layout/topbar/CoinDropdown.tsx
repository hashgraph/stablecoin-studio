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
	STABLE_COIN_LIST,
	walletActions,
} from '../../store/slices/walletSlice';
import { RouterManager } from '../../Router/RouterManager';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';

const CoinDropdown = () => {
	const stableCoinList = useSelector(STABLE_COIN_LIST);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const dispatch = useDispatch<AppDispatch>();
	const [options, setOptions] = useState<Option[]>([]);
	const navigate = useNavigate();
	const location = useLocation();
	const isInStableCoinNotSelected = !!matchPath(
		location.pathname,
		RouterManager.getUrl(NamedRoutes.StableCoinNotSelected),
	);

	useEffect(() => {
		dispatch(getStableCoinList());

		if (!selectedStableCoin) {
			RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
		}

		if (selectedStableCoin && isInStableCoinNotSelected) {
			RouterManager.to(navigate, NamedRoutes.Operations);
		}
	}, [selectedStableCoin]);

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

	const handleSelectCoin = async (event: any) => {
		const selectedCoin = event.value;

		const stableCoinDetails = await SDKService.getStableCoinDetails({
			id: selectedCoin,
		});

		// TODO: change this when sdk returns correct info
		dispatch(
			walletActions.setSelectedStableCoin({
				initialSupply: 0,
				tokenId: stableCoinDetails?.tokenId,
				totalSupply: 0,
				// supplyType: stableCoinDetails?.supplyType,
				name: stableCoinDetails?.name,
				symbol: stableCoinDetails?.symbol,
				decimals: stableCoinDetails?.decimals,
				id: stableCoinDetails?.tokenId,
				maxSupply: stableCoinDetails?.maxSupply?.toString(),
				treasuryId: stableCoinDetails?.treasuryId,
				memo: stableCoinDetails?.memo,
				adminKey:
					stableCoinDetails?.adminKey && JSON.parse(JSON.stringify(stableCoinDetails?.adminKey)),
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
