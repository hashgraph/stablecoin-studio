import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
} from '../../store/slices/walletSlice';
import type { DirectAccessProps } from '../../components/DirectAccess';
import { Capabilities, Roles } from 'hedera-stable-coin-sdk';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';

const Operations = () => {
	const { t } = useTranslation('operations');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities: Capabilities[] | undefined = useSelector(SELECTED_WALLET_CAPABILITIES);

	const [disabledFeatures, setDisabledFeatures] = useState({
		cashIn: false,
		burn: false,
		balance: false,
		rescue: false,
		wipe: false,
	});
	useEffect(() => {
		if (selectedStableCoin) {
			getAvailableFeatures();
		}
	}, [selectedStableCoin]);

	const getAvailableFeatures = () => {
		let isExternalToken = false;
		let roles = [];
		const tokensAccount = JSON.parse(localStorage.tokensAccount);
		if (tokensAccount) {
			const myAccount = tokensAccount.find((acc: IAccountToken) => acc.id === accountId);
			if (myAccount) {
				const externalToken = myAccount?.externalTokens.find(
					(coin: IExternalToken) => coin.id === selectedStableCoin?.tokenId,
				);
				if (externalToken) {
					isExternalToken = true;
					roles = externalToken.roles.map((role: string) => role);
				}
			}
		}
		const areDisabled = {
			cashIn: !isExternalToken
				? !capabilities?.includes(Capabilities.CASH_IN) &&
				  !capabilities?.includes(Capabilities.CASH_IN_HTS)
				: !roles.includes(Roles.CASHIN_ROLE) && !capabilities?.includes(Capabilities.CASH_IN_HTS),
			burn: !isExternalToken
				? !capabilities?.includes(Capabilities.BURN) &&
				  !capabilities?.includes(Capabilities.BURN_HTS)
				: !roles.includes(Roles.BURN_ROLE) && !capabilities?.includes(Capabilities.BURN_HTS),
			balance: !capabilities?.includes(Capabilities.BALANCE),
			rescue: !isExternalToken
				? !capabilities?.includes(Capabilities.RESCUE)
				: !roles.includes(Roles.RESCUE_ROLE),
			wipe: !isExternalToken
				? !capabilities?.includes(Capabilities.WIPE) &&
				  !capabilities?.includes(Capabilities.WIPE_HTS)
				: !roles.includes(Roles.WIPE_ROLE) && !capabilities?.includes(Capabilities.WIPE_HTS),
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
			route: NamedRoutes.Burn,
			title: t('burnOperation'),
			isDisabled: disabledFeatures?.burn,
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
