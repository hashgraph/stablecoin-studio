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

import { Environment } from '../../domain/context/network/Environment.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';

/**
 * Abstraction for network reconfiguration.
 * Port/out adapters depend on this instead of importing app-layer commands directly.
 */
export class NetworkConfigurator {
	setNetwork(
		_environment: Environment,
		_mirrorNode: MirrorNode,
		_rpcNode: JsonRpcRelay,
	): Promise<void> {
		throw new Error('Method not implemented.');
	}

	setConfiguration(
		_factoryAddress: string,
		_resolverAddress: string,
	): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
