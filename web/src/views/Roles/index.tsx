import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';
import { useSelector } from 'react-redux';
import { roleOptions } from './constants';

import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	SELECTED_WALLET_COIN,
} from '../../store/slices/walletSlice';
import { Capabilities } from 'hedera-stable-coin-sdk';
import { useEffect, useState } from 'react';
import type { IAccountToken } from '../../interfaces/IAccountToken.js';
import type { IExternalToken } from '../../interfaces/IExternalToken.js';

const Roles = () => {
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const coinSelected = useSelector(SELECTED_WALLET_COIN);

	const [isExternal, setIsExternal] = useState<boolean>(false);

	useEffect(() => {
		const tokensAccount = JSON.parse(localStorage.tokensAccount);
		if (tokensAccount) {
			const myAccount = tokensAccount.find((acc: IAccountToken) => accountId === acc.id);
			if (myAccount) {
				if (
					myAccount.externalTokens.find((coin: IExternalToken) => coin.id === coinSelected?.tokenId)
				) {
					setIsExternal(true);
				} else {
					setIsExternal(false);
				}
			}
		}
	}, [coinSelected]);

	const filteredCapabilities = roleOptions.filter((option) => {
		if (!capabilities!.includes(Capabilities.CASH_IN) && option.label === 'Cash in') {
			return false;
		}
		if (!capabilities!.includes(Capabilities.BURN) && option.label === 'Burn') {
			return false;
		}
		if (!capabilities!.includes(Capabilities.WIPE) && option.label === 'Wipe') {
			return false;
		}
		if (!capabilities!.includes(Capabilities.PAUSE) && option.label === 'Pause') {
			return false;
		}
		if (!capabilities!.includes(Capabilities.RESCUE) && option.label === 'Rescue') {
			return false;
		}
		return true;
	});

	const { t } = useTranslation('roles');
	const directAccesses = [
		{
			icon: 'PlusCircle',
			route: NamedRoutes.GiveRole,
			title: t('give'),
			isDisabled: filteredCapabilities.length === 0 || isExternal,
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.RevokeRole,
			title: t('revoke'),
			isDisabled: filteredCapabilities.length === 0 || isExternal,
		},
		{
			icon: 'PencilSimple',
			route: NamedRoutes.EditRole,
			title: t('edit'),
			isDisabled: !capabilities!.includes(Capabilities.CASH_IN) || isExternal,
		},
		{
			icon: 'ArrowsClockwise',
			route: NamedRoutes.RefreshRoles,
			title: t('refresh'),
			isDisabled: !isExternal,
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

export default Roles;
