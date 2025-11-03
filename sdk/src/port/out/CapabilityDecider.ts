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

import {Access, Operation,} from '../../domain/context/stablecoin/Capability.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {CapabilityError} from "./hs/error/CapabilityError";

export class CapabilityDecider {

	private static readonly SUPPORTED_CONTRACT_OPERATIONS: ReadonlySet<Operation> = new Set<Operation>([
		// Token lifecycle
		Operation.DELETE,
		Operation.WIPE,
		Operation.CASH_IN,
		Operation.BURN,
		Operation.UPDATE,

		// Token state
		Operation.FREEZE,
		Operation.UNFREEZE,
		Operation.PAUSE,
		Operation.UNPAUSE,

		// KYC
		Operation.GRANT_KYC,
		Operation.REVOKE_KYC,

		// Rescue operations
		Operation.RESCUE,
		Operation.RESCUE_HBAR,

		// Roles and permissions
		Operation.GRANT_ROLE,
		Operation.REVOKE_ROLE,
		Operation.GRANT_ROLES,
		Operation.REVOKE_ROLES,

		// Association
		Operation.ASSOCIATE,

		// Fees and configuration
		Operation.CREATE_CUSTOM_FEE,
		Operation.UPDATE_CONFIG,
		Operation.UPDATE_CONFIG_VERSION,
		Operation.UPDATE_RESOLVER,

		// Holds (token locks)
		Operation.CREATE_HOLD,
		Operation.CONTROLLER_CREATE_HOLD,
		Operation.EXECUTE_HOLD,
		Operation.RELEASE_HOLD,
		Operation.RECLAIM_HOLD,

		// Reserve management
		Operation.INCREASE_SUPPLIER_ALLOWANCE,
		Operation.DECREASE_SUPPLIER_ALLOWANCE,
		Operation.RESET_SUPPLIER_ALLOWANCE,
		Operation.GRANT_SUPPLIER_ROLE,
		Operation.GRANT_UNLIMITED_SUPPLIER_ROLE,
		Operation.REVOKE_SUPPLIER_ROLE,
		Operation.UPDATE_RESERVE_ADDRESS,

	]);


	static getAccessDecision(
		capabilities: StableCoinCapabilities,
		operation: Operation,
	): Decision {
		const capability = capabilities.capabilities.find(
			(cap) => cap.operation === operation,
		);

		if (!capability) {
			return Decision.FORBIDDEN;
		}

		return capability.access === Access.CONTRACT ? Decision.CONTRACT : Decision.HTS;
	}

	public static checkContractOperation(
		coin: StableCoinCapabilities,
		operation: Operation
	): void {
		const decision = this.getAccessDecision(coin, operation);
		const isSupported = this.SUPPORTED_CONTRACT_OPERATIONS.has(operation);

		if (decision !== Decision.CONTRACT || !isSupported) {
			const tokenId = coin?.coin?.tokenId?.value ?? 'N/A';
			throw new CapabilityError(
				`Operation '${operation}' cannot be performed via contract for token ${tokenId}.`,
				operation,
				tokenId
			);
		}
	}
}

export enum Decision {
	FORBIDDEN,
	HTS,
	CONTRACT,
}
