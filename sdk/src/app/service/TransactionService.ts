import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import { InvalidWalletTypeError } from '../../domain/context/network/error/InvalidWalletAccountTypeError.js';
import { SupportedWallets } from '../../domain/context/network/Wallet.js';
import { HashpackTransactionAdapter } from '../../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { HTSTransactionAdapter } from '../../port/out/hs/hts/HTSTransactionAdapter.js';
import RPCTransactionAdapter from '../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';

@singleton()
export default class TransactionService extends Service {
	constructor() {
		super();
	}

	getHandler(): TransactionAdapter {
		return Injectable.resolveTransactionHandler();
	}

	static getHandlerClass(type: SupportedWallets): TransactionAdapter {
		switch (type) {
			case SupportedWallets.HASHPACK:
				if (!Injectable.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(HashpackTransactionAdapter);
			case SupportedWallets.METAMASK:
				if (!Injectable.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(RPCTransactionAdapter);
			default:
				return Injectable.resolve(HTSTransactionAdapter);
		}
	}
}
