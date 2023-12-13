import { FireblocksSignatureRequest } from '../../models/signature/FireblocksSignatureRequest';
import { ISignatureStrategy } from './ISignatureStrategy';
import {
  FireblocksSDK,
  PeerType,
  TransactionOperation,
  TransactionStatus,
} from 'fireblocks-sdk';
import { FireblocksConfig } from '../StrategyConfig';

export class FireblocksStrategy implements ISignatureStrategy {
  private fireblocks: FireblocksSDK;

  constructor(private strategyConfig: FireblocksConfig) {
    this.fireblocks = new FireblocksSDK(
      strategyConfig.apiSecretKey,
      strategyConfig.apiKey,
      strategyConfig.baseUrl,
    );
  }

  async sign(request: FireblocksSignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signArbitraryMessage(
      request.getVaultAccountId(),
      serializedTransaction,
    );
    return this.hexStringToUint8Array(signatureHex);
  }

  private async signArbitraryMessage(
    vaultAccountId: string,
    message: string,
  ): Promise<string> {
    const { status, id } = await this.fireblocks.createTransaction({
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

    do {
      try {
        console.log('keep polling for tx ' + id + '; status: ' + currentStatus);
        txInfo = await this.fireblocks.getTransactionById(id);
        currentStatus = txInfo.status;
      } catch (err) {
        console.log('err', err);
      }
      await new Promise((r) => setTimeout(r, 1000));
    } while (
      currentStatus != TransactionStatus.COMPLETED &&
      currentStatus != TransactionStatus.FAILED
    );

    const signature = txInfo.signedMessages[0].signature;
    return signature.fullSig;
  }

  private hexStringToUint8Array(hexString: string): Uint8Array {
    const uint8Array = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
      const byte = parseInt(hexString.substr(i, 2), 16);
      uint8Array[i / 2] = byte;
    }
    return uint8Array;
  }
}
