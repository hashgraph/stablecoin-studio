/*
 *
 * Hedera Stablecoin SDK
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
	UPDATE_CONFIG_VERSION = 'Update_Config_Version',
	UPDATE_CONFIG = 'Update_Config',
	UPDATE_RESOLVER = 'Update_Resolver',
	CREATE_HOLD = 'Create_Hold',
	CONTROLLER_CREATE_HOLD = 'Controller_Create_Hold',
	RELEASE_HOLD = 'Release_Hold',
	EXECUTE_HOLD = 'Execute_Hold',
	RECLAIM_HOLD = 'Reclaim_Hold',
	GRANT_KYC = 'Grant_KYC',
	REVOKE_KYC = 'Revoke_KYC',
	CREATE_CUSTOM_FEE = 'Create_Custom_Fee',
	REMOVE_CUSTOM_FEE = 'Remove_Custom_Fee',
	TRANSFERS = 'Transfers',
	UPDATE = 'Update',
	GRANT_ROLE = 'Grant_Role',
	//TODO: review capabilities names from SCs
	GRANT_ROLES = 'Role_Management',
	REVOKE_ROLE = 'Role_Management',
	REVOKE_ROLES = 'Role_Management',
	REVOKE_SUPPLIER_ROLE = 'Role_Management',
	RESET_SUPPLIER_ALLOWANCE = 'Role_Management',
	GRANT_SUPPLIER_ROLE = 'Role_Management',
	GRANT_UNLIMITED_SUPPLIER_ROLE = 'Role_Management',
	ASSOCIATE = 'Associate',
	INCREASE_SUPPLIER_ALLOWANCE = 'increaseSupplierAllowance',
	DECREASE_SUPPLIER_ALLOWANCE = 'decreaseSupplierAllowance',
	UPDATE_RESERVE_ADDRESS = 'updateReserveAddress'
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
