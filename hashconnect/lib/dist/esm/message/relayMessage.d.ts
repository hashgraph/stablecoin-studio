import { HashConnectTypes } from "../main";
export declare class RelayMessage {
    timestamp: number;
    type: RelayMessageType;
    data: any;
    topic: string;
    origin: string;
    constructor(timestamp: number, type: RelayMessageType, data: any, topic: string);
}
export declare enum RelayMessageType {
    Transaction = "Transaction",
    TransactionResponse = "TransactionResponse",
    ApprovePairing = "ApprovePairing",
    RejectPairing = "RejectPairing",
    Acknowledge = "Acknowledge",
    AdditionalAccountRequest = "AdditionalAccountRequest",
    AdditionalAccountResponse = "AdditionalAccountResponse",
    AuthenticationRequest = "AuthenticationRequest",
    AuthenticationResponse = "AuthenticationResponse"
}
export declare namespace MessageTypes {
    interface BaseMessage {
        topic: string;
        id?: string;
        origin?: string;
    }
    interface ApprovePairing extends BaseMessage {
        pairingData?: HashConnectTypes.SavedPairingData;
        metadata: HashConnectTypes.WalletMetadata;
        accountIds: string[];
        network: string;
    }
    interface Acknowledge extends BaseMessage {
        result: boolean;
        msg_id: string;
    }
    interface Rejected extends BaseMessage {
        reason?: string;
        msg_id: string;
    }
    interface AdditionalAccountRequest extends BaseMessage {
        network: string;
        multiAccount: boolean;
    }
    interface AdditionalAccountResponse extends BaseMessage {
        accountIds: string[];
        network: string;
    }
    interface Transaction extends BaseMessage {
        byteArray: Uint8Array | string;
        metadata: TransactionMetadata;
    }
    class TransactionMetadata {
        accountToSign: string;
        returnTransaction: boolean;
        hideNft?: boolean;
        getRecord?: boolean;
    }
    interface TransactionResponse extends BaseMessage {
        success: boolean;
        response?: object | string;
        receipt?: Uint8Array | string;
        record?: Uint8Array | string;
        signedTransaction?: Uint8Array | string;
        error?: string;
    }
    interface AuthenticationRequest extends BaseMessage {
        accountToSign: string;
        serverSigningAccount: string;
        serverSignature: Uint8Array | string;
        payload: {
            url: string;
            data: any;
        };
    }
    interface AuthenticationResponse extends BaseMessage {
        success: boolean;
        error?: string;
        userSignature?: Uint8Array | string;
        signedPayload?: {
            serverSignature: Uint8Array | string;
            originalPayload: {
                url: string;
                data: any;
            };
        };
    }
}
