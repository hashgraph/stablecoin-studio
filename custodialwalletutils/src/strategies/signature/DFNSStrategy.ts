import { ISignatureStrategy } from './ISignatureStrategy';
import { DFNSSignatureRequest } from '../../models/signature/DFNSSignatureRequest';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { DfnsApiClient, DfnsApiClientOptions } from '@dfns/sdk';
import { DFNSConfig } from '../StrategyConfig';
import {
  SignatureKind,
  SignatureStatus,
} from '@dfns/sdk/codegen/datamodel/Wallets';
import { hexStringToUint8Array } from '../../utils/utilities';

const dfnsWalletId = 'wa-6qfr0-heg0c-985bmvv9hphbok47'; // Wallet EdDSA
const dfnsTestUrl = 'https://api.dfns.ninja';
const dfnsAppId = 'ap-b6uj2-95t58-55o0cprm1lqqkpn';
const dfnsAppOrigin = 'http://stablecoin.es';
const dfnsEcdsaServiceAccountAuthToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg';
const dfnsEcdsaServiceaccountCredentialId =
    'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ';
const privateKeyToCreateECDSAServiceAccount =
    '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKrGoR4v2XoJzaTlNDhQ0hbd4gOvlGFiEEroqCj8CuCCoAoGCCqGSM49AwEHoUQDQgAEsSDhu7Jwx3hJEH9jyAQcKd0XNIW9Sq7CG8DQA7nQrPUfpIsubyWbMv7MRe5M92uRtgCvbPttPmph0uvPh2sAyg==\n-----END EC PRIVATE KEY-----';

// REQUEST
const signer = new AsymmetricKeySigner({
  privateKey: privateKeyToCreateECDSAServiceAccount,
  credId: dfnsEcdsaServiceaccountCredentialId,
  appOrigin: dfnsAppOrigin,
});

//CONFIG
const dfnsApiClientOptions: DfnsApiClientOptions = {
  appId: dfnsAppId,
  authToken: dfnsEcdsaServiceAccountAuthToken,
  baseUrl: dfnsTestUrl,
  signer: signer,
};

const dfnsApiClient: DfnsApiClient = new DfnsApiClient(dfnsApiClientOptions);

//WALLET -> REQUEST
const dfnsWalletOptions: DfnsWalletOptions = {
  walletId: dfnsWalletId,
  dfnsClient: dfnsApiClient,
  maxRetries: 6,
  retryInterval: 2000,
};

const dfnsWallet: DfnsWallet = new DfnsWallet(dfnsWalletOptions);


const dfnsAccountId = '0.0.4480877';
const dfnsPublicKey =
    '94ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a47477061';


const sleep = (interval = 0) =>
    new Promise((resolve) => setTimeout(resolve, interval));


export class DFNSStrategy implements ISignatureStrategy {
  private signer: AsymmetricKeySigner;
  public dfnsApiClientOptions: DfnsApiClientOptions;
  constructor(private strategyConfig: DFNSConfig) {
    this.signer = new AsymmetricKeySigner({
      privateKey: strategyConfig.privateKeyToCreateECDSAServiceAccount,
      credId: strategyConfig.dfnsEcdsaServiceaccountCredentialId,
      appOrigin: strategyConfig.dfnsAppOrigin,
    });

    this.dfnsApiClientOptions = {
      appId: strategyConfig.dfnsAppId,
      authToken: strategyConfig.dfnsEcdsaServiceAccountAuthToken,
      baseUrl: strategyConfig.dfnsTestUrl,
      signer: strategyConfig.signer,
    };
  }
  async sign(request: DFNSSignatureRequest): Promise<Uint8Array> {
    return Uint8Array.from([]);
  }
}


async function signingService(
    transactionBytes: Uint8Array,
): Promise<Uint8Array> {
  const serializedTransaction = Buffer.from(transactionBytes).toString('hex');
  const signature = await signMessage(serializedTransaction);
  return hexStringToUint8Array(signature);
}

async function signMessage(message: string): Promise<string> {
  const { walletId, dfnsClient } = dfnsWalletOptions;
  const res = await dfnsClient.wallets.generateSignature({
    walletId,
    body: { kind: SignatureKind.Message, message: `0x${message}` },
  });
  const signature = await waitForSignature(res.id);
  return signature.toString('hex');
}

async function waitForSignature(signatureId: string) {
  const { walletId, dfnsClient } = dfnsWalletOptions;
  let maxRetries = dfnsWalletOptions.maxRetries ?? 3;
  const retryInterval = dfnsWalletOptions.retryInterval ?? 1000;

  while (maxRetries > 0) {
    await sleep(retryInterval);
    const res = await dfnsClient.wallets.getSignature({
      walletId,
      signatureId,
    });
    if (res.status === SignatureStatus.Signed) {
      if (!res.signature) break;
      return Buffer.from(
          res.signature.r
              .substring(2)
              .concat(res.signature.s.substring(2)),
          'hex',
      );
    } else if (res.status === SignatureStatus.Failed) {
      break;
    }
    maxRetries -= 1;
  }
  const waitedSeconds = Math.floor((maxRetries * retryInterval) / 1000);
  throw new Error(
      `Signature request ${signatureId} took more than ${waitedSeconds}s to complete, stopping polling. Please update options "maxRetries" or "retryIntervals" to wait longer.`,
  );
}
