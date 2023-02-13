import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../components/BaseContainer';
import { NamedRoutes } from './NamedRoutes';
import GridDirectAccess from '../components/GridDirectAccess';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
} from '../store/slices/walletSlice';
import type { DirectAccessProps } from '../components/DirectAccess';
import type { IAccountToken } from '../interfaces/IAccountToken';
import type { IExternalToken } from '../interfaces/IExternalToken';
// import type { AppDispatch } from '../../store/store.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRefreshCoinInfo } from '../hooks/useRefreshCoinInfo';
import { Access, Operation, StableCoinRole } from '@hashgraph-dev/stablecoin-npm-sdk';
import AwaitingWalletSignature from '../components/AwaitingWalletSignature';

const Operations = () => {
	const { t } = useTranslation('operations');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);

	const [disabledFeatures, setDisabledFeatures] = useState({
		cashIn: false,
		burn: false,
		balance: false,
		rescue: false,
		wipe: false,
		freeze: false,
		kyc: false,
		pause: false,
		delete: false,
		checkKyc: false,
	});

	const isLoading = useRefreshCoinInfo();

	useEffect(() => {
		if (selectedStableCoin) {
			getAvailableFeatures();
		}
	}, [selectedStableCoin, capabilities]);

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

		function getAccessByOperation(operation: Operation): Access | undefined {
			return (
				capabilities?.capabilities.filter((capability) => {
					return capability.operation === operation;
				})[0].access ?? undefined
			);
		}

		const operations = capabilities?.capabilities.map((x) => x.operation);
		const areDisabled = {
			cashIn: !isExternalToken
				? !operations?.includes(Operation.CASH_IN)
				: !operations?.includes(Operation.CASH_IN) ||
				  (operations?.includes(Operation.CASH_IN) &&
						getAccessByOperation(Operation.CASH_IN) !== Access.HTS &&
						!roles.includes(StableCoinRole.CASHIN_ROLE)),
			burn: !isExternalToken
				? !operations?.includes(Operation.BURN)
				: !operations?.includes(Operation.BURN) ||
				  (operations?.includes(Operation.BURN) &&
						getAccessByOperation(Operation.BURN) !== Access.HTS &&
						!roles.includes(StableCoinRole.BURN_ROLE)),
			balance: false,
			rescue: !isExternalToken
				? !operations?.includes(Operation.RESCUE)
				: !operations?.includes(Operation.RESCUE) ||
				  (operations?.includes(Operation.RESCUE) &&
						getAccessByOperation(Operation.RESCUE) !== Access.HTS &&
						!roles.includes(StableCoinRole.RESCUE_ROLE)),
			wipe: !isExternalToken
				? !operations?.includes(Operation.WIPE)
				: !operations?.includes(Operation.WIPE) ||
				  (operations?.includes(Operation.WIPE) &&
						getAccessByOperation(Operation.WIPE) !== Access.HTS &&
						!roles.includes(StableCoinRole.WIPE_ROLE)),
			freeze: !isExternalToken
				? !operations?.includes(Operation.FREEZE)
				: !operations?.includes(Operation.FREEZE) ||
				  (operations?.includes(Operation.FREEZE) &&
						getAccessByOperation(Operation.FREEZE) !== Access.HTS &&
						!roles.includes(StableCoinRole.FREEZE_ROLE)),
			pause: !isExternalToken
				? !operations?.includes(Operation.PAUSE)
				: !operations?.includes(Operation.PAUSE) ||
				  (operations?.includes(Operation.PAUSE) &&
						getAccessByOperation(Operation.PAUSE) !== Access.HTS &&
						!roles.includes(StableCoinRole.PAUSE_ROLE)),
			delete: !isExternalToken
				? !operations?.includes(Operation.DELETE)
				: !operations?.includes(Operation.DELETE) ||
				  (operations?.includes(Operation.DELETE) &&
						getAccessByOperation(Operation.DELETE) !== Access.HTS &&
						!roles.includes(StableCoinRole.DELETE_ROLE)),
			kyc: !isExternalToken
				? !operations?.includes(Operation.GRANT_KYC)
				: !operations?.includes(Operation.GRANT_KYC) ||
				  (operations?.includes(Operation.GRANT_KYC) &&
						getAccessByOperation(Operation.GRANT_KYC) !== Access.HTS &&
						!roles.includes(StableCoinRole.KYC_ROLE)),
			checkKyc: selectedStableCoin?.kycKey === undefined,
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
			icon: 'UserPlus',
			route: NamedRoutes.GrantKyc,
			title: t('grantKycOperation'),
			isDisabled: disabledFeatures?.kyc,
		},
		{
			icon: 'UserMinus',
			route: NamedRoutes.RevokeKyc,
			title: t('revokeKycOperation'),
			isDisabled: disabledFeatures?.kyc,
		},
		{
			icon: 'IdentificationCard',
			route: NamedRoutes.CheckKyc,
			title: t('checkKycOperation'),
			isDisabled: disabledFeatures?.checkKyc,
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
			{isLoading && <AwaitingWalletSignature />}
			{!isLoading && (
				<Box p={{ base: 4, md: '128px' }}>
					<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
						{t('subtitle')}
					</Heading>
					<GridDirectAccess directAccesses={directAccesses} />
				</Box>
			)}
		</BaseContainer>
	);
};

export default Operations;
