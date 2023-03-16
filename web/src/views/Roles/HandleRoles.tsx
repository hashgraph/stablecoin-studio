import { roleOptions } from './constants';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_CAPABILITIES } from '../../store/slices/walletSlice';
import { Operation, Access } from 'hedera-stable-coin-sdk';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import RevokeRoleOperation from './RevokeRoles';
import GrantRoleOperation from './GrantRoles';
import ManageCashIn from './ManageCashIn';

export type Action = 'editRole' | 'giveRole' | 'revokeRole' | 'refreshRoles';

interface HandleRolesProps {
	action: Action;
}

const HandleRoles = ({ action }: HandleRolesProps) => {
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const operations = capabilities?.capabilities.map((x) => x.operation);
	const filteredCapabilities = roleOptions
		.filter((option) => {
			if (
				!(
					operations?.includes(Operation.CASH_IN) &&
					getAccessByOperation(Operation.CASH_IN) === Access.CONTRACT
				) &&
				option.label === 'Cash in'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.BURN) &&
					getAccessByOperation(Operation.BURN) === Access.CONTRACT
				) &&
				option.label === 'Burn'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.WIPE) &&
					getAccessByOperation(Operation.WIPE) === Access.CONTRACT
				) &&
				option.label === 'Wipe'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.PAUSE) &&
					getAccessByOperation(Operation.PAUSE) === Access.CONTRACT
				) &&
				option.label === 'Pause'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.RESCUE) &&
					getAccessByOperation(Operation.RESCUE) === Access.CONTRACT
				) &&
				option.label === 'Rescue'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.FREEZE) &&
					getAccessByOperation(Operation.FREEZE) === Access.CONTRACT
				) &&
				option.label === 'Freeze'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.DELETE) &&
					getAccessByOperation(Operation.DELETE) === Access.CONTRACT
				) &&
				option.label === 'Delete'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.GRANT_KYC) &&
					getAccessByOperation(Operation.GRANT_KYC) === Access.CONTRACT
				) &&
				option.label === 'KYC'
			) {
				return false;
			}

			if (
				!(
					operations?.includes(Operation.ROLE_ADMIN_MANAGEMENT) &&
					getAccessByOperation(Operation.ROLE_ADMIN_MANAGEMENT) === Access.CONTRACT
				) &&
				option.label === 'Admin Role'
			) {
				return false;
			}

			return true;
		})
		.map((item) => {
			return { ...item, id: item.label.toLowerCase() };
		});

	function getAccessByOperation(operation: Operation): Access | undefined {
		return (
			capabilities?.capabilities.filter((capability) => {
				return capability.operation === operation;
			})[0].access ?? undefined
		);
	}

	useRefreshCoinInfo();

	return (
		<>
			{action === 'revokeRole' && <RevokeRoleOperation />}
			{action === 'giveRole' && <GrantRoleOperation filteredCapabilities={filteredCapabilities} />}
			{action === 'editRole' && <ManageCashIn />}
		</>
	);
};

export default HandleRoles;
