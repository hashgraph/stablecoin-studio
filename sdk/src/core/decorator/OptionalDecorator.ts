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

import RequestMapper from "../../port/in/request/mapping/RequestMapper.js";
import { IndexableObject } from "../Type.js";

const OPTIONAL_KEYS = Symbol('optionalKeys');

export function OptionalField(): (target: object, propertyKey: string) => void {
	return registerProperty;
}

function registerProperty(target: object, propertyKey: string): void {
	let properties: string[] = Reflect.getMetadata(OPTIONAL_KEYS, target);

	if (properties) {
		properties.push(propertyKey);
	} else {
		properties = [propertyKey];
		Reflect.defineMetadata(OPTIONAL_KEYS, properties, target);
	}
}

export function getOptionalFields(origin: IndexableObject): IndexableObject {
	const properties: string[] =
		Reflect.getMetadata(OPTIONAL_KEYS, origin) ?? [];
	const result: IndexableObject = {};
	properties.forEach((key) => (result[RequestMapper.renamePrivateProps(key)] = origin[key]));
	return result;
}
