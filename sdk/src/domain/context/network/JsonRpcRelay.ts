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

import { Environment } from './Environment';

export class JsonRpcRelay {
	name?: string;
	baseUrl: string;
	apiKey?: string;
	headerName?: string;

	constructor(
		baseUrl: string,
		name?: string,
		apiKey?: string,
		headerName?: string,
	) {
		this.name = name;
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.headerName = headerName;
	}
}

export class EnvironmentJsonRpcRelay {
	jsonRpcRelay: JsonRpcRelay;
	environment: Environment;

	constructor(jsonRpcRelay: JsonRpcRelay, environment: Environment) {
		this.jsonRpcRelay = jsonRpcRelay;
		this.environment = environment;
	}
}

export class JsonRpcRelays {
	nodes: EnvironmentJsonRpcRelay[];

	constructor(nodes: EnvironmentJsonRpcRelay[]) {
		this.nodes = nodes;
	}
}
