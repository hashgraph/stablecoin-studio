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

import { PublicKey as HPublicKey } from '@hiero-ledger/sdk';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import PublicKey from '../../../../../domain/context/account/PublicKey.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import { UpdateCommand, UpdateCommandResponse } from './UpdateCommand.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import type { KeyDef, UpdateTokenParams } from '../../../../../core/operations/types.js';
import { ethers } from 'ethers';

const KEY_TYPE_BITS = [1, 2, 4, 8, 16, 32, 64];

@CommandHandler(UpdateCommand)
export class UpdateCommandHandler implements ICommandHandler<UpdateCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: UpdateCommand): Promise<UpdateCommandResponse> {
		const {
			tokenId,
			name,
			symbol,
			autoRenewPeriod,
			expirationTime,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			metadata,
		} = command;
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);

		const evmProxyAddress = capabilities.coin.evmProxyAddress?.toString();
		if (!evmProxyAddress) {
			throw new Error(
				`StableCoin ${capabilities.coin.name} does not have a proxy address`,
			);
		}

		// Build keys — admin(0) and supply(4) are never updated
		const providedKeys: (PublicKey | undefined)[] = [
			undefined,       // admin key — never updated
			kycKey,
			freezeKey,
			wipeKey,
			undefined,       // supply key — never updated
			feeScheduleKey,
			pauseKey,
		];

		const keys: KeyDef[] = [];
		for (let i = 0; i < providedKeys.length; i++) {
			const pk = providedKeys[i];
			if (pk) {
				const isNull = pk.key === PublicKey.NULL.key;
				keys.push({
					keyType: BigInt(KEY_TYPE_BITS[i]),
					publicKey: isNull
						? '0x'
						: ethers.hexlify(
								HPublicKey.fromString(pk.key).toBytesRaw(),
						  ),
					isEd25519: pk.type === 'ED25519',
				});
			}
		}

		const params: UpdateTokenParams = {
			contractAddress: evmProxyAddress,
			tokenName: name,
			tokenSymbol: symbol,
			keys: keys.length > 0 ? keys : [],
			second: expirationTime
				? Math.floor(expirationTime / 1000000000)
				: -1,
			autoRenewPeriod: autoRenewPeriod ?? -1,
			tokenMetadataURI: metadata,
		};

		const res = await this.transactionService.executeOperation(
			'updateToken',
			params as unknown as Record<string, unknown>,
		);

		return new UpdateCommandResponse(
			res.error === undefined,
			res.id,
		);
	}
}
