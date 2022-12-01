/* eslint-disable jest/valid-expect */
import { Client } from "@hashgraph/sdk";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";
import TransactionResponse from '../../../../../../src/port/out/hts/hs/HTSTransactionHandler.jsjs';
import { AccountId as HAccountId } from '@hashgraph/sdk';
import StableCoinCapabilities from "../../../../src/domain/context/stablecoin/StableCoinCapabilities.js";
import { StableCoin } from "../../../../src/domain/context/stablecoin/StableCoin.js";
import Account from "../../../../src/domain/context/account/Account.js";
import { Access, Capability, Operation } from "../../../../src/domain/context/stablecoin/Capability.js";
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from "../../../../src/domain/context/shared/HederaId.js";

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
    const tokenId2 = '0.0.48971712';
    const proxyContractId2 = '0.0.48971708';
    const stableCoin2 = new StableCoin({
        name: 'HEDERACOIN',
        symbol: 'HDC',
        decimals: 4,
        tokenId: new HederaId(tokenId2),
        proxyAddress: new HederaId(proxyContractId2)
    });
    const capabilities2: Capability[] = [new Capability(Operation.CASH_IN, Access.CONTRACT),
                                         new Capability(Operation.BURN, Access.CONTRACT),
                                         new Capability(Operation.FREEZE, Access.CONTRACT),
                                         new Capability(Operation.UNFREEZE, Access.CONTRACT),
                                         new Capability(Operation.PAUSE, Access.CONTRACT),
                                         new Capability(Operation.UNPAUSE, Access.CONTRACT),];
    const stableCoinCapabilities2 = new StableCoinCapabilities(
        stableCoin2,
        capabilities2,
        account
    );

    let th:HTSTransactionHandler
    let client:Client
    let tr:TransactionResponse;
    beforeAll(async () => {
        client= Client.forTestnet();
        client.setOperator(clientAccountId, clientPrivateKey);
        th = new HTSTransactionHandler(client);
    });

    it('Test cashIn', async () => {
        tr = await th.cashin(stableCoinCapabilities, accountId, new BigDecimal('0.0000000000001'));
    });

    it('Test burn', async () => {
        tr = await th.burn(stableCoinCapabilities, new BigDecimal('0.0000000000001'));
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
        tr = await th.cashin(stableCoinCapabilities2, accountEvmAddress, new BigDecimal('0.0000000000001'));
    });

    it('Test burn contract function', async () => {
        tr = await th.burn(stableCoinCapabilities2, new BigDecimal('0.0000000000001'));
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

    afterEach(async () => {
        expect(tr).not.toBeNull;
        //expect(tr.receipt?.status).toEqual(Status.Success);
    });
});