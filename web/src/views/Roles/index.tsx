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
import { useEffect, useState } from 'react';
import type { IAccountToken } from '../../interfaces/IAccountToken.js';
import type { IExternalToken } from '../../interfaces/IExternalToken.js';
import { Access, Operation } from 'hedera-stable-coin-sdk';

const Roles = () => {
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const coinSelected = useSelector(SELECTED_WALLET_COIN);

	const [isExternal, setIsExternal] = useState<boolean>(false);

	useEffect(() => {
		const tokensAccount = localStorage?.tokensAccount;
		if (tokensAccount) {
			const tokensAccountParsed = JSON.parse(tokensAccount);
			if (tokensAccountParsed) {
				const myAccount = tokensAccountParsed.find(
					(acc: IAccountToken) => accountId?.toString() === acc.id,
				);
				if (myAccount) {
					if (
						myAccount.externalTokens.find(
							(coin: IExternalToken) => coin.id === coinSelected?.tokenId?.toString(),
						)
					) {
						setIsExternal(true);
					} else {
						setIsExternal(false);
					}
				}
			}
		}
	}, [coinSelected]);

	const filteredCapabilities = roleOptions.filter((option) => {
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.CASH_IN,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.CASH_IN, access: Access.HTS }) &&
			option.label === 'Cash in'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.BURN,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.BURN, access: Access.HTS }) &&
			option.label === 'Burn'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.WIPE,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.WIPE, access: Access.HTS }) &&
			option.label === 'Wipe'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.PAUSE,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.PAUSE, access: Access.HTS }) &&
			option.label === 'Pause'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.RESCUE,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.RESCUE, access: Access.HTS }) &&
			option.label === 'Rescue'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({
				operation: Operation.FREEZE,
				access: Access.CONTRACT,
			}) &&
			!capabilities!.capabilities.includes({ operation: Operation.FREEZE, access: Access.HTS }) &&
			option.label === 'Freeze'
		) {
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
			isDisabled:
				!capabilities!.capabilities.includes({
					operation: Operation.CASH_IN,
					access: Access.CONTRACT,
				}) ||
				!capabilities!.capabilities.includes({
					operation: Operation.CASH_IN,
					access: Access.HTS,
				}) ||
				isExternal,
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
