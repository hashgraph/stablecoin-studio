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

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { BigNumber, ethers } from 'ethers';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../app/service/NetworkService.js';
import LogService from '../../../app/service/LogService.js';
import {
	AggregatorV3Interface__factory,
	HederaTokenManagerFacet__factory,
	StableCoinFactoryFacet__factory,
	HederaReserveFacet__factory,
	ReserveFacet__factory,
	SupplierAdminFacet__factory,
	RolesFacet__factory,
	DiamondFacet__factory,
	HoldManagementFacet__factory,
	BurnableFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import {
	HoldDetails,
	HoldIdentifier,
} from '../../../domain/context/hold/Hold.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal';

const LOCAL_JSON_RPC_RELAY_URL = 'http://127.0.0.1:7546/api';

const HederaTokenManagerFacet = HederaTokenManagerFacet__factory;
const Reserve = AggregatorV3Interface__factory;
const FactoryFacet = StableCoinFactoryFacet__factory;
const HederaReserveFacet = HederaReserveFacet__factory;
const ReserveFacet = ReserveFacet__factory;
const SupplierAdminFacet = SupplierAdminFacet__factory;
const RolesFacet = RolesFacet__factory;

type StaticConnect = { connect: (...args: any[]) => any };

type FactoryContract<T extends StaticConnect> = T['connect'] extends (
	...args: any[]
) => infer K
	? K
	: never;

@singleton()
export class RPCQueryAdapter {
	provider: ethers.providers.JsonRpcProvider;

	constructor(
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
	) {}

	async init(urlRpcProvider?: string, apiKey?: string): Promise<string> {
		const url = urlRpcProvider
			? apiKey
				? urlRpcProvider + apiKey
				: urlRpcProvider
			: LOCAL_JSON_RPC_RELAY_URL;
		this.provider = new ethers.providers.JsonRpcProvider(url);
		LogService.logTrace('RPC Query Adapter Initialized on: ', url);

		return this.networkService.environment;
	}

	connect<T extends StaticConnect>(
		fac: T,
		address: string,
	): FactoryContract<T> {
		return fac.connect(address, this.provider);
	}

	async balanceOf(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<BigNumber> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			HederaTokenManagerFacet,
			address.toString(),
		).balanceOf(target.toString());
	}

	async getReserveAddress(address: EvmAddress): Promise<ContractId> {
		LogService.logTrace(
			`Requesting getReserveAddress address: ${address.toString()}`,
		);
		const val = await this.connect(
			ReserveFacet,
			address.toString(),
		).getReserveAddress();

		if (
			val == undefined ||
			val.toString() == '0x0000000000000000000000000000000000000000'
		) {
			return new ContractId('0.0.0');
		} else {
			return ContractId.fromHederaContractId(
				HContractId.fromString(
					(await this.mirrorNode.getContractInfo(val)).id.toString(),
				),
			);
		}
	}

	async getReserveAmount(address: EvmAddress): Promise<BigNumber> {
		LogService.logTrace(`Requesting getReserveAmount address: ${address}`);
		return await this.connect(
			ReserveFacet,
			address.toString(),
		).getReserveAmount();
	}

	async getReserveLatestRoundData(address: EvmAddress): Promise<BigNumber[]> {
		LogService.logTrace(`Requesting getReserveAmount address: ${address}`);
		return await this.connect(
			HederaReserveFacet,
			address.toString(),
		).latestRoundData();
	}

	async isLimited(address: EvmAddress, target: EvmAddress): Promise<boolean> {
		LogService.logTrace(
			`Requesting isLimited address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			SupplierAdminFacet,
			address.toString(),
		).isUnlimitedSupplierAllowance(target.toString());
	}

	async isUnlimited(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<boolean> {
		LogService.logTrace(
			`Requesting isUnlimited address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			SupplierAdminFacet,
			address.toString(),
		).isUnlimitedSupplierAllowance(target.toString());
	}

	async getRoles(address: EvmAddress, target: EvmAddress): Promise<string[]> {
		LogService.logTrace(
			`Requesting getRoles address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(RolesFacet, address.toString()).getRoles(
			target.toString(),
		);
	}

	async getAccountsWithRole(
		address: EvmAddress,
		role: string,
	): Promise<string[]> {
		LogService.logTrace(
			`Requesting getAccountsWithRole address: ${address.toString()}, target: ${role}`,
		);
		return await this.connect(
			RolesFacet,
			address.toString(),
		).getAccountsWithRole(role);
	}

	async hasRole(
		address: EvmAddress,
		target: EvmAddress,
		role: StableCoinRole,
	): Promise<boolean> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(RolesFacet, address.toString()).hasRole(
			role,
			target.toString(),
		);
	}

	async supplierAllowance(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<BigNumber> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			SupplierAdminFacet,
			address.toString(),
		).getSupplierAllowance(target.toString());
	}

	async getReserveDecimals(address: EvmAddress): Promise<number> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}`,
		);
		return await this.connect(Reserve, address.toString()).decimals();
	}

	async getMetadata(address: EvmAddress): Promise<string> {
		LogService.logTrace(`Requesting metadata: ${address.toString()}`);
		return await this.connect(
			HederaTokenManagerFacet,
			address.toString(),
		).getMetadata();
	}

	async getConfigInfo(
		address: EvmAddress,
	): Promise<[string, string, number]> {
		LogService.logTrace(`Getting config info for ${address.toString()}`);
		const configInfo = await this.connect(
			DiamondFacet__factory,
			address.toString(),
		).getConfigInfo();
		return [
			configInfo.resolver_.toString(),
			configInfo.configurationId_,
			configInfo.version_.toNumber(),
		];
	}

	async getHoldFor(
		address: EvmAddress,
		target: EvmAddress,
		holdId: number,
	): Promise<HoldDetails> {
		LogService.logTrace(`Getting hold details for ${target.toString()}`);
		const holdIdentifier: HoldIdentifier = {
			tokenHolder: target.toString(),
			holdId,
		};
		const hold = await this.connect(
			HoldManagementFacet__factory,
			address.toString(),
		).getHoldFor(holdIdentifier);

		return new HoldDetails(
			hold.expirationTimestamp_.toNumber(),
			new BigDecimal(hold.amount_.toString()),
			hold.escrow_,
			target.toString(),
			hold.destination_,
			hold.data_,
		);
	}

	async getHoldsIdFor(
		address: EvmAddress,
		target: EvmAddress,
		start: number,
		end: number,
	): Promise<number[]> {
		LogService.logTrace(
			`Getting hold IDs for ${target.toString()} from ${start} to ${end}`,
		);

		const holdsIdFor = await this.connect(
			HoldManagementFacet__factory,
			address.toString(),
		).getHoldsIdFor(target.toString(), start, end);

		return holdsIdFor.map((id) => id.toNumber());
	}

	async getHeldAmountFor(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<BigDecimal> {
		LogService.logTrace(`Getting held amount for ${target.toString()}`);

		const heldAmountFor = await this.connect(
			HoldManagementFacet__factory,
			address.toString(),
		).getHeldAmountFor(target.toString());

		return new BigDecimal(heldAmountFor.toString());
	}

	async getHoldCountFor(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<number> {
		LogService.logTrace(`Getting hold count for ${target.toString()}`);

		const holdCountFor = await this.connect(
			HoldManagementFacet__factory,
			address.toString(),
		).getHoldCountFor(target.toString());

		return holdCountFor.toNumber();
	}

	async getBurnableAmount(address: EvmAddress): Promise<string> {
		LogService.logTrace(`Getting burnable amount`);

		const burnableAmount = await this.connect(
			BurnableFacet__factory,
			address.toString(),
		).getBurnableAmount();

		return burnableAmount.toString();
	}
}
