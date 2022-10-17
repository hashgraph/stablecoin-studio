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
	{ value: 3, label: 'Rescue' },
	{ value: 3, label: 'Pause' }
];

export const fields = {
	amount: 'amount',
	account: 'account',
	role: 'role',
	supplierQuantitySwitch: 'supplierQuantitySwitch',
};
