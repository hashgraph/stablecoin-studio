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

import {
	CustodialWalletUtilsTransactionAdapter
} from '../../../src/port/out/hs/custodialwalletutils/CustodialWalletUtilsTransactionAdapter';
import EventService from '../../../src/app/service/event/EventService';
import NetworkService from '../../../src/app/service/NetworkService';
import {MirrorNodeAdapter} from '../../../src/port/out/mirror/MirrorNodeAdapter';
import fs from 'fs';
import path from 'path';
import {ContractExecuteTransaction} from '@hashgraph/sdk';
import {HederaTokenManager__factory} from '@hashgraph/stablecoin-npm-contracts';
import {BigDecimal} from '../../../src';
import Web3 from 'web3';
import {TransactionType} from '../../../src/port/out/TransactionResponseEnums';
import {FireblocksConfig} from 'custodialwalletutils/build/cjs/src/strategies/config/FireblocksConfig';
import {MirrorNode} from '../../../src/domain/context/network/MirrorNode';
import StableCoinService from '../../../src/app/service/StableCoinService';
import Injectable from '../../../src/core/Injectable';

//------------------  Fireblocks  ------------------//
const apiSecretKey = fs.readFileSync(
	path.resolve('/home/mario/Documents/fireblocks-secret.key'),
	'utf8',
);
const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const baseUrl = 'https://api.fireblocks.io';
const vaultAccountId = '2';

const web3 = new Web3();
//------------------  end Fireblocks  ------------------//
const mirrorNode: MirrorNode = {
	name: 'testmirrorNode',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};
const decimals = 6;
const initSupply = 1000;
const reserve = 100000000;

describe('CustodialWalletUtilsTransactionAdapter', () => {
	let adapter: CustodialWalletUtilsTransactionAdapter;
	let eventService: EventService;
	let mirrorNodeAdapter: MirrorNodeAdapter;
	let networkService: NetworkService;
	let stableCoinService: StableCoinService;

	const fireblocksConfig = new FireblocksConfig(
		apiKey,
		apiSecretKey,
		baseUrl,
		vaultAccountId,
		'HBAR_TEST',
	);

	beforeAll(() => {
		eventService = Injectable.resolve(EventService);

		mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.set(mirrorNode);

		networkService = Injectable.resolve(NetworkService);
		networkService.environment = 'testnet';

		adapter = new CustodialWalletUtilsTransactionAdapter(
			eventService,
			mirrorNodeAdapter,
			networkService,
			fireblocksConfig, // o new DFNSConfig(),
		);

		stableCoinService = Injectable.resolve(StableCoinService);
	});

	it('should sign and send a transaction successfully', async () => {
		const abi = HederaTokenManager__factory.abi;
		const functionName = 'wipe';

		const functionCallParameters = encodeFunctionCall(
			functionName,
			[
				'0x0000000000000000000000000000000000004719',
				BigDecimal.fromString('1', 6),
			],
			HederaTokenManager__factory.abi,
		);

		const t = new ContractExecuteTransaction()
			.setContractId('0.0.5759337')
			.setFunctionParameters(functionCallParameters)
			.setGas(80000);

		//adapter.init();

		await adapter.signAndSendTransaction(
			t,
			TransactionType.RECEIPT,
			functionName,
			abi,
		);
	});
});

function encodeFunctionCall(
	functionName: string,
	parameters: any[],
	abi: any,
): Uint8Array {
	const functionAbi = abi.find(
		(func: { name: any; type: string }) =>
			func.name === functionName && func.type === 'function',
	);
	if (!functionAbi) {
		const message = `Contract function ${functionName} not found in ABI, are you using the right version?`;
		throw new Error(message);
	}
	const encodedParametersHex = web3.eth.abi
		.encodeFunctionCall(functionAbi, parameters)
		.slice(2);

	return Buffer.from(encodedParametersHex, 'hex');
}
