import { Client, TransactionResponse } from "@hashgraph/sdk";
import Long from "long";
import { HTSTransactionHandler } from "../../../../src/port/out/handler/HTSTransactionHandler.js";

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
    
    let th:HTSTransactionHandler
    let client:Client
beforeAll(async () => {
    client= Client.forTestnet() 
    client.setOperator('0.0.47792863','302e020100300506032b65700422042078068d0d381ec19047ca0f6612a66b9a3c990fb1f8adc2fd2735b78423c2e10c')
    th = new HTSTransactionHandler(client)
});
/*
it('Test wipe', async () => {
    const tr:TransactionResponse = await th.wipe('0.0.47792863','0.0.48987373',Long.fromNumber(1))
    console.log(JSON.stringify(await tr.getReceipt(client)))
    expect(tr).not.toBeNull;
});
*/

it('Test cashIn', async () => {
    const tr:TransactionResponse = await th.cashIn('0.0.48987373',Long.fromNumber(1))
    console.log(JSON.stringify(await tr.getReceipt(client)))
    expect(tr).not.toBeNull;
});

});