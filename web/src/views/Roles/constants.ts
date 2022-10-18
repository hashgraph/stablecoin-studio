import type { Action } from './HandleRoles';

export const actions: Record<string, Action> = {
	edit: 'editRole' as Action,
	give: 'giveRole' as Action,
	revoke: 'revokeRole' as Action,
};

export const fakeOptions = [
	{ value: 1, label: 'Cash in' },
	{ value: 2, label: 'Burn' },
	{ value: 3, label: 'Wipe' },
	{ value: 4, label: 'Rescue' },
	{ value: 5, label: 'Pause' }
];

export const cashinLimitOptions = [
	{ value: 'INCREASE', label: 'Increase cash in limit' },
	{ value: 'DECREASE', label: 'Decrease cash in limit' },
	{ value: 'RESET', label: 'Reset cash in limit' },
	{ value: 'CHECK', label: 'Check cash in limit' }
];

export const fields = {
	amount: 'amount',
	account: 'account',
	role: 'role',
	cashinLimitOption: 'cashinLimitOption',
	name: 'name',
	supplierQuantitySwitch: 'supplierQuantitySwitch',
};
