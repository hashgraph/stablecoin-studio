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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}

export interface IndexableObject {
	[n: string | number | symbol]: any;
}

export type Constructible<
	Params extends readonly any[] = any[],
	T = any,
> = new (...params: Params) => T;

export type MapFunction<T, K, O> = (value: T, object: O) => K;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> &
			Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

export type Constructor<T> = {
	new (...args: any[]): T;
};
