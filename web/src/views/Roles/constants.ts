import { StableCoinRole } from 'hedera-stable-coin-sdk';
import type { Action } from './HandleRoles';

export const actions: Record<string, Action> = {
	edit: 'editRole' as Action,
	give: 'giveRole' as Action,
	revoke: 'revokeRole' as Action,
};

export const roleOptions = [
	{ value: StableCoinRole.CASHIN_ROLE, label: 'Cash in' },
	{ value: StableCoinRole.BURN_ROLE, label: 'Burn' },
	{ value: StableCoinRole.WIPE_ROLE, label: 'Wipe' },
	{ value: StableCoinRole.RESCUE_ROLE, label: 'Rescue' },
	{ value: StableCoinRole.PAUSER_ROLE, label: 'Pause' },
];

export const cashinLimitOptions = [
	{ value: 'INCREASE', label: 'Increase cash in limit' },
	{ value: 'DECREASE', label: 'Decrease cash in limit' },
	{ value: 'RESET', label: 'Reset cash in limit' },
	{ value: 'CHECK', label: 'Check cash in limit' },
];

export const fields = {
	amount: 'amount',
	account: 'account',
	role: 'role',
	cashinLimitOption: 'cashinLimitOption',
	name: 'name',
	supplierQuantitySwitch: 'supplierQuantitySwitch',
};
