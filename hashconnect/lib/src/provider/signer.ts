import {
  LedgerId,
  AccountId,
  SignerSignature,
  Executable,
  Query,
  TransactionId,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  PublicKey,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { Signer, Transaction } from "@hashgraph/sdk/lib/Signer";
import { HashConnect } from "../main";
import { HashConnectProvider } from "./provider";

export class HashConnectSigner implements Signer {
  private hashconnect: HashConnect;
  private provider: HashConnectProvider;
  private topicId: string;
  private accountToSign: string;

  getAccountKey?: () => PublicKey;

  constructor(
    hashconnect: HashConnect,
    provider: HashConnectProvider,
    accountToSign: string,
    topic: string,
    key?: PublicKey | null
  ) {
    this.hashconnect = hashconnect;
    this.provider = provider;
    this.accountToSign = accountToSign;
    this.topicId = topic;

    if (key) {
      this.getAccountKey = () => key;
    }
  }

  getLedgerId(): LedgerId | null {
    return this.provider.client.ledgerId;
  }

  getAccountId(): AccountId {
    return AccountId.fromString(this.accountToSign);
  }

  getNetwork() {
    const network: { [key: string]: string } = {};
    network[this.accountToSign.toString()] = this.provider.network;

    return network;
  }

  getMirrorNetwork() {
    throw new Error("Get Mirror Network not implemented in HashConnect");

    return [];
  }

  sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    throw new Error("Sign messages not implemented in HashConnect");

    console.log(messages);
  }

  getAccountBalance() {
    return new AccountBalanceQuery()
      .setAccountId(this.accountToSign)
      .execute(this.provider.client);
  }

  getAccountInfo() {
    return new AccountInfoQuery()
      .setAccountId(this.accountToSign)
      .execute(this.provider.client);
  }

  getAccountRecords() {
    return new AccountRecordsQuery()
      .setAccountId(this.accountToSign)
      .execute(this.provider.client);
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    return transaction.freezeWith(this.provider.client);
  }

  checkTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error("Check transaction not implemented in HashConnect");

    console.log(transaction);
  }

  async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
    // await this.checkTransaction(transaction);

    transaction.setTransactionId(TransactionId.generate(this.accountToSign));
    transaction.freezeWith(this.provider.client);
    // transaction.setNodeAccountIds([]);

    return transaction;
  }

  async call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    const transaction = {
      byteArray: this.getBytesOf(request),
      metadata: {
        accountToSign: this.accountToSign.toString(),
        returnTransaction: false,
      },
      topic: this.topicId,
    };
    const res = await this.hashconnect.sendTransaction(
      this.topicId,
      transaction
    );

    let out;
    try {
      out = res;
      if (out.response && typeof res.response === "object" && res.receipt) {
        out.getReceiptWithSigner = (signer: Signer) => {
          signer;
          return new Promise<TransactionReceipt>((resolve) =>
            resolve(TransactionReceipt.fromBytes(res.receipt as Uint8Array))
          );
        };
      }
    } catch (err) {
      console.error(err);
    }

    return out as unknown as OutputT;
  }

  private getBytesOf<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Uint8Array {
    const transaction = request as unknown as Transaction;
    let query;

    if (!transaction) query = request as unknown as Query<any>;

    if (!transaction && !query)
      throw new Error(
        "Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet."
      );

    if (transaction) return (request as unknown as Transaction).toBytes();
    else return (request as unknown as Query<any>).toBytes();
  }
}
