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

export enum StableCoinRole {
	CASHIN_ROLE = '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
	BURN_ROLE = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22',
	WIPE_ROLE = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
	RESCUE_ROLE = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
	PAUSE_ROLE = '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d',
	FREEZE_ROLE = '0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d',
	DELETE_ROLE = '0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2',
	DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000',
	WITHOUT_ROLE = '0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc',
}

export const StableCoinRoleLabel = new Map<StableCoinRole, string>([
	[StableCoinRole.CASHIN_ROLE, 'Cash in'],
	[StableCoinRole.BURN_ROLE, 'Burn'],
	[StableCoinRole.WIPE_ROLE, 'Wipe'],
	[StableCoinRole.RESCUE_ROLE, 'Rescue'],
	[StableCoinRole.PAUSE_ROLE, 'Pause'],
	[StableCoinRole.FREEZE_ROLE, 'Freeze'],
	[StableCoinRole.DELETE_ROLE, 'Delete'],
	[StableCoinRole.DEFAULT_ADMIN_ROLE, 'Default admin'],
	[StableCoinRole.WITHOUT_ROLE, 'Without'],
  ]);
