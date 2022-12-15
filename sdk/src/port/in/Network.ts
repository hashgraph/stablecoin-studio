/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { InitializationData } from '../out/TransactionAdapter.js';
import { ConnectCommand } from '../../app/usecase/command/network/connect/ConnectCommand.js';
import ConnectRequest, { SupportedWallets } from './request/ConnectRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import TransactionService from '../../app/service/TransactionService.js';
import SetNetworkRequest from './request/SetNetworkRequest.js';
import { SetNetworkCommand } from '../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { Environment } from '../../domain/context/network/Environment.js';
import InitializationRequest from './request/InitializationRequest.js';
import Event, { WalletEvents } from './Event.js';
import RPCTransactionAdapter from '../out/rpc/RPCTransactionAdapter.js';
import { HashpackTransactionAdapter } from '../out/hs/hashpack/HashpackTransactionAdapter.js';

export { InitializationData, SupportedWallets };

export type NetworkResponse = {
	environment: Environment;
	mirrorNode: string;
	rpcNode: string;
	consensusNodes: string;
};

interface INetworkInPort {
	connect(req: ConnectRequest): Promise<InitializationData>;
	disconnect(): Promise<boolean>;
	setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
}

class NetworkInPort implements INetworkInPort {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve<NetworkService>(
			NetworkService,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly transactionService: TransactionService = Injectable.resolve(
			TransactionService,
		),
	) {}

	async setNetwork(req: SetNetworkRequest): Promise<NetworkResponse> {
		const res = await this.commandBus.execute(
			new SetNetworkCommand(
				req.environment,
				req.mirrorNode,
				req.rpcNode,
				req.consensusNodes,
			),
		);
		return res;
	}

	async init(req: InitializationRequest): Promise<SupportedWallets[]> {
		await this.setNetwork(
			new SetNetworkRequest({ environment: req.network }),
		);
		req.events && Event.register(req.events);
		const wallets: SupportedWallets[] = [];
		const instances = Injectable.registerTransactionAdapterInstances();
		for (const val of instances) {
			if (val instanceof RPCTransactionAdapter) {
				wallets.push(SupportedWallets.METAMASK);
			} else if (val instanceof HashpackTransactionAdapter) {
				wallets.push(SupportedWallets.HASHPACK);
			} else {
				wallets.push(SupportedWallets.CLIENT);
			}
			await val.init();
		}
		return wallets;
	}

	async connect(req: ConnectRequest): Promise<InitializationData> {
		const account = RequestMapper.mapAccount(req.account);
		const res = await this.commandBus.execute(
			new ConnectCommand(req.network, req.wallet, account),
		);
		await this.commandBus.execute(new SetNetworkCommand(req.network));
		return res.payload;
	}

	disconnect(): Promise<boolean> {
		return this.transactionService.getHandler().stop();
	}
}

const Network = new NetworkInPort();
export default Network;
