import { LedgerId, AccountId, SignerSignature, Executable, PublicKey } from "@hashgraph/sdk";
import { Signer, Transaction } from "@hashgraph/sdk/lib/Signer";
import { HashConnect } from "../main";
import { HashConnectProvider } from "./provider";
export declare class HashConnectSigner implements Signer {
    private hashconnect;
    private provider;
    private topicId;
    private accountToSign;
    getAccountKey?: () => PublicKey;
    constructor(hashconnect: HashConnect, provider: HashConnectProvider, accountToSign: string, topic: string, key?: PublicKey | null);
    getLedgerId(): LedgerId | null;
    getAccountId(): AccountId;
    getNetwork(): {
        [key: string]: string;
    };
    getMirrorNetwork(): never[];
    sign(messages: Uint8Array[]): Promise<SignerSignature[]>;
    getAccountBalance(): Promise<import("@hashgraph/sdk").AccountBalance>;
    getAccountInfo(): Promise<import("@hashgraph/sdk").AccountInfo>;
    getAccountRecords(): Promise<import("@hashgraph/sdk").TransactionRecord[]>;
    signTransaction<T extends Transaction>(transaction: T): Promise<T>;
    checkTransaction<T extends Transaction>(transaction: T): Promise<T>;
    populateTransaction<T extends Transaction>(transaction: T): Promise<T>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
    private getBytesOf;
}
