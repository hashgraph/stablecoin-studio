import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
	SetNetworkCommand,
	SetNetworkCommandResponse,
} from './SetNetworkCommand.js';

@CommandHandler(SetNetworkCommand)
export class SetNetworkCommandHandler
	implements ICommandHandler<SetNetworkCommand>
{
	constructor(
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {}

	async execute(
		command: SetNetworkCommand,
	): Promise<SetNetworkCommandResponse> {
		this.networkService.environment = command.environment;
		if (command.consensusNodes)
			this.networkService.consensusNodes = command.consensusNodes;
		if (command.mirrorNode)
			this.networkService.mirrorNode = command.mirrorNode;
		if (command.rpcNode) this.networkService.rpcNode = command.rpcNode;

		this.mirrorNodeAdapter.setEnvironment(command.environment);

		return Promise.resolve(
			new SetNetworkCommandResponse(
				this.networkService.environment,
				this.networkService.mirrorNode ?? '',
				this.networkService.rpcNode ?? '',
				this.networkService.consensusNodes ?? '',
			),
		);
	}
}
