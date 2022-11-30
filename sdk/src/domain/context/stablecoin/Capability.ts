export enum Capability {
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
}


export enum Operations{
	CASH_IN,
	BURN,
	WIPE,
	FREEZE,
	PAUSE,
	DELETE,
	RESCUE,
	ROLE_MANAGEMENT
}

export enum Accesses{
	HTS,
	CONTRACT
}

/*
export class Capability{
	constructor(
		public readonly operation: Operations,
		public readonly access: Accesses,
	) {}
}*/