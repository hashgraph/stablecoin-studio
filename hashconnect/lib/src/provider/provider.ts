import * as sdk from '@hashgraph/sdk';
import { HashConnect } from '../main';
export class HashConnectProvider implements sdk.Provider {
    client: sdk.Client;
    private hashconnect: HashConnect;
    network: string;
    topicId: string;
    accountToSign: string;

    public constructor(networkName: string, hashconnect: HashConnect, topicId: string, accountToSign: string) {
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = sdk.Client.forName(networkName);
        this.topicId = topicId;
        this.accountToSign = accountToSign;
    }

    getLedgerId() {
        return this.client.ledgerId;
    }

    getNetwork() {
        return this.client.network;
    }

    getMirrorNetwork() {
        throw new Error("Get Mirror Network not implemented in HashConnect provider");

        return [];
    }

    getAccountBalance(accountId: sdk.AccountId | string) {
        return new sdk.AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getAccountInfo(accountId: sdk.AccountId | string) {
        return new sdk.AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getAccountRecords(accountId: sdk.AccountId | string) {
        return new sdk.AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getTransactionReceipt(transactionId: sdk.TransactionId | string) {
        return new sdk.TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this.client);
    }

    waitForReceipt(response: sdk.TransactionResponse) {
        return new sdk.TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(this.client);
    }

    async call<RequestT, ResponseT, OutputT>(request: sdk.Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        const transaction = {
            byteArray: this.getBytesOf(request),
            metadata: {
                accountToSign: this.accountToSign.toString(),
                returnTransaction: false,
            },
            topic: this.topicId,
        };

        const res = await this.hashconnect.sendTransaction(this.topicId, transaction);
        
        const response: sdk.TransactionResponse = res.response as sdk.TransactionResponse;
        
        return (response as unknown) as OutputT;
            throw new Error(`We only know how to forward Transactions and Queries.`);
    }

    private getBytesOf<RequestT, ResponseT, OutputT>(request: sdk.Executable<RequestT, ResponseT, OutputT>): Uint8Array {
        const transaction = (request as unknown) as sdk.Transaction;
        let query;

        if (!transaction)
            query = (request as unknown) as sdk.Query<any>;

        if (!transaction && !query)
            throw new Error("Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet.");

        if (transaction)
            return ((request as unknown) as sdk.Transaction).toBytes();
        else
            return ((request as unknown) as sdk.Query<any>).toBytes();
    }
}