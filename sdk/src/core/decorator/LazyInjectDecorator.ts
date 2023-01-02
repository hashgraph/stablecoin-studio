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
import { Constructor } from '../Type.js';
import { inject, delay } from 'tsyringe';

/**
 * This decorator substitutes the lazy loading construct from tsyringe
 *
 * @param cls Class to lazy load
 */
export function lazyInject<T>(token: Constructor<T>): any {
	return (
		target: any,
		propertyKey: string | symbol,
		parameterIndex: number,
	) => {
		inject(delay(() => token))(target, propertyKey, parameterIndex);
	};
}
