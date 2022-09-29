/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import type { DirectAccessProps } from '../../components/DirectAccess';

const Operations = () => {
	const { t } = useTranslation('operations');
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN) || {};
	const { adminKey, freezeKey, kycKey, supplyKey, wipeKey } = selectedStableCoin;
	const [areKeysSetted, setAreKeysSetted] = useState({
		adminKey: false,
		freezeKey: false,
		kycKey: false,
		supplyKey: false,
		wipeKey: false,
	});

	useEffect(() => {
		getAvailableFeatures();
	}, [selectedStableCoin]);

	const isKeySet = (
		key: { key: string; type: string; id: never } | { id: string; key: never; type: never },
	) => {
		if (!key.key || !key.type || !key.id) {
			return false;
		}
		if (key.id) {
			return true;
		}
		if (key.key !== 'null' && key.key !== 'null') {
			return true;
		}
		return false;
	};

	const getAvailableFeatures = () => {
		console.table({ adminKey, freezeKey, kycKey, supplyKey, wipeKey });
		const keys = {
			adminKey: isKeySet(adminKey as any),
			freezeKey: isKeySet(freezeKey as any),
			kycKey: isKeySet(kycKey as any),
			supplyKey: isKeySet(supplyKey as any),
			wipeKey: isKeySet(wipeKey as any),
		};
		setAreKeysSetted(keys);
	};

	const directAccesses: DirectAccessProps[] = [
		{
			icon: 'ArrowDown',
			route: NamedRoutes.CashIn,
			title: t('cashInOperation'),
			isDisabled: !areKeysSetted.supplyKey,
		},
		{
			icon: 'ArrowUp',
			route: NamedRoutes.CashOut,
			title: t('cashOutOperation'),
			isDisabled: !areKeysSetted.supplyKey,
		},
		{
			icon: 'Coin',
			route: NamedRoutes.Balance,
			title: t('getBalanceOperation'),
		},
		{
			icon: 'ArrowsDownUp',
			route: NamedRoutes.RescueTokens,
			title: t('rescueOperation'),
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.Wipe,
			title: t('wipeOperation'),
			isDisabled: !areKeysSetted.supplyKey || !areKeysSetted.wipeKey,
		},
	];

	console.log(directAccesses);

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

export default Operations;
