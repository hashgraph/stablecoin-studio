export enum Operation {
	CASH_IN = 'Cash_in',
	BURN = 'Burn',
	WIPE = 'Wipe',
	FREEZE = 'Freeze',
	UNFREEZE = 'Unfreeze',
	PAUSE = 'Pause',
	UNPAUSE = 'Unpause',
	DELETE = 'Delete',
	RESCUE = 'Rescue',
	ROLE_MANAGEMENT = 'Role_Management',
}

export enum Access {
	HTS,
	CONTRACT,
}

export class Capability {
	constructor(
		public readonly operation: Operation,
		public readonly access: Access,
	) {}
}
