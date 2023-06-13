import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import type { DirectAccessProps } from '../../components/DirectAccess';
import GridDirectAccess from '../../components/GridDirectAccess';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	IS_PROXY_OWNER,
	IS_FACTORY_PROXY_OWNER
} from '../../store/slices/walletSlice';
import { NamedRoutes } from './../../Router/NamedRoutes';

const Settings = () => {
	const { t } = useTranslation('settings');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const isProxyOwner = useSelector(IS_PROXY_OWNER);
	const isFactoryProxyOwner = useSelector(IS_FACTORY_PROXY_OWNER);

	const [disabledFeatures, setDisabledFeatures] = useState({
		stableCoin: false,
		factory: false
	});

	useEffect(() => {
		getAvailableFeatures();
	}, [selectedStableCoin, isProxyOwner, isFactoryProxyOwner]);

	const getAvailableFeatures = async () => {
		let isExternalToken = false;

		const tokensAccount = localStorage?.tokensAccount;
		if (tokensAccount) {
			const tokensAccountParsed = JSON.parse(tokensAccount);
			if (tokensAccountParsed) {
				const myAccount = tokensAccountParsed.find(
					(acc: IAccountToken) => acc.id === accountId?.toString(),
				);
				if (myAccount) {
					const externalToken = myAccount?.externalTokens.find(
						(coin: IExternalToken) => coin.id === selectedStableCoin?.tokenId?.toString(),
					);
					if (externalToken) {
						isExternalToken = true;
					}
				}
			}
		}

		const areDisabled = {
			stableCoin: !selectedStableCoin || (selectedStableCoin && (isExternalToken || !isProxyOwner)),
			factory: !isFactoryProxyOwner
		};
		setDisabledFeatures(areDisabled);
	};

	const directAccesses: DirectAccessProps[] = [
		{
			icon: 'CoinVertical',
			route: NamedRoutes.StableCoinSettings,
			title: t('stableCoinSettings'),
			isDisabled: disabledFeatures?.stableCoin,
		},
		{
			icon: 'Factory',
			route: NamedRoutes.FactorySettings,
			title: t('factorySettings'),
			isDisabled: disabledFeatures?.factory,
		}
	];

	return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				<GridDirectAccess directAccesses={directAccesses} />
			</Box>
		</BaseContainer>
	);
};

export default Settings;
