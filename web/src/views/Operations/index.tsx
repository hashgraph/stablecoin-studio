import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import type { DirectAccessProps } from '../../components/DirectAccess';
import { RouterManager } from '../../Router/RouterManager';
import { useNavigate } from 'react-router-dom';

const Operations = () => {
	const { t } = useTranslation('operations');
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { supplyKey, wipeKey } = selectedStableCoin || {};
	const [disabledFeatures, setDisabledFeatures] = useState({
		cashIn: false,
		cashOut: false,
		balance: false,
		rescue: false,
		wipe: false,
	});
	const navigate = useNavigate();

	useEffect(() => {
		if (selectedStableCoin) {
			getAvailableFeatures();
		} else {
			RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
		}
	}, [selectedStableCoin]);

	const isKeySet = (
		key: { key: string; type: string; id: never } | { id: string; key: never; type: never },
	) => {
		if (!key) {
			return false;
		}
		return true;
	};

	const isContractKey = (
		key: { key: string; type: string; id: never } | { id: string; key: never; type: never },
	) => {
		if (!key) {
			return false;
		}
		if (key.id) {
			return true;
		}
		return false;
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isUserKey = async () => {
		// pending to get public key of user connected
		return true;
	};

	const getAvailableFeatures = () => {
		// TODO: add userkey validation

		// TODO: remove as any when sdk returns correct type
		const areDisabled = {
			cashIn: !isKeySet(supplyKey as any) || !isContractKey(supplyKey as any),
			cashOut: !isKeySet(supplyKey as any) || !isContractKey(supplyKey as any),
			balance: true,
			rescue: true,
			wipe: !isKeySet(wipeKey as any) || !isKeySet(supplyKey as any),
		};
		setDisabledFeatures(areDisabled);
	};

	const directAccesses: DirectAccessProps[] = [
		{
			icon: 'ArrowDown',
			route: NamedRoutes.CashIn,
			title: t('cashInOperation'),
			isDisabled: disabledFeatures?.cashIn,
		},
		{
			icon: 'ArrowUp',
			route: NamedRoutes.CashOut,
			title: t('cashOutOperation'),
			isDisabled: disabledFeatures?.cashOut,
		},
		{
			icon: 'Coin',
			route: NamedRoutes.Balance,
			title: t('getBalanceOperation'),
			isDisabled: disabledFeatures?.balance,
		},
		{
			icon: 'ArrowsDownUp',
			route: NamedRoutes.RescueTokens,
			title: t('rescueOperation'),
			isDisabled: disabledFeatures?.rescue,
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.Wipe,
			title: t('wipeOperation'),
			isDisabled: disabledFeatures?.wipe,
		},
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

export default Operations;
