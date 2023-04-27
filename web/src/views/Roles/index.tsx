import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';
import { useSelector } from 'react-redux';
import { roleOptions } from './constants';
import { SELECTED_WALLET_CAPABILITIES, SELECTED_TOKEN_ROLES } from '../../store/slices/walletSlice';
import { Operation, StableCoinRole } from '@hashgraph-dev/stablecoin-npm-sdk';

const Roles = () => {
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const roles = useSelector(SELECTED_TOKEN_ROLES)!;
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

	const directAccesses = [
		{
			icon: 'PlusCircle',
			route: NamedRoutes.GiveRole,
			title: t('give'),
			isDisabled:
				filteredCapabilities.length === 0 || !roles.includes(StableCoinRole.DEFAULT_ADMIN_ROLE),
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.RevokeRole,
			title: t('revoke'),
			isDisabled:
				filteredCapabilities.length === 0 || !roles.includes(StableCoinRole.DEFAULT_ADMIN_ROLE),
		},
		{
			icon: 'PencilSimple',
			route: NamedRoutes.EditRole,
			title: t('edit'),
			isDisabled:
				!roles.includes(StableCoinRole.DEFAULT_ADMIN_ROLE) &&
				operations?.includes(Operation.CASH_IN),
		},
		{
			icon: 'ArchiveBox',
			route: NamedRoutes.GetAccountsWithRole,
			title: t('accountsWithRole'),
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
