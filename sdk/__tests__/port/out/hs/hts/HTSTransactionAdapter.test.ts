/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { Client } from "@hashgraph/sdk";
import { HTSTransactionAdapter } from "../../../../../src/port/out/hs/hts/HTSTransactionAdapter.js";
import TransactionResponse from '../../../../../src/domain/context/transaction/TransactionResponse.js';
import { AccountId as HAccountId } from '@hashgraph/sdk';
import StableCoinCapabilities from "../../../../../src/domain/context/stablecoin/StableCoinCapabilities.js";
import { StableCoin } from "../../../../../src/domain/context/stablecoin/StableCoin.js";
import Account from "../../../../../src/domain/context/account/Account.js";
import { Access, Capability, Operation } from "../../../../../src/domain/context/stablecoin/Capability.js";
import BigDecimal from '../../../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from "../../../../../src/domain/context/shared/HederaId.js";

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
	const clientAccountId = '0.0.47792863';
	const clientPrivateKey =
		'302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
	const accountId = '0.0.47793222';
	const account: Account = new Account({
		environment: 'testnet',
		id: clientAccountId,
	});

	// token to operate through HTS
	const tokenId = '0.0.48987373';
	const stableCoin = new StableCoin({
		name: 'HEDERACOIN',
		symbol: 'HDC',
		decimals: 6,
		tokenId: new HederaId(tokenId),
	});
	const capabilities: Capability[] = [
		new Capability(Operation.CASH_IN, Access.HTS),
		new Capability(Operation.BURN, Access.HTS),
		new Capability(Operation.FREEZE, Access.HTS),
		new Capability(Operation.UNFREEZE, Access.HTS),
		new Capability(Operation.PAUSE, Access.HTS),
		new Capability(Operation.UNPAUSE, Access.HTS),
	];
	const stableCoinCapabilities = new StableCoinCapabilities(
		stableCoin,
		capabilities,
		account,
	);

    let th:HTSTransactionAdapter
    let client:Client
    let tr:TransactionResponse;
    beforeAll(async () => {
        client= Client.forTestnet();
        client.setOperator(clientAccountId, clientPrivateKey);
        th = new HTSTransactionAdapter(client);
    });

    it('Test cashIn', async () => {
        tr = await th.cashin(stableCoinCapabilities, accountId, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    });

    it('Test burn', async () => {
        tr = await th.burn(stableCoinCapabilities, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    });

	it('Test burn', async () => {
		tr = await th.burn(
			stableCoinCapabilities,
			new BigDecimal('0.0000000000001'),
		);
	});

	/*it('Test transfer', async () => {
        tr = await th.mint(stableCoinCapabilities, new BigDecimal('1'));
        tr = await th.transfer(stableCoinCapabilities, new BigDecimal('1'), clientAccountId, accountId);
    });

    it('Test wipe', async () => {
        tr = await th.mint(stableCoinCapabilities, new BigDecimal('1'));
        tr = await th.transfer(stableCoinCapabilities, new BigDecimal('1'), clientAccountId, accountId);
        tr = await th.wipe(stableCoinCapabilities, accountId, new BigDecimal('1'));
    });*/

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilities, accountId);
	});

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(stableCoinCapabilities, accountId);
	});

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilities);
	});

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilities);
	});

    it('Test cashIn contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(clientAccountId).toSolidityAddress();
        tr = await th.cashin(stableCoinCapabilities, accountEvmAddress, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    });

    it('Test burn contract function', async () => {
        tr = await th.burn(stableCoinCapabilities, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    });

	it('Test freeze contract function', async () => {
		const accountEvmAddress: string =
			HAccountId.fromString(accountId).toSolidityAddress();
		tr = await th.freeze(stableCoinCapabilities, accountEvmAddress);
	});

	it('Test unfreeze contract function', async () => {
		const accountEvmAddress: string =
			HAccountId.fromString(accountId).toSolidityAddress();
		tr = await th.unfreeze(stableCoinCapabilities, accountEvmAddress);
	});

	it('Test pause contract function', async () => {
		tr = await th.pause(stableCoinCapabilities);
	});

	it('Test unpause contract function', async () => {
		tr = await th.unpause(stableCoinCapabilities);
	});

    afterEach(async () => {
        expect(tr).not.toBeNull();
        expect(tr.error).toEqual(undefined);
    });
});
