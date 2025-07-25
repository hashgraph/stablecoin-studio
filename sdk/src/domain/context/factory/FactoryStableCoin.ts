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

import { FactoryCashinRole } from './FactoryCashinRole.js';
import { KeysStruct } from './FactoryKey.js';
import { FactoryRole } from './FactoryRole.js';
import { ResolverProxyConfiguration } from './ResolverProxyConfiguration.js';

export class FactoryStableCoin {
	/**
	 * Name of the token
	 */
	public tokenName: string;

	/**
	 * Symbol of the token
	 */
	public tokenSymbol: string;

	/**
	 * Freeze account by default
	 */
	public freeze: boolean;

	/**
	 * Token supply type
	 */
	public supplyType: boolean;

	/**
	 * Maximum Supply
	 */
	public tokenMaxSupply: string;

	/**
	 * Initial Supply
	 */
	public tokenInitialSupply: string;

	/**
	 * Decimals the token will have, must be at least 0 and less than 18
	 */
	public tokenDecimals: number;

	/**
	 * Token auto-renew account
	 */
	// public autoRenewAccountAddress: string;

	/**
	 * Token treasury account
	 */
	// public treasuryAddress: string;

	/**
	 * Reserve contract
	 */
	public reserveAddress: string;

	/**
	 * Reserve initial amount
	 */
	public reserveInitialAmount: string;

	/**
	 * Create Reserver contract or not
	 */
	public createReserve: boolean;

	/**
	 * Grant KYC Original Sender or not
	 */
	// public grantKYCToOriginalSender: boolean;

	/**
	 * Token Keys
	 */
	public keys: KeysStruct[];

	/**
	 * Roles
	 */
	public roles: FactoryRole[];

	/**
	 * Cash In role
	 */
	public cashinRole: FactoryCashinRole;

	/**
	 * Metadata
	 */
	public metadata: string;

	/**
	 * Business Logic Resolver address
	 */
	public businessLogicResolverAddress: string;

	/**
	 * StableCoin Configuration Id
	 */
	public stableCoinConfigurationId: ResolverProxyConfiguration;

	/**
	 * Reserve Configuration Id
	 */
	public reserveConfigurationId: ResolverProxyConfiguration;

	constructor(
		tokenName: string,
		tokenSymbol: string,
		freeze: boolean,
		supplyType: boolean,
		tokenMaxSupply: string,
		tokenInitialSupply: string,
		tokenDecimals: number,
		// autoRenewAccountAddress: string,
		// treasuryAddress: string,
		reserveAddress: string,
		reserveInitialAmount: string,
		createReserve: boolean,
		// grantKYCToOriginalSender: boolean,
		keys: KeysStruct[],
		roles: FactoryRole[],
		cashinRole: FactoryCashinRole,
		metadata: string,
		businessLogicResolverAddress: string,
		stableCoinConfigurationId: ResolverProxyConfiguration,
		reserveConfigurationId: ResolverProxyConfiguration,
	) {
		this.tokenName = tokenName;
		this.tokenSymbol = tokenSymbol;
		this.freeze = freeze;
		this.supplyType = supplyType;
		this.tokenMaxSupply = tokenMaxSupply;
		this.tokenInitialSupply = tokenInitialSupply;
		this.tokenDecimals = tokenDecimals;
		// this.autoRenewAccountAddress = autoRenewAccountAddress;
		// this.treasuryAddress = treasuryAddress;
		this.reserveAddress = reserveAddress;
		this.reserveInitialAmount = reserveInitialAmount;
		this.createReserve = createReserve;
		// this.grantKYCToOriginalSender = grantKYCToOriginalSender;
		this.keys = keys;
		this.roles = roles;
		this.cashinRole = cashinRole;
		this.metadata = metadata;
		this.businessLogicResolverAddress = businessLogicResolverAddress;
		this.stableCoinConfigurationId = stableCoinConfigurationId;
		this.reserveConfigurationId = reserveConfigurationId;
	}
}
