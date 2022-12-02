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
    const clientPrivateKey = '302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
    const accountId = '0.0.47793222';
    const account: Account = new Account({
        environment: 'testnet',
        id: clientAccountId
    });
    
    // token to operate through HTS
    const tokenId = '0.0.48987373';
    const stableCoin = new StableCoin({
        name: 'HEDERACOIN',
        symbol: 'HDC',
        decimals: 6,
        tokenId: new HederaId(tokenId)
    });
    const capabilities: Capability[] = [new Capability(Operation.CASH_IN, Access.HTS),
                                        new Capability(Operation.BURN, Access.HTS),
										new Capability(Operation.WIPE, Access.HTS),
                                        new Capability(Operation.FREEZE, Access.HTS),
                                        new Capability(Operation.UNFREEZE, Access.HTS),
                                        new Capability(Operation.PAUSE, Access.HTS),
                                        new Capability(Operation.UNPAUSE, Access.HTS)];
    const stableCoinCapabilities = new StableCoinCapabilities(
        stableCoin,
        capabilities,
        account
    );

    // token to operate through contract
    const tokenId2 = '0.0.49013686';
    const proxyContractId2 = '0.0.49013685';
    const stableCoin2 = new StableCoin({
        name: 'HEDERACOIN',
        symbol: 'HDC',
        decimals: 4,
        tokenId: new HederaId(tokenId2),
        proxyAddress: new HederaId(proxyContractId2)
    });
    const capabilities2: Capability[] = [new Capability(Operation.CASH_IN, Access.CONTRACT),
                                         new Capability(Operation.BURN, Access.CONTRACT),
										 new Capability(Operation.WIPE, Access.CONTRACT),
										 new Capability(Operation.RESCUE, Access.CONTRACT),
                                         new Capability(Operation.FREEZE, Access.CONTRACT),
                                         new Capability(Operation.UNFREEZE, Access.CONTRACT),
                                         new Capability(Operation.PAUSE, Access.CONTRACT),
                                         new Capability(Operation.UNPAUSE, Access.CONTRACT),
										 new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT)];
    const stableCoinCapabilities2 = new StableCoinCapabilities(
        stableCoin2,
        capabilities2,
        account
    );

    let th:HTSTransactionAdapter
    let client:Client
    let tr:TransactionResponse;
    beforeAll(async () => {
        client= Client.forTestnet();
        client.setOperator(clientAccountId, clientPrivateKey);
        th = new HTSTransactionAdapter(client);
    });
    
    it('Test burn', async () => {
        tr = await th.burn(stableCoinCapabilities, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    });

    it('Test transfer', async () => {
        tr = await th.cashin(stableCoinCapabilities, accountId, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
        tr = await th.transfer(stableCoinCapabilities, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals), clientAccountId, accountId);
    });

    it('Test wipe', async () => {
        tr = await th.cashin(stableCoinCapabilities, accountId, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
        tr = await th.transfer(stableCoinCapabilities, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals), clientAccountId, accountId);
        tr = await th.wipe(stableCoinCapabilities, accountId, BigDecimal.fromString('1', stableCoinCapabilities.coin.decimals));
    }, 20000);

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
        tr = await th.cashin(stableCoinCapabilities2, accountEvmAddress, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

    it('Test burn contract function', async () => {
        tr = await th.burn(stableCoinCapabilities2, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

    it('Test wipe contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(clientAccountId).toSolidityAddress();
        tr = await th.wipe(stableCoinCapabilities2, accountEvmAddress, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

	it('Test rescue contract function', async () => {
        tr = await th.rescue(stableCoinCapabilities2, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

    it('Test freeze contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.freeze(stableCoinCapabilities2, accountEvmAddress);
    });

    it('Test unfreeze contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.unfreeze(stableCoinCapabilities2, accountEvmAddress);
    });

    it('Test pause contract function', async () => {
        tr = await th.pause(stableCoinCapabilities2);
    });

    it('Test unpause contract function', async () => {
        tr = await th.unpause(stableCoinCapabilities2);
    });

	it('Test grant role contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.grantRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		tr = await th.hasRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		expect(tr.response[0]).toEqual(true);
    });

	it('Test revoke role contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.revokeRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		tr = await th.hasRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		expect(tr.response[0]).toEqual(false);
    });

	it('Test has role contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.revokeRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		tr = await th.hasRole(stableCoinCapabilities2, '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22', accountEvmAddress);
		expect(tr.response[0]).toEqual(false);
    });

	it('Test get roles contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.getRoles(stableCoinCapabilities2, accountEvmAddress);
    });

	it('Test supplier allowance contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.supplierAllowance(stableCoinCapabilities2, accountEvmAddress);
    });

	it('Test increase supplier allowance contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
		tr = await th.revokeRole(stableCoinCapabilities2, '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c', accountEvmAddress);
		tr = await th.grantSupplierRole(stableCoinCapabilities2, accountEvmAddress, BigDecimal.fromString('10', stableCoinCapabilities2.coin.decimals));
        tr = await th.increaseSupplierAllowance(stableCoinCapabilities2, accountEvmAddress, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

	it('Test decrease supplier allowance contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.decreaseSupplierAllowance(stableCoinCapabilities2, accountEvmAddress, BigDecimal.fromString('1', stableCoinCapabilities2.coin.decimals));
    });

	it('Test reset supplier allowance contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
        tr = await th.resetSupplierAllowance(stableCoinCapabilities2, accountEvmAddress);
    });

	it('Test grant unlimited supplier allowance contract function', async () => {
		const accountEvmAddress: string = HAccountId.fromString(accountId).toSolidityAddress();
		tr = await th.revokeRole(stableCoinCapabilities2, '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c', accountEvmAddress);
		tr = await th.grantUnlimitedSupplierRole(stableCoinCapabilities2, accountEvmAddress);
    });

    afterEach(async () => {
        expect(tr).not.toBeNull();
        expect(tr.error).toEqual(undefined);
    });
});