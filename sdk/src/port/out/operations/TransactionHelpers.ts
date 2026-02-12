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

import { ethers } from 'ethers';
import {
	BurnableFacet__factory,
	CashInFacet__factory,
	CustomFeesFacet__factory,
	DeletableFacet__factory,
	DiamondFacet__factory,
	FreezableFacet__factory,
	HederaReserveFacet__factory,
	HederaTokenManagerFacet__factory,
	HoldManagementFacet__factory,
	IHRC__factory,
	KYCFacet__factory,
	PausableFacet__factory,
	RescuableFacet__factory,
	ReserveFacet__factory,
	RoleManagementFacet__factory,
	RolesFacet__factory,
	SupplierAdminFacet__factory,
	WipeableFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	ASSOCIATE_GAS,
	BALANCE_OF_GAS,
	BURN_GAS,
	CASHIN_GAS,
	CREATE_HOLD_GAS,
	DECREASE_SUPPLY_GAS,
	DELETE_GAS,
	EVM_ZERO_ADDRESS,
	EXECUTE_HOLD_GAS,
	FREEZE_GAS,
	GET_RESERVE_ADDRESS_GAS,
	GET_RESERVE_AMOUNT_GAS,
	GET_ROLES_GAS,
	GET_SUPPLY_ALLOWANCE_GAS,
	GRANT_KYC_GAS,
	GRANT_ROLES_GAS,
	HAS_ROLE_GAS,
	INCREASE_SUPPLY_GAS,
	IS_UNLIMITED_ALLOWANCE_GAS,
	MAX_ROLES_GAS,
	PAUSE_GAS,
	RECLAIM_HOLD_GAS,
	RELEASE_HOLD_GAS,
	RESCUE_GAS,
	RESCUE_HBAR_GAS,
	RESET_SUPPLY_GAS,
	REVOKE_KYC_GAS,
	REVOKE_ROLES_GAS,
	UNFREEZE_GAS,
	UNPAUSE_GAS,
	UPDATE_CONFIG_GAS,
	UPDATE_CONFIG_VERSION_GAS,
	UPDATE_CUSTOM_FEES_GAS,
	UPDATE_RESERVE_ADDRESS_GAS,
	UPDATE_RESERVE_AMOUNT_GAS,
	UPDATE_RESOLVER_GAS,
	UPDATE_TOKEN_GAS,
	WIPE_GAS,
} from '../../../core/Constants';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { CustomFee as HCustomFee } from '@hiero-ledger/sdk/lib/exports';
import {
	fromHCustomFeeToSCFee,
	SC_FixedFee,
	SC_FractionalFee,
} from '../../../domain/context/fee/CustomFee';

/**
 * Helper utilities for transaction operations
 */
export class TransactionHelpers {
	/**
	 * Get the proxy address from the coin capabilities.
	 */
	static getProxyAddress(coin: StableCoinCapabilities): string {
		const proxyAddress = coin.coin.evmProxyAddress?.toString();
		if (!proxyAddress) {
			throw new Error(
				`StableCoin ${coin.coin.name} does not have a proxy address.`,
			);
		}
		return proxyAddress;
	}

	/**
	 * Get the ethers interface for a facet based on its name.
	 */
	static getFacetInterface(facetName: string): ethers.Interface {
		const factories: { [key: string]: any } = {
			WipeableFacet: WipeableFacet__factory,
			BurnableFacet: BurnableFacet__factory,
			FreezableFacet: FreezableFacet__factory,
			PausableFacet: PausableFacet__factory,
			KYCFacet: KYCFacet__factory,
			CashInFacet: CashInFacet__factory,
			DeletableFacet: DeletableFacet__factory,
			RescuableFacet: RescuableFacet__factory,
			RolesFacet: RolesFacet__factory,
			SupplierAdminFacet: SupplierAdminFacet__factory,
			RoleManagementFacet: RoleManagementFacet__factory,
			CustomFeesFacet: CustomFeesFacet__factory,
			HoldManagementFacet: HoldManagementFacet__factory,
			ReserveFacet: ReserveFacet__factory,
			HederaReserveFacet: HederaReserveFacet__factory,
			HederaTokenManagerFacet: HederaTokenManagerFacet__factory,
			DiamondFacet: DiamondFacet__factory,
			IHRC: IHRC__factory,
		};

		const factory = factories[facetName];
		if (!factory) {
			throw new Error(`Unknown facet: ${facetName}`);
		}
		return new ethers.Interface(factory.abi);
	}

	/**
	 * Get the gas limit for an operation.
	 */
	static getGasLimit(operation: string): number {
		const gasLimits: { [key: string]: number } = {
			ASSOCIATE: ASSOCIATE_GAS,
			BALANCE_OF: BALANCE_OF_GAS,
			WIPE: WIPE_GAS,
			BURN: BURN_GAS,
			FREEZE: FREEZE_GAS,
			UNFREEZE: UNFREEZE_GAS,
			PAUSE: PAUSE_GAS,
			UNPAUSE: UNPAUSE_GAS,
			GRANT_KYC: GRANT_KYC_GAS,
			REVOKE_KYC: REVOKE_KYC_GAS,
			CASHIN: CASHIN_GAS,
			DELETE: DELETE_GAS,
			RESCUE: RESCUE_GAS,
			RESCUE_HBAR: RESCUE_HBAR_GAS,
			GRANT_ROLES: GRANT_ROLES_GAS,
			REVOKE_ROLES: REVOKE_ROLES_GAS,
			MAX_ROLES: MAX_ROLES_GAS,
			HAS_ROLE: HAS_ROLE_GAS,
			GET_ROLES: GET_ROLES_GAS,
			GET_SUPPLY_ALLOWANCE: GET_SUPPLY_ALLOWANCE_GAS,
			IS_UNLIMITED_ALLOWANCE: IS_UNLIMITED_ALLOWANCE_GAS,
			INCREASE_SUPPLY: INCREASE_SUPPLY_GAS,
			DECREASE_SUPPLY: DECREASE_SUPPLY_GAS,
			RESET_SUPPLY: RESET_SUPPLY_GAS,
			UPDATE_CUSTOM_FEES: UPDATE_CUSTOM_FEES_GAS,
			CREATE_HOLD: CREATE_HOLD_GAS,
			EXECUTE_HOLD: EXECUTE_HOLD_GAS,
			RELEASE_HOLD: RELEASE_HOLD_GAS,
			RECLAIM_HOLD: RECLAIM_HOLD_GAS,
			GET_RESERVE_ADDRESS: GET_RESERVE_ADDRESS_GAS,
			GET_RESERVE_AMOUNT: GET_RESERVE_AMOUNT_GAS,
			UPDATE_RESERVE_ADDRESS: UPDATE_RESERVE_ADDRESS_GAS,
			UPDATE_RESERVE_AMOUNT: UPDATE_RESERVE_AMOUNT_GAS,
			UPDATE_TOKEN: UPDATE_TOKEN_GAS,
			UPDATE_CONFIG_VERSION: UPDATE_CONFIG_VERSION_GAS,
			UPDATE_CONFIG: UPDATE_CONFIG_GAS,
			UPDATE_RESOLVER: UPDATE_RESOLVER_GAS,
		};

		const gas = gasLimits[operation];
		if (gas === undefined) {
			throw new Error(`Unknown operation for gas limit: ${operation}`);
		}
		return gas;
	}

	/**
	 * Query a contract (read-only call).
	 */
	static async queryContract(
		contractAddress: string,
		iface: ethers.Interface,
		functionName: string,
		params: any[],
		rpcUrl: string,
	): Promise<TransactionResponse> {
		try {
			const provider = new ethers.JsonRpcProvider(rpcUrl);
			const contract = new ethers.Contract(
				contractAddress,
				iface,
				provider,
			);
			const res = await contract[functionName](...params);
			return new TransactionResponse(undefined, res);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Query failed for ${functionName}: ${error}`,
			);
		}
	}

	/**
	 * Prepare custom fees for the contract.
	 */
	static async prepareCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
		mirrorNodeAdapter: any,
	): Promise<{
		fixedFees: SC_FixedFee[];
		fractionalFees: SC_FractionalFee[];
	}> {
		const fixedFees: SC_FixedFee[] = [];
		const fractionalFees: SC_FractionalFee[] = [];

		for (const cf of customFees) {
			const feeCollector = cf.feeCollectorAccountId
				? (
						await mirrorNodeAdapter.getAccountInfo(
							cf.feeCollectorAccountId.toString(),
						)
				  ).accountEvmAddress!
				: EVM_ZERO_ADDRESS;

			const scFee = fromHCustomFeeToSCFee(
				cf,
				coin.coin.tokenId!.toString(),
				feeCollector,
			);
			if (scFee instanceof SC_FixedFee) fixedFees.push(scFee);
			else fractionalFees.push(scFee as SC_FractionalFee);
		}

		return { fixedFees, fractionalFees };
	}

	/**
	 * Get the zero address constant.
	 */
	static getZeroAddress(): string {
		return EVM_ZERO_ADDRESS;
	}
}
