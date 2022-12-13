/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../src/domain/context/stablecoin/Capability.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet } from 'ethers';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';
import { Injectable } from '../../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	HEDERA_ID_ACCOUNT_ECDSA as TARGET_ID,
} from '../../../config.js';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
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
		CLIENT_ACCOUNT_ECDSA,
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
		CLIENT_ACCOUNT_ECDSA,
	);

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;

	beforeAll(async () => {
		th = Injectable.resolve(RPCTransactionAdapter);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.setEnvironment('testnet');
	});

	it('Test wipe', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test mint', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
	}, 1500000);

	it('Test mint HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			TARGET_ID,
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
		tr = await th.freeze(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
		// console.log(tr);
	}, 1500000);

	it('Test rescue', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test delete', async () => {
		tr = await th.delete(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test grantRole', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test revokeRole', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantSupplierRole', async () => {
		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test grantUnlimitedSupplierRole', async () => {
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
		);
	}, 1500000);

	it('Test revokeSupplierRole', async () => {
		tr = await th.revokeSupplierRole(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	it('Test hasRole', async () => {
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
		console.log(tr);
	}, 1500000);

	it('Test getBalanceOf', async () => {
		tr = await th.balanceOf(stableCoinCapabilitiesSC, TARGET_ID);
		console.log(tr.response.toString());
	}, 1500000);

	it('Test isUnlimitedSupplierAllowance', async () => {
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
		);
		console.log(tr);
	}, 1500000);

	it('Test supplierAllowance', async () => {
		tr = await th.supplierAllowance(stableCoinCapabilitiesSC, TARGET_ID);
		console.log(tr.response.toString());
	}, 1500000);

	it('Test resetSupplierAllowance', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
		);
	}, 1500000);

	it('Test increaseSupplierAllowance', async () => {
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test decreaseSupplierAllowance', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			TARGET_ID,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test getRoles', async () => {
		tr = await th.getRoles(stableCoinCapabilitiesSC, TARGET_ID);
	}, 1500000);

	//  TODO To test with other TARGET_ID
	it('Test associateToken', async () => {
		tr = await th.associateToken(stableCoinCapabilitiesSC, TARGET_ID);
		console.log(tr);
	}, 1500000);

	afterEach(async () => {
		// eslint-disable-next-line jest/no-standalone-expect
		expect(tr).not.toBeNull();
		// eslint-disable-next-line jest/no-standalone-expect
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
