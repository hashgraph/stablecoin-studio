import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import BackendEndpoint from '../../../../../domain/context/network/BackendEndpoint.js';

export class SetBackendCommandResponse implements CommandResponse {
	constructor(public readonly backendEndpoint: BackendEndpoint) {}
}

export class SetBackendCommand extends Command<SetBackendCommandResponse> {
	constructor(public readonly backendEndpoint: BackendEndpoint) {
		super();
	}
}
