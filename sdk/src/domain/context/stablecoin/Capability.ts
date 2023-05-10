/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
	RESCUE_HBAR = 'Rescue_Hbar',
	ROLE_MANAGEMENT = 'Role_Management',
	ROLE_ADMIN_MANAGEMENT = 'Admin_Role',
	RESERVE_MANAGEMENT = 'Reserve_Management',
	GRANT_KYC = 'Grant_KYC',
	REVOKE_KYC = 'Revoke_KYC',
	CREATE_CUSTOM_FEE = 'Create_Custom_Fee',
	REMOVE_CUSTOM_FEE = 'Remove_Custom_Fee',
	TRANSFERS = 'Transfers',
	UPDATE = 'Update',
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
