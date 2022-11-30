/*export enum Capability {
	CASH_IN = 'Cash in',
	CASH_IN_HTS = 'Cash in hts',
	DETAILS = 'Details',
	BALANCE = 'Balance',
	BURN = 'Burn',
	BURN_HTS = 'Burn hts',
	WIPE = 'Wipe',
	WIPE_HTS = 'Wipe hts',
	FREEZE = 'Freeze',
	FREEZE_HTS = 'Freeze hts',
	PAUSE = 'Pause',
	PAUSE_HTS = 'Pause hts',
	DELETE = 'Delete',
	DELETE_HTS = 'Delete hts',
	RESCUE = 'Rescue',
	ROLE_MANAGEMENT = 'Role management',
}*/

export enum Operation {
	CASH_IN = 'Cash_in',
	BURN = 'Burn',
	WIPE = 'Wipe',
	FREEZE = 'Freeze',
	PAUSE = 'Pause',
	DELETE = 'Delete',
	RESCUE = 'Rescue',
	ROLE_MANAGEMENT = 'Role_Management',
}

export enum Access {
	HTS,
	CONTRACT,
}


export class Capability{
	constructor(
		public readonly operation: Operation,
		public readonly access: Access,
	) {}
}
