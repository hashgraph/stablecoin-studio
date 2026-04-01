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

import { HederaId } from '../shared/HederaId.js';
import PrivateKey from './PrivateKey.js';
import PublicKey from './PublicKey.js';
import MultiKey from './MultiKey.js';

export interface AccountProps {
	id: string;
	privateKey?: PrivateKey;
	publicKey?: PublicKey;
	evmAddress?: string;
	multiKey?: MultiKey;
}

export default class Account {
	public static readonly NULL: Account = new Account({ id: '0.0.0' });
	public id: HederaId;
	public evmAddress?: string;
	public privateKey?: PrivateKey;
	public publicKey?: PublicKey;
	public multiKey?: MultiKey;
	constructor(props: AccountProps) {
		Object.assign(this, { ...props, id: HederaId.from(props.id) });
	}
}
