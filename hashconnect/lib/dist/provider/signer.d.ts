import { LedgerId, AccountId, SignerSignature, AccountBalance, AccountInfo, TransactionRecord, Executable } from "@hashgraph/sdk";
import { Signer, Transaction } from "@hashgraph/sdk/lib/Signer";
import { HashConnect } from "../main";
import { HashConnectProvider } from "./provider";
export declare class HashConnectSigner implements Signer {
    private hashconnect;
    private provider;
    private topicId;
    private accountToSign;
    constructor(hashconnect: HashConnect, provider: HashConnectProvider, accountToSign: string, topic: string);
    getLedgerId(): LedgerId | null;
    getAccountId(): AccountId;
    getNetwork(): {
        [key: string]: string;
    };
    getMirrorNetwork(): never[];
    sign(messages: Uint8Array[]): Promise<SignerSignature[]>;
    getAccountBalance(): Promise<AccountBalance>;
    getAccountInfo(): Promise<AccountInfo>;
    getAccountRecords(): Promise<TransactionRecord[]>;
    signTransaction<T extends Transaction>(transaction: T): Promise<T>;
    checkTransaction<T extends Transaction>(transaction: T): Promise<T>;
    populateTransaction<T extends Transaction>(transaction: T): Promise<T>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
    private getBytesOf;
}
