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
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
// import type { AppDispatch } from '../../store/store.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import type { StableCoinCapabilities} from 'hedera-stable-coin-sdk';
import { Access, Operation, StableCoinRole } from 'hedera-stable-coin-sdk';

const Operations = () => {
	const { t } = useTranslation('operations');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities: StableCoinCapabilities | undefined = useSelector(
		SELECTED_WALLET_CAPABILITIES,
	);

	const [disabledFeatures, setDisabledFeatures] = useState({
		cashIn: false,
		burn: false,
		balance: false,
		rescue: false,
		wipe: false,
		freeze: false,
		pause: false,
		delete: false,
	});

	useRefreshCoinInfo();

	useEffect(() => {
		if (selectedStableCoin) {
			getAvailableFeatures();
		}
	}, [selectedStableCoin]);

	const getAvailableFeatures = () => {
		let isExternalToken = false;
		let roles = [];
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
						roles = externalToken.roles.map((role: string) => role);
					}
				}
			}
		}
		const areDisabled = {
			cashIn: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.CASH_IN,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.CASH_IN, access: Access.HTS })
				: !roles.includes(StableCoinRole.CASHIN_ROLE) &&
				  !capabilities?.capabilities.includes({
						operation: Operation.CASH_IN,
						access: Access.HTS,
				  }),
			burn: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.BURN,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.BURN, access: Access.HTS })
				: !roles.includes(StableCoinRole.BURN_ROLE) &&
				  !capabilities?.capabilities.includes({ operation: Operation.BURN, access: Access.HTS }),
			balance: false,
			rescue: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.RESCUE,
						access: Access.CONTRACT,
				  })
				: !roles.includes(StableCoinRole.RESCUE_ROLE),
			wipe: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.WIPE,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.WIPE, access: Access.HTS })
				: !roles.includes(StableCoinRole.WIPE_ROLE) &&
				  !capabilities?.capabilities.includes({ operation: Operation.WIPE, access: Access.HTS }),
			freeze: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.FREEZE,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.FREEZE, access: Access.HTS })
				: !roles.includes(StableCoinRole.FREEZE_ROLE) &&
				  !capabilities?.capabilities.includes({ operation: Operation.FREEZE, access: Access.HTS }),
			pause: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.PAUSE,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.PAUSE, access: Access.HTS })
				: !roles.includes(StableCoinRole.PAUSE_ROLE) &&
				  !capabilities?.capabilities.includes({
						operation: Operation.PAUSE,
						access: Access.CONTRACT,
				  }),
			delete: !isExternalToken
				? !capabilities?.capabilities.includes({
						operation: Operation.DELETE,
						access: Access.CONTRACT,
				  }) &&
				  !capabilities?.capabilities.includes({ operation: Operation.DELETE, access: Access.HTS })
				: !roles.includes(StableCoinRole.DELETE_ROLE) &&
				  !capabilities?.capabilities.includes({ operation: Operation.DELETE, access: Access.HTS }),
		};
		// console.log(capabilities);
		// console.log(areDisabled);

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
		{
			icon: 'Snowflake',
			route: NamedRoutes.Freeze,
			title: t('freezeOperation'),
			isDisabled: disabledFeatures?.freeze,
		},
		{
			icon: 'SunHorizon',
			route: NamedRoutes.Unfreeze,
			title: t('unfreezeOperation'),
			isDisabled: disabledFeatures?.freeze,
		},
		{
			icon: 'Warning',
			route: NamedRoutes.DangerZone,
			title: t('dangerZoneOperation'),
			isDisabled: disabledFeatures?.pause && disabledFeatures.delete,
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
