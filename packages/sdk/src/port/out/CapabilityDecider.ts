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

import {
	Access,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';

export class CapabilityDecider {
	static getAccessDecision(
		capabilities: StableCoinCapabilities,
		operation: Operation,
	): Decision {
		const capability = capabilities.capabilities.find(
			(cap) => cap.operation === operation,
		);

		if (!capability) {
			return Decision.FORBIDDEN;
		}

		return capability.access === Access.CONTRACT
			? Decision.CONTRACT
			: Decision.HTS;
	}
}

export enum Decision {
	FORBIDDEN,
	HTS,
	CONTRACT,
}
