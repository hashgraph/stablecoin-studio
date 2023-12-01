import {
  FireblocksSDK,
  PeerType,
  TransactionOperation,
  TransactionStatus,
} from "fireblocks-sdk";
import fireblocksConfig from "../../config";
import { FireblocksSignatureRequest } from "../../models/signature/FireblocksSignatureRequest";
import { ISignatureStrategy } from "./ISignatureStrategy";

const fireblocks: FireblocksSDK = new FireblocksSDK(
  fireblocksConfig.apiSecretKey,
  fireblocksConfig.apiKey,
  fireblocksConfig.baseUrl
);

export class FireblocksStrategy implements ISignatureStrategy {
    async sign(request: FireblocksSignatureRequest): Promise<Uint8Array> {
        const fireblocksRequest = request as FireblocksSignatureRequest;
        return signingService(fireblocksRequest);
    }
}
async function signingService(
    request: FireblocksSignatureRequest,
): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(request.transactionBytes).toString('hex');
    const signatureHex = await signArbitraryMessage(
        fireblocks,
        request.vaultAccountId,
        serializedTransaction,
    );
    return hexStringToUint8Array(signatureHex);
}

function hexStringToUint8Array(hexString: string): Uint8Array {
    const uint8Array = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        const byte = parseInt(hexString.substr(i, 2), 16);
        uint8Array[i / 2] = byte;
    }
    return uint8Array;
}

async function signArbitraryMessage(
    fireblocks: FireblocksSDK,
    vaultAccountId: string,
    message: string,
): Promise<string> {
    const { status, id } = await fireblocks.createTransaction({
        operation: TransactionOperation.RAW,
        assetId: 'HBAR_TEST',
        source: {
            type: PeerType.VAULT_ACCOUNT,
            id: vaultAccountId,
        },
        extraParameters: {
            rawMessageData: {
                messages: [
                    {
                        content: message,
                    },
                ],
            },
        },
    });

    let currentStatus = status;
    let txInfo: any;

    while (
        currentStatus != TransactionStatus.COMPLETED &&
        currentStatus != TransactionStatus.FAILED
        ) {
        try {
            console.log(
                'keep polling for tx ' + id + '; status: ' + currentStatus,
            );
            txInfo = await fireblocks.getTransactionById(id);
            currentStatus = txInfo.status;
        } catch (err) {
            console.log('err', err);
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    const signature = txInfo.signedMessages[0].signature;
    return signature.fullSig;
}
