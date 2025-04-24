import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';

export class SetConfigurationCommandResponse implements CommandResponse {
	constructor(
		public readonly factoryAddress: string,
		public readonly resolverAddress: string,
	) {}
}

export class SetConfigurationCommand extends Command<SetConfigurationCommandResponse> {
	constructor(
		public readonly factoryAddress: string,
		public readonly resolverAddress: string,
	) {
		super();
	}
}
