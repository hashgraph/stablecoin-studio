import { Wallet, Signer, Event } from 'ethers'
import { Configuration, Network } from '@configuration'
import {
    CouldNotFindWalletError,
    SignerWithoutProviderError,
    TransactionReceiptError,
    ValidateTxResponseCommand,
    ValidateTxResponseResult,
} from '@scripts'

export async function getFullWalletFromSigner(signer: Signer): Promise<Wallet> {
    if (!signer.provider) {
        throw new SignerWithoutProviderError()
    }
    // If the signer is a wallet, return it
    if (signer instanceof Wallet && signer.privateKey) {
        return signer as Wallet
    }
    const network: Network = (await signer.provider.getNetwork()).name as Network
    for (const privateKey of Configuration.privateKeys[network]) {
        const wallet = new Wallet(privateKey, signer.provider)
        if (wallet.address === (await signer.getAddress())) {
            return wallet
        }
    }
    throw new CouldNotFindWalletError()
}

export async function validateTxResponse({
    txResponse,
    confirmationEvent: confirmationEventName,
    confirmations,
    errorMessage,
}: ValidateTxResponseCommand): Promise<ValidateTxResponseResult> {
    let confirmationEvent: Event | undefined = undefined
    const txReceipt = await txResponse.wait(confirmations)
    if (txReceipt.status === 0) {
        throw new TransactionReceiptError({
            errorMessage,
            txHash: txResponse.hash,
        })
    }
    if (confirmationEvent) {
        const confirmationEventList = txReceipt.events?.filter((event) => {
            return event.event === confirmationEventName
        })
        if (!confirmationEventList || confirmationEventList.length === 0) {
            throw new TransactionReceiptError({
                errorMessage,
                txHash: txResponse.hash,
            })
        }
        confirmationEvent = confirmationEventList[0]
    }
    return new ValidateTxResponseResult({
        txResponse,
        txReceipt,
        confirmationEvent,
    })
}

export async function validateTxResponseList(
    txResponseList: ValidateTxResponseCommand[]
): Promise<ValidateTxResponseResult[]> {
    return Promise.all(
        txResponseList.map(async (txResponse) => {
            return await validateTxResponse(txResponse)
        })
    )
}
