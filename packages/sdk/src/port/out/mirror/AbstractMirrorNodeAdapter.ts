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

/* eslint-disable @typescript-eslint/no-unused-vars */

import StableCoinViewModel from './response/StableCoinViewModel.js';
import AccountViewModel from './response/AccountViewModel.js';
import StableCoinListViewModel from './response/StableCoinListViewModel.js';
import TransactionResultViewModel from './response/TransactionResultViewModel.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { AccountTokenRelationViewModel } from './response/AccountTokenRelationViewModel.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import ContractViewModel from './response/ContractViewModel.js';
import { AccountAutoAssociationViewModel } from './response/AccountAutoAssociationViewModel.js';

export class AbstractMirrorNodeAdapter {
	set(_mnConfig: MirrorNode): void {
		throw new Error('Method not implemented.');
	}

	getStableCoinsList(
		_accountId: HederaId,
	): Promise<StableCoinListViewModel> {
		throw new Error('Method not implemented.');
	}

	getStableCoin(_tokenId: HederaId): Promise<StableCoinViewModel> {
		throw new Error('Method not implemented.');
	}

	getAccountInfo(
		_accountId: HederaId | string,
	): Promise<AccountViewModel> {
		throw new Error('Method not implemented.');
	}

	getContractMemo(_contractId: HederaId): Promise<string> {
		throw new Error('Method not implemented.');
	}

	getContractInfo(
		_contractEvmAddress: string,
	): Promise<ContractViewModel> {
		throw new Error('Method not implemented.');
	}

	getAccountToken(
		_targetId: HederaId,
		_tokenId: HederaId,
	): Promise<AccountTokenRelationViewModel | undefined> {
		throw new Error('Method not implemented.');
	}

	getAccountAutoAssociationInfo(
		_targetId: HederaId,
	): Promise<AccountAutoAssociationViewModel | undefined> {
		throw new Error('Method not implemented.');
	}

	getTransactionResult(
		_transactionId: string,
	): Promise<TransactionResultViewModel> {
		throw new Error('Method not implemented.');
	}

	getTransactionFinalError(
		_transactionId: string,
	): Promise<TransactionResultViewModel> {
		throw new Error('Method not implemented.');
	}

	accountEvmAddressToHederaId(
		_accountAddress: string,
	): Promise<string> {
		throw new Error('Method not implemented.');
	}

	accountToEvmAddress(_accountId: HederaId): Promise<EvmAddress> {
		throw new Error('Method not implemented.');
	}

	getHBARBalance(
		_accountId: HederaId | string,
	): Promise<BigDecimal> {
		throw new Error('Method not implemented.');
	}

	getContractResults(
		_transactionId: string,
		_numberOfResultItems: number,
		_timeout?: number,
		_requestInterval?: number,
	): Promise<string[] | null> {
		throw new Error('Method not implemented.');
	}
}
