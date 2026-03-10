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

import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ExternalHederaTransactionAdapter } from '../../../../../port/out/hs/external/ExternalHederaTransactionAdapter.js';
import { ExternalEVMTransactionAdapter } from '../../../../../port/out/hs/external/ExternalEVMTransactionAdapter.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';
import LogService from '../../../../service/LogService.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
	async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		LogService.logTrace('ConnectCommandHandler: wallet=', command.wallet);
		const handler = TransactionService.getHandlerClass(command.wallet);

		const input =
			command.custodialSettings === undefined
				? command.hWCSettings === undefined
					? command.account!
					: command.hWCSettings
				: command.custodialSettings;

		if (
			command.wallet === SupportedWallets.EXTERNAL_HEDERA &&
			handler instanceof ExternalHederaTransactionAdapter
		) {
			handler.setExternalWalletSettings(
				command.externalWalletSettings?.validStartOffsetMinutes,
			);
		} else if (
			command.wallet === SupportedWallets.EXTERNAL_EVM &&
			handler instanceof ExternalEVMTransactionAdapter
		) {
			handler.setExternalWalletSettings(
				command.externalWalletSettings?.validStartOffsetMinutes,
			);
		}

		// TypeScript resolves handler.register() to the narrowest override
		// (e.g. ExternalHederaTransactionAdapter accepts only Account), so a
		// full-union cast triggers a type error. Runtime behaviour is correct:
		// each adapter validates its own input internally.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const registration = await handler.register(input as any);

		return Promise.resolve(
			new ConnectCommandResponse(registration, command.wallet),
		);
	}
}
