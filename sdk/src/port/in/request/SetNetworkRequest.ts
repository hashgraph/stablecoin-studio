import { Environment } from '../../../domain/context/network/Environment.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export interface SetNetworkRequestProps {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;
}

export default class SetNetworkRequest extends ValidatedRequest<SetNetworkRequest> {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;
	constructor(props: SetNetworkRequestProps) {
		super({
			environment: Validation.checkString({ emptyCheck: true }),
		});
		Object.assign(this, props);
	}
}
