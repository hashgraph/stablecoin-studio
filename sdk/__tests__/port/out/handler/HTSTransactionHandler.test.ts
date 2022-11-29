import { Client } from "@hashgraph/sdk";
import Long from "long";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoin from '../../../../src/domain/context/stablecoin/StableCoin.js';
import Contract from '../../../../src/domain/context/contract/Contract.js';
import {
	HederaERC20Proxy__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { Status } from '@hashgraph/sdk';

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
    const clientAccountId:string = '0.0.47792863';
    const clientPrivateKey:string = '302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
    const accountId:string = '0.0.47793222';
    const tokenId:string = '0.0.48987373';
    const proxyContractId:string = '0.0.48987372';
    const stableCoin = new StableCoin(
        new Contract(
            proxyContractId,
            HederaERC20Proxy__factory.abi,
            'stablecoin',
        ),
        tokenId,
        '0x0000000000000000000000000000000002eb9bb8',
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
        tr = await th.wipe(stableCoin, tokenId, Long.ONE);
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

    afterEach(async () => {
        expect(tr).not.toBeNull;
        //expect(tr.receipt?.status).toEqual(Status.Success);
    });
});