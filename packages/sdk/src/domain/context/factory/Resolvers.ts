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

import { Environment } from '../network/Environment.js';

export class EnvironmentResolver {
	resolver: string;
	environment: Environment;

	constructor(resolver: string, environment: Environment) {
		this.resolver = resolver;
		this.environment = environment;
	}
}

export class Resolvers {
	resolvers: EnvironmentResolver[];

	constructor(resolvers: EnvironmentResolver[]) {
		this.resolvers = resolvers;
	}
}
