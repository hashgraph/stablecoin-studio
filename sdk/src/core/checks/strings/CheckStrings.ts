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

import { HederaId } from "../../../domain/context/shared/HederaId.js";

export default class CheckStrings {
	public static isNotEmpty(value?: string): boolean {
		if (!value) return false;
		if (value.length == 0) return false;
		return true;
	}

	public static isLengthUnder(value: string, maxLength: number): boolean {
		if (value.length > maxLength) return false;
		return true;
	}

	public static isLengthBetween(
		value: string,
		min: number,
		max: number,
	): boolean {
		if (value.length > max || value.length < min) return false;
		return true;
	}

	public static isAccountId(value: string): boolean {
		try {
			HederaId.from(value);
			return true;
		} catch (err) {
			return false
		}
	}
}
