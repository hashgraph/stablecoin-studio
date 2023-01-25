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

import {
	Capability,
	Operation,
	Access,
} from '../../../src/domain/context/stablecoin/Capability.js';
import { StableCoin } from '../../../src/domain/context/stablecoin/StableCoin.js';
import StableCoinCapabilities from '../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	CapabilityDecider,
	Decision,
} from '../../../src/port/out/CapabilityDecider.js';
import { CLIENT_ACCOUNT_ED25519 } from '../../config.js';

describe('🧪 CapabilityDecider', () => {
	const capabilities: Capability[] = [
		new Capability(Operation.CASH_IN, Access.CONTRACT),
		new Capability(Operation.BURN, Access.HTS),
	];

	const coin = new StableCoin({
		name: 'name',
		symbol: 'symbol',
		decimals: 3,
	});

	const stableCoin = new StableCoinCapabilities(
		coin,
		capabilities,
		CLIENT_ACCOUNT_ED25519,
	);

	it('Test decider', async () => {
		const CashIn_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.CASH_IN,
		);
		const Burn_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.BURN,
		);
		const Wipe_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.WIPE,
		);
		const Freeze_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.FREEZE,
		);
		const UnFreeze_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.UNFREEZE,
		);
		const Pause_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.PAUSE,
		);
		const UnPause_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.UNPAUSE,
		);
		const Delete_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.DELETE,
		);
		const Rescue_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.RESCUE,
		);
		const RoleManagement_Decider = CapabilityDecider.decide(
			stableCoin,
			Operation.ROLE_MANAGEMENT,
		);

		expect(CashIn_Decider).toEqual(Decision.CONTRACT);
		expect(Burn_Decider).toEqual(Decision.HTS);
		expect(Wipe_Decider).toEqual(Decision.FORBIDDEN);
		expect(Freeze_Decider).toEqual(Decision.FORBIDDEN);
		expect(UnFreeze_Decider).toEqual(Decision.FORBIDDEN);
		expect(Pause_Decider).toEqual(Decision.FORBIDDEN);
		expect(UnPause_Decider).toEqual(Decision.FORBIDDEN);
		expect(Delete_Decider).toEqual(Decision.FORBIDDEN);
		expect(Rescue_Decider).toEqual(Decision.FORBIDDEN);
		expect(RoleManagement_Decider).toEqual(Decision.FORBIDDEN);
	});
});
