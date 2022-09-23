import type { Action } from './HandleRoles';

export const actions: Record<string, Action> = {
	edit: 'editRole' as Action,
	give: 'giveRole' as Action,
	revoke: 'revokeRole' as Action,
};

export const fakeOptions = [
	{ value: 1, label: 'Admin' },
	{ value: 2, label: 'Supplier' },
	{ value: 3, label: 'Other' },
];

export const fields = {
	amount: 'amount',
	account: 'account',
	role: 'role',
	supplierQuantitySwitch: 'supplierQuantitySwitch',
};
