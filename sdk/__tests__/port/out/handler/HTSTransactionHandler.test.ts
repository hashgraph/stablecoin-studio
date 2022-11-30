/* eslint-disable jest/valid-expect */
import { Client } from "@hashgraph/sdk";
import Long from "long";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { AccountId as HAccountId,
         Status } from '@hashgraph/sdk';
import StableCoinCapabilities from "../../../../src/domain/context/stablecoin/StableCoinCapabilities.js";
import { StableCoin } from "../../../../src/domain/context/stablecoin/StableCoin.js";
import Account from "../../../../src/domain/context/account/Account.js";
import { getEnvironmentData } from "worker_threads";
import { Capability } from "../../../../src/domain/context/stablecoin/Capability.js";
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
    const capabilities: Capability[] = [Capability.CASH_IN_HTS];
    const stableCoinCapabilities = new StableCoinCapabilities(
        stableCoin,
        capabilities,
        account
    );

    // token to operate through contract
    const tokenId2 = '0.0.48989058';
    //const proxyContractId2 = '0.0.48989057';
    //const evmProxyAddress2 = '0x0000000000000000000000000000000002eb8381';
    const stableCoin2 = new StableCoin({
        name: 'HEDERACOIN',
        symbol: 'HDC',
        decimals: 3,
        tokenId: new HederaId(tokenId2)
    });
    const capabilities2: Capability[] = [Capability.CASH_IN];
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
        tr = await th.cashin(stableCoinCapabilities, accountId, new BigDecimal('1'));
    });

    it('Test burn', async () => {
        tr = await th.burn(stableCoinCapabilities, new BigDecimal('1'));
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
        tr = await th.cashin(stableCoinCapabilities2, accountId, new BigDecimal('1'));
        //tr = await th.contractCall(proxyContract2, 'mint', [accountEvmAddress, 1], 400000);
    });

    /*it('Test burn contract function', async () => {
        tr = await th.contractCall(proxyContract2, 'burn', [1], 400000);
    });

    it('Test freeze contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(clientAccountId).toSolidityAddress();
        tr = await th.contractCall(proxyContract2, 'freeze', [accountEvmAddress], 60000);
    });

    it('Test unfreeze contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(clientAccountId).toSolidityAddress();
        tr = await th.contractCall(proxyContract2, 'unfreeze', [accountEvmAddress], 60000);
    });

    it('Test pause contract function', async () => {
        tr = await th.contractCall(proxyContract2, 'pause', [], 400000);
    });

    it('Test unpause contract function', async () => {
        tr = await th.contractCall(proxyContract2, 'unpause', [], 400000);
    });*/

    afterEach(async () => {
        expect(tr).not.toBeNull;
        //expect(tr.receipt?.status).toEqual(Status.Success);
    });
});