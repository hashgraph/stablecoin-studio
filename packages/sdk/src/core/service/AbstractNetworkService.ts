/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import Configuration from '../../domain/context/network/Configuration.js';
import { Environment } from '../../domain/context/network/Environment.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';
import BackendEndpoint from '../../domain/context/network/BackendEndpoint.js';
import { ConsensusNode } from '../../domain/context/network/ConsensusNodes.js';

export class AbstractNetworkService {
	get environment(): Environment {
		throw new Error('Method not implemented.');
	}
	set environment(_value: Environment) {
		throw new Error('Method not implemented.');
	}

	get configuration(): Configuration {
		throw new Error('Method not implemented.');
	}
	set configuration(_value: Configuration) {
		throw new Error('Method not implemented.');
	}

	get mirrorNode(): MirrorNode {
		throw new Error('Method not implemented.');
	}
	set mirrorNode(_value: MirrorNode) {
		throw new Error('Method not implemented.');
	}

	get rpcNode(): JsonRpcRelay {
		throw new Error('Method not implemented.');
	}
	set rpcNode(_value: JsonRpcRelay) {
		throw new Error('Method not implemented.');
	}

	get consensusNodes(): ConsensusNode[] | undefined {
		throw new Error('Method not implemented.');
	}
	set consensusNodes(_value: ConsensusNode[] | undefined) {
		throw new Error('Method not implemented.');
	}

	get backend(): BackendEndpoint {
		throw new Error('Method not implemented.');
	}
	set backend(_value: BackendEndpoint) {
		throw new Error('Method not implemented.');
	}
}
