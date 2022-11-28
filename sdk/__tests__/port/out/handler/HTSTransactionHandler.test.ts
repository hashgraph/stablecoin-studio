import { Client, TransactionResponse } from "@hashgraph/sdk";
import Long from "long";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";
import { HTSTransactionResponseHandler } from "../../../../src/port/out/handler/response/HTSTransactionResponseHandler.js";
import { TransactionType, HTSResponse } from '../../../../src/port/out/handler/response/TransactionResponse.js';
import { Status } from '@hashgraph/sdk';

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
    const clientAccountId:string = '0.0.47792863';
    const clientPrivateKey:string = '302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c';
    const accountId:string = '0.0.47793222';
    const tokenId:string = '0.0.48987373';

    let th:HTSTransactionHandler
    let client:Client
    let tr:TransactionResponse;
    beforeAll(async () => {
        client= Client.forTestnet();
        client.setOperator(clientAccountId, clientPrivateKey);
        th = new HTSTransactionHandler(client);
    });

    it('Test cashIn', async () => {
        tr = await th.mint(tokenId, Long.ONE);
    });

    it('Test burn', async () => {
        tr = await th.burn(tokenId, Long.ONE);
    });

    it('Test transfer', async () => {
        tr = await th.mint(tokenId, Long.ONE);
        tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
    });

    it('Test wipe', async () => {
        tr = await th.mint(tokenId, Long.ONE);
        tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
        tr = await th.wipe(accountId, tokenId, Long.ONE);
    });

    it('Test freeze', async () => {
        tr = await th.freeze(tokenId, accountId);
    });

    it('Test unfreeze', async () => {
        tr = await th.unfreeze(tokenId, accountId);
    });

    it('Test pause', async () => {
        tr = await th.pause(tokenId);
    });

    it('Test unpause', async () => {
        tr = await th.unpause(tokenId);        
    }); 

    afterEach(async () => {
        expect(tr).not.toBeNull;
        const response: HTSResponse = await HTSTransactionResponseHandler.manageResponse(tr, TransactionType.RECEIPT, client);
        expect(response.receipt?.status).toEqual(Status.Success);
    });
});