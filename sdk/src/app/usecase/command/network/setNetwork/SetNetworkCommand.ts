import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import { Environment } from '../../../../../domain/context/network/Environment.js';
import { MirrorNode } from '../../../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../../../domain/context/network/JsonRpcRelay.js';
import { ConsensusNode } from '../../../../../domain/context/network/ConsensusNodes.js';

export class SetNetworkCommandResponse implements CommandResponse {
	constructor(
		public readonly environment: Environment,
		public readonly mirrorNode: MirrorNode,
		public readonly rpcNode: JsonRpcRelay,
		public readonly consensusNodes: ConsensusNode[],
	) {}
}

export class SetNetworkCommand extends Command<SetNetworkCommandResponse> {
	constructor(
		public readonly environment: Environment,
		public readonly mirrorNode: MirrorNode,
		public readonly rpcNode: JsonRpcRelay,
		public readonly consensusNodes?: ConsensusNode[],
	) {
		super();
	}
}
