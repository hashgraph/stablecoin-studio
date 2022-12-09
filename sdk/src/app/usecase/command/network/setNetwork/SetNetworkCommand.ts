import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import { Environment } from '../../../../../domain/context/network/Environment.js';

export class SetNetworkCommandResponse implements CommandResponse {
	constructor(
		public readonly environment: Environment,
		public readonly mirrorNode: string,
		public readonly rpcNode: string,
		public readonly consensusNodes: string,
	) {}
}

export class SetNetworkCommand extends Command<SetNetworkCommandResponse> {
	constructor(
		public readonly environment: Environment,
		public readonly mirrorNode?: string,
		public readonly rpcNode?: string,
		public readonly consensusNodes?: string,
	) {
		super();
	}
}
