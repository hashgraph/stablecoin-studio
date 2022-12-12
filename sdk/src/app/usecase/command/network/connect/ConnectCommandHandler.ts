import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import Account from '../../../../../domain/context/account/Account.js';
import { InvalidWalletAccountTypeError } from '../../../../../domain/context/network/error/InvalidWalletAccountTypeError.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import { HashpackTransactionAdapter } from '../../../../../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { HTSTransactionAdapter } from '../../../../../port/out/hs/hts/HTSTransactionAdapter.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCTransactionAdapter from '../../../../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../../../../port/out/TransactionAdapter.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
	async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		const handler = this.getHandlerClass(command.wallet, command.account);
		const registration = await handler.register(command.account);

		// Change mirror node adapter network
		const adapter = Injectable.resolve(MirrorNodeAdapter);
		adapter.setEnvironment(command.environment);

		return Promise.resolve(
			new ConnectCommandResponse(registration, command.wallet),
		);
	}

	private getHandlerClass(
		type: SupportedWallets,
		account: Account,
	): TransactionAdapter {
		switch (type) {
			case SupportedWallets.HASHPACK:
				if (!this.isWeb()) {
					throw new InvalidWalletAccountTypeError(
						account.id.toString(),
						type,
					);
				}
				return Injectable.resolve(HashpackTransactionAdapter);
			case SupportedWallets.METAMASK:
				if (!this.isWeb()) {
					throw new InvalidWalletAccountTypeError(
						account.id.toString(),
						type,
					);
				}
				return Injectable.resolve(RPCTransactionAdapter);
			default:
				return Injectable.resolve(HTSTransactionAdapter);
		}
	}

	private isWeb() {
		return global.window;
	}
}
