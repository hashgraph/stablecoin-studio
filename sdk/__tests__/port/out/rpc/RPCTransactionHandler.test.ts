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

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	const clientAccountId = '0.0.47792863';
	const clientPrivateKey =
		'302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
	const accountId = '0.0.47793222';
	const tokenId = '0.0.48987373';
	const proxy = '0.0.48987372';

	let th: RPCTransactionAdapter;
	let client: Client;
	let tr: TransactionResponse;
	beforeAll(async () => {
		client = Client.forTestnet();
		client.setOperator(clientAccountId, clientPrivateKey);
		th = new RPCTransactionAdapter();
	});

	// eslint-disable-next-line jest/expect-expect
	it('Test mint', async () => {
		const stableCoinCapabilities = new StableCoinCapabilities(
			new StableCoin({
				name: 'TEST',
				symbol: 'TEST',
				decimals: 2,
				proxyAddress: HederaId.from('0.0.49001866'),
				evmProxyAddress: '0x0000000000000000000000000000000002ebb58a',
				tokenId: HederaId.from('0.0.49001869'),
			}),
			[new Capability(Operation.CASH_IN, Access.CONTRACT)],
			new Account({
				environment: 'testnet',
				evmAddress: '0x367710d1076ed07d52162d3f45012a89f8bc3335',
			}),
		);

		tr = await th.cashin(
			stableCoinCapabilities,
			'0x367710d1076ed07d52162d3f45012a89f8bc3335',
			BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals),
		);
		console.log(tr);
	}, 1500000);

	// eslint-disable-next-line jest/expect-expect
	it('Test balance', async () => {
		const stableCoinCapabilities = new StableCoinCapabilities(
			new StableCoin({
				name: 'TEST',
				symbol: 'TEST',
				decimals: 16,
				proxyAddress: HederaId.from('0.0.49001866'),
				evmProxyAddress: '0x0000000000000000000000000000000002ebb58a',
				tokenId: HederaId.from('0.0.49001869'),
			}),
			[new Capability(Operation.CASH_IN, Access.CONTRACT)],
			new Account({
				environment: 'testnet',
				evmAddress: '0x367710d1076ed07d52162d3f45012a89f8bc3335',
			}),
		);

		tr = await th.balance(stableCoinCapabilities);
		console.log(tr);
	}, 1500000);

	// it('Test burn', async () => {
	//     tr = await th.burn(tokenId, Long.ONE);
	// });

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	// it('Test wipe', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	//     tr = await th.wipe(accountId, tokenId, Long.ONE);
	// });

	// it('Test freeze', async () => {
	//     tr = await th.freeze(tokenId, accountId);
	// });

	// it('Test unfreeze', async () => {
	//     tr = await th.unfreeze(tokenId, accountId);
	// });

	// it('Test pause', async () => {
	//     tr = await th.pause(tokenId);
	// });

	// it('Test unpause', async () => {
	//     tr = await th.unpause(tokenId);
	// });

	// afterEach(async () => {
	// 	expect(tr).not.toBeNull;
	// 	const response: HTSResponse =
	// 		await HTSTransactionResponseHandler.manageResponse(
	// 			tr,
	// 			TransactionType.RECEIPT,
	// 			client,
	// 		);
	// 	expect(response.receipt?.status).toEqual(Status.Success);
	// });
});
