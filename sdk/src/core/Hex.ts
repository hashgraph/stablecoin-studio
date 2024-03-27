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

export default class Hex {
	static fromUint8Array(uint8ArrayKey: Uint8Array): string {
		return Array.from(uint8ArrayKey, (byte) =>
			('0' + byte.toString(16)).slice(-2),
		).join('');
	}

	static toUint8Array(hex: string): Uint8Array {
		return Uint8Array.from(Buffer.from(hex, 'hex'));
	}
}
