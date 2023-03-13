import { Box, Heading, useDisclosure } from '@chakra-ui/react';
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
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import { GetRolesRequest, Operation, StableCoinRole } from 'hedera-stable-coin-sdk';
import SDKService from '../../services/SDKService';
import ModalNotification from '../../components/ModalNotification';

const Roles = () => {
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const coinSelected = useSelector(SELECTED_WALLET_COIN);

	const {
		isOpen: isOpenRefreshRoles,
		onOpen: onOpenRefreshRoles,
		onClose: onCloseRefreshRoles,
	} = useDisclosure();
	const [isExternal, setIsExternal] = useState<boolean>(false);
	const [statusRefreshRoles, setStatusRefreshRoles] = useState<
		'error' | 'success' | 'warning' | 'loading'
	>();
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

	const operations = capabilities?.capabilities.map((x) => x.operation);

	const filteredCapabilities = roleOptions.filter((option) => {
		if (!operations?.includes(Operation.CASH_IN) && option.label === 'Cash in') {
			return false;
		}
		if (!operations?.includes(Operation.BURN) && option.label === 'Burn') {
			return false;
		}
		if (!operations?.includes(Operation.WIPE) && option.label === 'Wipe') {
			return false;
		}
		if (!operations?.includes(Operation.PAUSE) && option.label === 'Pause') {
			return false;
		}
		if (!operations?.includes(Operation.RESCUE) && option.label === 'Rescue') {
			return false;
		}
		if (!operations?.includes(Operation.FREEZE) && option.label === 'Freeze') {
			return false;
		}
		if (!operations?.includes(Operation.ROLE_ADMIN_MANAGEMENT) && option.label === 'Admin Role') {
			return false;
		}

		return true;
	});

	const { t } = useTranslation('roles');
	// Add to action handler
	const refreshRoles = async () => {
		setStatusRefreshRoles('loading');
		onOpenRefreshRoles();
		if (coinSelected && coinSelected?.tokenId) {
			const tokensAccount = JSON.parse(localStorage.tokensAccount);
			const myAccount = tokensAccount.find((acc: IAccountToken) => acc.id === accountId?.value);
			const externalTokens = myAccount.externalTokens;
			const externalToken = externalTokens.find(
				(coin: IExternalToken) => coin.id === coinSelected.tokenId?.toString(),
			);

			externalToken.roles = await SDKService.getRoles(
				new GetRolesRequest({
					targetId: accountId!.toString(),
					tokenId: coinSelected.tokenId.toString(),
				}),
			);

			localStorage.setItem('tokensAccount', JSON.stringify(tokensAccount));
			setStatusRefreshRoles('success');
			return;
		}
		setStatusRefreshRoles('error');
	};

	const directAccesses = [
		{
			icon: 'PlusCircle',
			route: NamedRoutes.GiveRole,
			title: t('give'),
			isDisabled:
				filteredCapabilities.length === 0 ||
				(isExternal &&
					!JSON.parse(localStorage.tokensAccount)
						.find((t: any) => t.id === accountId?.toString())
						.externalTokens.find((t: any) => t.id === coinSelected?.tokenId)
						.roles?.includes(StableCoinRole.DEFAULT_ADMIN_ROLE)),
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.RevokeRole,
			title: t('revoke'),
			isDisabled:
				filteredCapabilities.length === 0 ||
				(isExternal &&
					!JSON.parse(localStorage.tokensAccount)
						.find((t: any) => t.id === accountId?.toString())
						.externalTokens.find((t: any) => t.id === coinSelected?.tokenId)
						.roles?.includes(StableCoinRole.DEFAULT_ADMIN_ROLE)),
		},
		{
			icon: 'PencilSimple',
			route: NamedRoutes.EditRole,
			title: t('edit'),
			isDisabled:
				!operations?.includes(Operation.CASH_IN) ||
				(isExternal &&
					!JSON.parse(localStorage.tokensAccount)
						.find((t: any) => t.id === accountId?.toString())
						.externalTokens.find((t: any) => t.id === coinSelected?.tokenId)
						.roles?.includes(StableCoinRole.DEFAULT_ADMIN_ROLE)),
		},
		{
			icon: 'ArrowsClockwise',
			route: NamedRoutes.RefreshRoles,
			title: t('refresh'),
			isDisabled: !isExternal,
			customHandleClick: refreshRoles,
		},
	];

	return (
		<>
			<BaseContainer title={t('title')}>
				<Box p={{ base: 4, md: '128px' }}>
					<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
						{t('subtitle')}
					</Heading>
					<GridDirectAccess directAccesses={directAccesses} />
				</Box>
			</BaseContainer>
			<ModalNotification
				variant={statusRefreshRoles}
				isOpen={isOpenRefreshRoles}
				onClose={onCloseRefreshRoles}
				closeButton={true}
				title={t('refreshRoles.modalActionTitle')}
			/>
		</>
	);
};

export default Roles;
