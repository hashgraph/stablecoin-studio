import {
  AccountId,
  TransactionId,
  TransactionReceipt,
  TransactionResponse as TF,
} from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { TransactionResponseJSON } from "@hashgraph/sdk/lib/transaction/TransactionResponse";

const decode = (text: string) => {
  const str = text.startsWith("0x") ? text.substring(2) : text;
  return Buffer.from(str, "hex");
}

export default class TransactionResponse extends TF {
  receipt: TransactionReceipt;

  /**
   *
   */
  constructor(props: {
    nodeId: AccountId;
    transactionHash: Uint8Array;
    transactionId: TransactionId;
  }, receipt?: Uint8Array) {
    super(props);
    if(receipt){
        this.receipt = TransactionReceipt.fromBytes(receipt as Uint8Array);
    }
  }

  getReceiptWithSigner(signer: Signer): Promise<TransactionReceipt> {
    signer;
    return new Promise<TransactionReceipt>((resolve) => resolve(this.receipt));
  }

  static fromJSON(json: TransactionResponseJSON, receipt?: Uint8Array): TransactionResponse {
    return new TransactionResponse({
      nodeId: AccountId.fromString(json.nodeId),
      transactionHash: decode(json.transactionHash),
      transactionId: TransactionId.fromString(json.transactionId),
    }, receipt);
  }
}
