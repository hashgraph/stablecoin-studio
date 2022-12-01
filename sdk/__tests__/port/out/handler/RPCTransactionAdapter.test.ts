/* eslint-disable jest/expect-expect */
import { Client } from '@hashgraph/sdk';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../src/domain/context/stablecoin/Capability.js';
import Account from '../../../../src/domain/context/account/Account.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet } from 'ethers';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	const clientAccountId = '0.0.48471385';
	const clientPrivateKey =
		'1404d4a4a67fb21e7181d147bfdaa7c9b55ebeb7e1a9048bf18d5da6e169c09c';
	const evmAddress = '0x320d33046b60dbc5a027cfb7e4124f75b0417240';
	const stableCoinCapabilitiesHTS = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HTSECDSA',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006492'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc79c',
			tokenId: HederaId.from('0.0.49006494'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.HTS),
			new Capability(Operation.BURN, Access.HTS),
			new Capability(Operation.WIPE, Access.HTS),
			new Capability(Operation.FREEZE, Access.HTS),
			new Capability(Operation.UNFREEZE, Access.HTS),
			new Capability(Operation.PAUSE, Access.HTS),
			new Capability(Operation.UNPAUSE, Access.HTS),
			new Capability(Operation.DELETE, Access.HTS),
			new Capability(Operation.RESCUE, Access.HTS),
			new Capability(Operation.ROLE_MANAGEMENT, Access.HTS),
		],
		new Account({
			environment: 'testnet',
			evmAddress,
		}),
	);
	const stableCoinCapabilitiesSC = new StableCoinCapabilities(
		new StableCoin({
			name: 'SMARTCONTRACT',
			symbol: 'SMARTCONTRACT',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006552'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc7d8',
			tokenId: HederaId.from('0.0.49006555'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.CONTRACT),
			new Capability(Operation.BURN, Access.CONTRACT),
			new Capability(Operation.WIPE, Access.CONTRACT),
			new Capability(Operation.FREEZE, Access.CONTRACT),
			new Capability(Operation.UNFREEZE, Access.CONTRACT),
			new Capability(Operation.PAUSE, Access.CONTRACT),
			new Capability(Operation.UNPAUSE, Access.CONTRACT),
			new Capability(Operation.DELETE, Access.CONTRACT),
			new Capability(Operation.RESCUE, Access.CONTRACT),
			new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
		],
		new Account({
			environment: 'testnet',
			evmAddress,
		}),
	);

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;
	beforeAll(async () => {
		th = new RPCTransactionAdapter();
		th.signerOrProvider = new Wallet(clientPrivateKey, th.provider);
	});

	it('Test wipe', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			evmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			evmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test mint', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			evmAddress,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	it('Test freeze', async () => {
		await th.unfreeze(stableCoinCapabilitiesSC, evmAddress);
		tr = await th.freeze(stableCoinCapabilitiesSC, evmAddress);
	}, 1500000);

	it('Test unfreeze', async () => {
		await th.freeze(stableCoinCapabilitiesSC, evmAddress);
		tr = await th.unfreeze(stableCoinCapabilitiesSC, evmAddress);
	}, 1500000);

	// it('Test pause', async () => {
	//     tr = await th.pause(tokenId);
	// });

	// it('Test unpause', async () => {
	//     tr = await th.unpause(tokenId);
	// });

	afterEach(async () => {
		expect(tr).not.toBeNull();
		expect(tr.error).toEqual(undefined);
		// 	const response: HTSResponse =
		// 		await HTSTransactionResponseHandler.manageResponse(
		// 			tr,
		// 			TransactionType.RECEIPT,
		// 			client,
		// 		);
		// 	expect(response.receipt?.status).toEqual(Status.Success);
	});
});
