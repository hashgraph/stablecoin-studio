import * as sdk from '@hashgraph/sdk';
import { HashConnect } from '../main';
export declare class HashConnectProvider implements sdk.Provider {
    client: sdk.Client;
    private hashconnect;
    network: string;
    topicId: string;
    accountToSign: string;
    constructor(networkName: string, hashconnect: HashConnect, topicId: string, accountToSign: string);
    getLedgerId(): sdk.LedgerId | null;
    getNetwork(): {
        [key: string]: string | sdk.AccountId;
    };
    getMirrorNetwork(): never[];
    getAccountBalance(accountId: sdk.AccountId | string): Promise<sdk.AccountBalance>;
    getAccountInfo(accountId: sdk.AccountId | string): Promise<sdk.AccountInfo>;
    getAccountRecords(accountId: sdk.AccountId | string): Promise<sdk.TransactionRecord[]>;
    getTransactionReceipt(transactionId: sdk.TransactionId | string): Promise<sdk.TransactionReceipt>;
    waitForReceipt(response: sdk.TransactionResponse): Promise<sdk.TransactionReceipt>;
    call<RequestT, ResponseT, OutputT>(request: sdk.Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
    private getBytesOf;
}
