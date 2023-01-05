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

import { Operation, Access } from "../../domain/context/stablecoin/Capability.js";
import StableCoinCapabilities from "../../domain/context/stablecoin/StableCoinCapabilities.js";

export class CapabilityDecider {
	static decide(
		capabilities: StableCoinCapabilities,
		operation: Operation,
	): Decision {
		const extractedOperation = capabilities.capabilities.find(
			(op) => op.operation == operation,
		);

		if (!extractedOperation) return Decision.FORBIDDEN;
		if (extractedOperation.access == Access.CONTRACT)
			return Decision.CONTRACT;
		else return Decision.HTS;
	}
}

export enum Decision {
	FORBIDDEN,
	HTS,
    CONTRACT
}