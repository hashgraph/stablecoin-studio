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

import { singleton, inject } from 'tsyringe';
import Configuration from '../../domain/context/network/Configuration.js';
import { Environment } from '../../domain/context/network/Environment.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';
import Service from './Service.js';
import BackendEndpoint from '../../domain/context/network/BackendEndpoint.js';

export interface NetworkProps {
	environment: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	consensusNodes?: string;
	configuration?: Configuration;
}

@singleton()
export default class NetworkService extends Service implements NetworkProps {
	private _environment: Environment;
	private _mirrorNode: MirrorNode;
	private _rpcNode: JsonRpcRelay;
	private _consensusNodes?: string | undefined;
	private _configuration: Configuration;
	private _backend: BackendEndpoint;

	public set environment(value: Environment) {
		this._environment = value;
	}

	public get environment(): Environment {
		return this._environment;
	}

	public set configuration(value: Configuration) {
		this._configuration = value;
	}

	public get configuration(): Configuration {
		return this._configuration;
	}

	public get mirrorNode(): MirrorNode {
		return this._mirrorNode;
	}

	public set mirrorNode(value: MirrorNode) {
		this._mirrorNode = value;
	}

	public get rpcNode(): JsonRpcRelay {
		return this._rpcNode;
	}

	public set rpcNode(value: JsonRpcRelay) {
		this._rpcNode = value;
	}

	public get consensusNodes(): string | undefined {
		return this._consensusNodes;
	}

	public set consensusNodes(value: string | undefined) {
		this._consensusNodes = value;
	}

	public set backend(value: BackendEndpoint) {
		this._backend = value;
	}

	public get backend(): BackendEndpoint {
		return this._backend;
	}

	constructor(@inject('NetworkProps') props?: NetworkProps) {
		super();
		Object.assign(this, props);
	}
}
