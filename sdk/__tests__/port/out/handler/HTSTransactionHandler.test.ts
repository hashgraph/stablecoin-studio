/* eslint-disable jest/valid-expect */
import { Client } from "@hashgraph/sdk";
import Long from "long";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoin from '../../../../src/domain/context/stablecoin/StableCoin.js';
import Contract from '../../../../src/domain/context/contract/Contract.js';
import {
	HederaERC20__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { AccountId as HAccountId,
         Status } from '@hashgraph/sdk';

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
    const clientAccountId = '0.0.47792863';
    const clientPrivateKey = '302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
    const accountId = '0.0.47793222';
    
    // token to operate through HTS
    const tokenId = '0.0.48987373';
    const proxyContractId = '0.0.48987372';
    const evmProxyAddress = '0x0000000000000000000000000000000002eb7cec';
    const proxyContract: Contract = new Contract(
        proxyContractId,
        HederaERC20__factory.abi,
        'stablecoin',
    );  
    const stableCoin = new StableCoin(
        proxyContract,
        evmProxyAddress,
        tokenId
    );

    // token to operate through contract
    const tokenId2 = '0.0.48989058';
    const proxyContractId2 = '0.0.48989057';
    const evmProxyAddress2 = '0x0000000000000000000000000000000002eb8381';
    const proxyContract2: Contract = new Contract(
        proxyContractId2,
        HederaERC20__factory.abi,
        'stablecoin',
    );  
    const stableCoin2 = new StableCoin(
        proxyContract2,
        evmProxyAddress2,
        tokenId2
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
        tr = await th.mint(stableCoin, Long.ONE);
    });

    it('Test burn', async () => {
        tr = await th.burn(stableCoin, Long.ONE);
    });

    it('Test transfer', async () => {
        tr = await th.mint(stableCoin, Long.ONE);
        tr = await th.transfer(stableCoin, Long.ONE, clientAccountId, accountId);
    });

    it('Test wipe', async () => {
        tr = await th.mint(stableCoin, Long.ONE);
        tr = await th.transfer(stableCoin, Long.ONE, clientAccountId, accountId);
        tr = await th.wipe(stableCoin, accountId, Long.ONE);
    });

    it('Test freeze', async () => {
        tr = await th.freeze(stableCoin, accountId);
    });

    it('Test unfreeze', async () => {
        tr = await th.unfreeze(stableCoin, accountId);
    });

    it('Test pause', async () => {
        tr = await th.pause(stableCoin);
    });

    it('Test unpause', async () => {
        tr = await th.unpause(stableCoin);        
    }); 

    it('Test cashIn contract function', async () => {
        const accountEvmAddress: string = HAccountId.fromString(clientAccountId).toSolidityAddress();
        tr = await th.contractCall(proxyContract2, 'mint', [accountEvmAddress, 1], 400000);
    });

    it('Test burn contract function', async () => {
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
    });

    afterEach(async () => {
        expect(tr).not.toBeNull;
        //expect(tr.receipt?.status).toEqual(Status.Success);
    });
});