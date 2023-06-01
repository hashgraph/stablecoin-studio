/*
 *
 * Hedera Stable Coin SDK
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

import WalletEvent from '../../../app/service/event/WalletEvent.js';
import Configuration from '../../../domain/context/network/Configuration.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import {
	MirrorNode,
	MirrorNodes,
} from '../../../domain/context/network/MirrorNode.js';
import {
	JsonRpcRelay,
	JsonRpcRelays,
} from '../../../domain/context/network/JsonRpcRelay.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import { Factories } from '../../../domain/context/factory/Factories.js';

export { SupportedWallets };

export default class InitializationRequest
	extends ValidatedRequest<InitializationRequest>
	implements BaseRequest
{
	network: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	events?: Partial<WalletEvent>;
	configuration?: Configuration;
	mirrorNodes?: MirrorNodes;
	jsonRpcRelays?: JsonRpcRelays;
	factories?: Factories;

	constructor({
		network,
		mirrorNode,
		rpcNode,
		events,
		configuration,
		mirrorNodes,
		jsonRpcRelays,
		factories,
	}: {
		network: Environment;
		mirrorNode: MirrorNode;
		rpcNode: JsonRpcRelay;
		events?: Partial<WalletEvent>;
		configuration?: Configuration;
		mirrorNodes?: MirrorNodes;
		jsonRpcRelays?: JsonRpcRelays;
		factories?: Factories;
	}) {
		super({});
		this.network = network;
		this.mirrorNode = mirrorNode;
		this.rpcNode = rpcNode;
		this.events = events;
		this.configuration = configuration;
		this.mirrorNodes = mirrorNodes;
		this.jsonRpcRelays = jsonRpcRelays;
		this.factories = factories;
	}
}
