/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { TransactionAdapterInitializationData as InitalizationData } from '../out/TransactionAdapter.js';
import { ConnectCommand } from '../../app/usecase/command/network/connect/ConnectCommand.js';
import ConnectRequest from './request/ConnectRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import TransactionService from '../../app/service/TransactionService.js';

export { InitalizationData };

interface INetworkInPort {
	connect(req: ConnectRequest): Promise<InitalizationData>;
	disconnect(): Promise<boolean>;
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

	async connect(req: ConnectRequest): Promise<InitalizationData> {
		const account = RequestMapper.mapAccount(req.account);
		const res = await this.commandBus.execute(
			new ConnectCommand(account, req.wallet),
		);
		return res.payload;
	}

	disconnect(): Promise<boolean> {
		return this.transactionService.getHandler().stop();
	}
}

const Network = new NetworkInPort();
export default Network;
