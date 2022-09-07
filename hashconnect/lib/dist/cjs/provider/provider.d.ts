import { AccountId, Client, Provider, TransactionId, TransactionResponse } from '@hashgraph/sdk';
import Executable from '@hashgraph/sdk/lib/Executable';
import { HashConnect } from '../main';
export declare class HashConnectProvider implements Provider {
    client: Client;
    private hashconnect;
    network: string;
    topicId: string;
    accountToSign: string;
    constructor(networkName: string, hashconnect: HashConnect, topicId: string, accountToSign: string);
    getLedgerId(): import("@hashgraph/sdk/lib/LedgerId").default | null;
    getNetwork(): {
        [key: string]: string | AccountId;
    };
    getMirrorNetwork(): never[];
    getAccountBalance(accountId: AccountId | string): Promise<import("@hashgraph/sdk").AccountBalance>;
    getAccountInfo(accountId: AccountId | string): Promise<import("@hashgraph/sdk").AccountInfo>;
    getAccountRecords(accountId: AccountId | string): Promise<import("@hashgraph/sdk").TransactionRecord[]>;
    getTransactionReceipt(transactionId: TransactionId | string): Promise<import("@hashgraph/sdk").TransactionReceipt>;
    waitForReceipt(response: TransactionResponse): Promise<import("@hashgraph/sdk").TransactionReceipt>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
    private getBytesOf;
}
