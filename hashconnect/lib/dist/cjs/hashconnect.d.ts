import { Event } from "ts-typed-events";
import { IRelay } from "./types/relay";
import { MessageUtil, MessageHandler, MessageTypes, RelayMessage } from "./message";
import { HashConnectTypes, IHashConnect, HashConnectConnectionState } from "./types/hashconnect";
import { HashConnectProvider } from "./provider/provider";
import { HashConnectSigner } from "./provider/signer";
/**
 * Main interface with hashpack
 */
export declare class HashConnect implements IHashConnect {
    relay: IRelay;
    foundExtensionEvent: Event<HashConnectTypes.WalletMetadata>;
    foundIframeEvent: Event<HashConnectTypes.WalletMetadata>;
    pairingEvent: Event<MessageTypes.ApprovePairing>;
    transactionEvent: Event<MessageTypes.Transaction>;
    acknowledgeMessageEvent: Event<MessageTypes.Acknowledge>;
    additionalAccountRequestEvent: Event<MessageTypes.AdditionalAccountRequest>;
    connectionStatusChangeEvent: Event<HashConnectConnectionState>;
    authRequestEvent: Event<MessageTypes.AuthenticationRequest>;
    transactionResolver: (value: MessageTypes.TransactionResponse | PromiseLike<MessageTypes.TransactionResponse>) => void;
    additionalAccountResolver: (value: MessageTypes.AdditionalAccountResponse | PromiseLike<MessageTypes.AdditionalAccountResponse>) => void;
    authResolver: (value: MessageTypes.AuthenticationResponse | PromiseLike<MessageTypes.AuthenticationResponse>) => void;
    messageParser: MessageHandler;
    messages: MessageUtil;
    private metadata;
    encryptionKeys: Record<string, string>;
    debug: boolean;
    status: HashConnectConnectionState;
    hcData: {
        topic: string;
        pairingString: string;
        encryptionKey: string;
        pairingData: HashConnectTypes.SavedPairingData[];
    };
    constructor(debug?: boolean);
    init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata, network: "testnet" | "mainnet" | "previewnet", singleAccount?: boolean): Promise<HashConnectTypes.InitilizationData>;
    connect(topic?: string, metadataToConnect?: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata, encryptionKey?: string): Promise<string>;
    disconnect(topic: string): Promise<void>;
    /**
     * Set up event connections
     */
    private setupEvents;
    /**
     * Local data management
     */
    saveDataInLocalstorage(): void;
    loadLocalData(): boolean;
    clearConnectionsAndData(): Promise<void>;
    /**
     * Send functions
     */
    sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<MessageTypes.TransactionResponse>;
    requestAdditionalAccounts(topic: string, message: MessageTypes.AdditionalAccountRequest): Promise<MessageTypes.AdditionalAccountResponse>;
    sendAdditionalAccounts(topic: string, message: MessageTypes.AdditionalAccountResponse): Promise<string>;
    sendTransactionResponse(topic: string, message: MessageTypes.TransactionResponse): Promise<string>;
    pair(pairingData: HashConnectTypes.PairingStringData, accounts: string[], network: string): Promise<HashConnectTypes.SavedPairingData>;
    reject(topic: string, reason: string, msg_id: string): Promise<void>;
    acknowledge(topic: string, pubKey: string, msg_id: string): Promise<void>;
    authenticate(topic: string, account_id: string, server_signing_account: string, serverSignature: Uint8Array, payload: {
        url: string;
        data: any;
    }): Promise<MessageTypes.AuthenticationResponse>;
    sendAuthenticationResponse(topic: string, message: MessageTypes.AuthenticationResponse): Promise<string>;
    /**
     * Helpers
     */
    generatePairingString(topic: string, network: string, multiAccount: boolean): string;
    decodePairingString(pairingString: string): HashConnectTypes.PairingStringData;
    private generateEncryptionKeys;
    private sanitizeString;
    /**
     * Local wallet stuff
     */
    findLocalWallets(): void;
    connectToIframeParent(): void;
    connectToLocalWallet(): void;
    sendEncryptedLocalTransaction(message: string): void;
    decodeLocalTransaction(message: string): Promise<RelayMessage>;
    /**
     * Provider stuff
     */
    getProvider(network: string, topicId: string, accountToSign: string): HashConnectProvider;
    getSigner(provider: HashConnectProvider): HashConnectSigner;
    getPairingByTopic(topic: string): HashConnectTypes.SavedPairingData | null;
}
