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

export const testnet = 'testnet';
export const previewnet = 'previewnet';
export const mainnet = 'mainnet';
export const local = 'local';
export const unrecognized = 'unrecognized';

export type Environment =
	| 'testnet'
	| 'previewnet'
	| 'mainnet'
	| 'local'
	| 'unrecognized'
	| string;

export const HederaNetworks = [
	{
		network: testnet,
		chainId: 296,
	},
	{
		network: previewnet,
		chainId: 297,
	},
	{
		network: mainnet,
		chainId: 295,
	},
	{
		network: local,
		chainId: 298,
	},
];
