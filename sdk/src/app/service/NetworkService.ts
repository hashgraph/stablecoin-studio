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

import { singleton, inject } from 'tsyringe';
import { Environment } from '../../domain/context/network/Environment.js';
import Service from './Service.js';

export interface NetworkProps {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;
}

@singleton()
export default class NetworkService extends Service implements NetworkProps {
	private _environment: Environment;
	private _mirrorNode?: string | undefined;
	private _rpcNode?: string | undefined;
	private _consensusNodes?: string | undefined;

	public set environment(value: Environment) {
		this._environment = value;
	}

	public get environment(): Environment {
		return this._environment;
	}

	public get mirrorNode(): string | undefined {
		return this._mirrorNode;
	}

	public set mirrorNode(value: string | undefined) {
		this._mirrorNode = value;
	}

	public get rpcNode(): string | undefined {
		return this._rpcNode;
	}

	public set rpcNode(value: string | undefined) {
		this._rpcNode = value;
	}

	public get consensusNodes(): string | undefined {
		return this._consensusNodes;
	}

	public set consensusNodes(value: string | undefined) {
		this._consensusNodes = value;
	}

	constructor(@inject('NetworkProps') props?: NetworkProps) {
		super();
		Object.assign(this, props);
	}
}
