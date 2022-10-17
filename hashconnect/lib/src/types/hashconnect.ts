import { IRelay } from "./relay";
import { Event } from "ts-typed-events";
import { MessageTypes, MessageUtil, RelayMessage } from "../message";
import { MessageHandler } from "../message/message-handler";
import { HashConnectProvider } from "../provider/provider";
import { HashConnectSigner } from "../provider/signer";

export type NetworkType = "testnet" | "mainnet" | "previewnet";

export interface IHashConnect {
  /** Relay */
  relay: IRelay;

  /** Event emitters */
  foundExtensionEvent: Event<HashConnectTypes.WalletMetadata>;
  foundIframeEvent: Event<HashConnectTypes.WalletMetadata>;
  pairingEvent: Event<MessageTypes.ApprovePairing>;
  transactionEvent: Event<MessageTypes.Transaction>;
  acknowledgeMessageEvent: Event<MessageTypes.Acknowledge>;
  additionalAccountRequestEvent: Event<MessageTypes.AdditionalAccountRequest>;
  connectionStatusChangeEvent: Event<HashConnectConnectionState>;
  authRequestEvent: Event<MessageTypes.AuthenticationRequest>;
  signRequestEvent: Event<MessageTypes.SigningRequest>;

  //promises
    transactionResolver: (value: MessageTypes.TransactionResponse | PromiseLike<MessageTypes.TransactionResponse>) => void;
    additionalAccountResolver: (value: MessageTypes.AdditionalAccountResponse | PromiseLike<MessageTypes.AdditionalAccountResponse>) => void;
    authResolver: (value: MessageTypes.AuthenticationResponse | PromiseLike<MessageTypes.AuthenticationResponse>) => void;
    signResolver: (value: MessageTypes.SigningResponse | PromiseLike<MessageTypes.SigningResponse>) => void;

  /** Messages util for protobufs */
  messages: MessageUtil;

  /** Message event parser */
  messageParser: MessageHandler;
  encryptionKeys: Record<string, string>;

  hcData: {
    topic: string;
    pairingString: string;
    encryptionKey: string;
    pairingData: HashConnectTypes.SavedPairingData[];
  };

  debug: boolean;

  /**
   * Initialize the client
   */
  init(
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    network: NetworkType,
    singleAccount: boolean
  ): Promise<HashConnectTypes.InitilizationData>;

  /**
   * Connect to a topic and produce a topic ID for a peer
   *
   * @param topic optional topic
   * @param metadata optional app metadata
   *
   * @returns ConnectionState containing with topic and metadata
   */
  connect(
    topic?: string,
    metadataToConnect?:
      | HashConnectTypes.AppMetadata
      | HashConnectTypes.WalletMetadata,
    encryptionKey?: string
  ): Promise<string>;
  disconnect(topic: string): any;

  /**
   * Pair with a peer
   *
   * @param pairingStr string containing topic and meta data
   */
  pair(
    pairingData: HashConnectTypes.PairingStringData,
    accounts: string[],
    network: string
  ): Promise<HashConnectTypes.SavedPairingData>;

  /**
   * Send a transaction
   *
   * @param topic topic to publish to
   * @param transaction transaction to send
   */
  sendTransaction(
    topic: string,
    transaction: MessageTypes.Transaction
  ): Promise<MessageTypes.TransactionResponse>;

  requestAdditionalAccounts(
    topic: string,
    message: MessageTypes.AdditionalAccountRequest
  ): Promise<MessageTypes.AdditionalAccountResponse>;

  sendAdditionalAccounts(
    topic: string,
    message: MessageTypes.AdditionalAccountResponse
  ): Promise<string>;

  sendTransactionResponse(
    topic: string,
    message: MessageTypes.TransactionResponse
  ): Promise<string>;

  reject(topic: string, reason: string, msg_id: string): Promise<void>;

  decodeLocalTransaction(message: string): Promise<RelayMessage>;

  connectToIframeParent(): void;

  connectToLocalWallet(): void;

  clearConnectionsAndData(): void;

  //authentication

  authenticate(
    topic: string,
    account_id: string,
    server_signing_account: string,
    signature: Uint8Array,
    payload: { url: string; data: any }
  ): Promise<MessageTypes.AuthenticationResponse>;

  sendAuthenticationResponse(
    topic: string,
    message: MessageTypes.AuthenticationResponse
  ): Promise<string>;

  //generic signature
  sign(
    topic: string,
    account_id: string,
    payload: any
  ): Promise<MessageTypes.SigningResponse>;

  sendSigningResponse(
    topic: string,
    message: MessageTypes.SigningResponse
  ): Promise<string>;

  /**
   * Send an acknowledgement of receipt
   *
   * @param topic topic to publish to
   */
  acknowledge(topic: string, pubKey: string, mgs_id: string): Promise<void>;

  /**
   * Generate a pairing string
   *
   * @param topic the topic object from .connect()
   * @param network either 'testnet' or 'mainnet'
   */
  generatePairingString(
    topic: string,
    network: string,
    multiAccount: boolean
  ): string;

  getProvider(
    network: string,
    topicId: string,
    accountToSign: string
  ): HashConnectProvider;
  getSigner(provider: HashConnectProvider): HashConnectSigner;
  getSignerWithAccountKey(
    provider: HashConnectProvider
  ): Promise<HashConnectSigner>;
  getPairingByTopic(topic: string): HashConnectTypes.SavedPairingData | null;
}

export declare namespace HashConnectTypes {
    export interface AppMetadata {
        name: string;
        description: string;
        icon: string;
        publicKey?: string; //todo: remove as deprecated
        encryptionKey?: string;
        url?: string;
    }

    export interface WalletMetadata {
        name: string;
        description: string;
        icon: string;
        publicKey?: string; //todo: remove as deprecated
        encryptionKey?: string;
        url?: string
    }

    export interface InitilizationData {
        topic: string;
        pairingString: string;
        encryptionKey: string;
        savedPairings: SavedPairingData[]
    }

    export interface PairingStringData {
        metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
        topic: string;
        network: string;
        multiAccount: boolean;
        origin?: string;
    }

    export interface SavedPairingData {
        metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
        topic: string;
        encryptionKey?: string;
        network: string;
        origin?: string;
        accountIds: string[],
        lastUsed: number;
    }
}

export enum HashConnectConnectionState {
    Connecting = "Connecting",
    Connected = "Connected",
    Disconnected = "Disconnected",
    Paired = "Paired"
}
