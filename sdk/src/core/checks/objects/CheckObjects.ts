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

import { IndexableObject } from '../../Type.js';

export default class CheckObjects {
	public static hasShape(o1: IndexableObject, o2: IndexableObject): boolean {
		// Both nulls = same
		if (o1 === null && o2 === null) {
			return true;
		}

		// Get the keys of each object
		const o1keys: Set<string> =
			o1 === null ? new Set() : new Set(Object.keys(o1));
		const o2keys: Set<string> =
			o2 === null ? new Set() : new Set(Object.keys(o2));
		if (o1keys.size !== o2keys.size) {
			// Different number of own properties = not the same
			return false;
		}

		// Look for differences, recursing as necessary
		for (const key of o1keys) {
			if (!o2keys.has(key)) {
				// Different keys
				return false;
			}

			// Get the values and their types
			const v1 = o1[key];
			const v2 = o2[key];
			const t1 = typeof v1;
			const t2 = typeof v2;
			if (t1 === 'object') {
				if (t2 === 'object' && !this.hasShape(v1, v2)) {
					return false;
				}
			} else if (t2 === 'object') {
				// We know `v1` isn't an object
				return false;
			}
		}

		// No differences found
		return true;
	}
}
