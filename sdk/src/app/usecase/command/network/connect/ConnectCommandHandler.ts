import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import { InvalidWalletTypeError as InvalidWalletTypeError } from '../../../../../domain/context/network/error/InvalidWalletAccountTypeError.js';
import { WalletConnectError } from '../../../../../domain/context/network/error/WalletConnectError.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import { HashpackTransactionAdapter } from '../../../../../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { HTSTransactionAdapter } from '../../../../../port/out/hs/hts/HTSTransactionAdapter.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCTransactionAdapter from '../../../../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../../../../port/out/TransactionAdapter.js';
import LogService from '../../../../service/LogService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
	async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		try {
			const handler = this.getHandlerClass(command.wallet);
			const registration = await handler.register(command.account);

			// Change mirror node adapter network
			const adapter = Injectable.resolve(MirrorNodeAdapter);
			adapter.setEnvironment(command.environment);

			return Promise.resolve(
				new ConnectCommandResponse(registration, command.wallet),
			);
		} catch (error) {
			const err = new WalletConnectError((error as Error).message);
			LogService.logError(err);
			throw err;
		}
	}

	private getHandlerClass(type: SupportedWallets): TransactionAdapter {
		switch (type) {
			case SupportedWallets.HASHPACK:
				if (!this.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(HashpackTransactionAdapter);
			case SupportedWallets.METAMASK:
				if (!this.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(RPCTransactionAdapter);
			default:
				return Injectable.resolve(HTSTransactionAdapter);
		}
	}

	private isWeb(): boolean {
		return !!global.window;
	}
}
