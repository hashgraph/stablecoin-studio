import { Wallet, Signer, BaseContract, TransactionReceipt } from 'ethers'
import { NetworkName, NetworkChainId, NetworkNameByChainId } from '@configuration'
import { configuration } from '@hardhat-configuration'
import { TypedContractEvent } from '@contracts/common'
import {
    CouldNotFindWalletError,
    SignerWithoutProviderError,
    TransactionReceiptError,
    ValidateTxResponseCommand,
    ValidateTxResponseResult,
} from '@scripts'
import { TransactionStatus } from '@tasks'

export async function getFullWalletFromSigner(signer: Signer): Promise<Wallet> {
    if (!signer.provider) {
        throw new SignerWithoutProviderError()
    }

    // If the signer is a wallet, return it
    if (signer instanceof Wallet && signer.privateKey) {
        return signer as Wallet
    }

    const chainId = Number((await signer.provider.getNetwork()).chainId) as NetworkChainId
    const network: NetworkName = NetworkNameByChainId[chainId]
    if (configuration.privateKeys[network] === undefined || configuration.privateKeys[network].length == 0) {
      return signer as Wallet
    }

    for (const privateKey of configuration.privateKeys[network]) {
        const wallet = new Wallet(privateKey, signer.provider)
        if (wallet.address === (await signer.getAddress())) {
            return wallet
        }
    }
    throw new CouldNotFindWalletError()
}

export async function validateTxResponse({
    txResponse,
    contract,
    confirmationEvent,
    confirmations,
    errorMessage,
}: ValidateTxResponseCommand): Promise<ValidateTxResponseResult> {
    const provider = txResponse.provider
    if (!provider) {
        throw new Error('TransactionResponse is missing provider')
    }
    const txReceipt = await txResponse.wait(confirmations)
    if (!txReceipt) {
        throw new TransactionReceiptError({
            errorMessage: `Transaction ${txResponse.hash} was not mined`,
            txHash: txResponse.hash,
        })
    }
    if (txReceipt.status === TransactionStatus.REVERTED) {
        throw new TransactionReceiptError({
            errorMessage,
            txHash: txResponse.hash,
        })
    }

    if (confirmationEvent && contract) {
        try {
            await decodeEvent(contract, confirmationEvent, txReceipt)
        } catch {
            throw new TransactionReceiptError({
                errorMessage,
                txHash: txResponse.hash,
            })
        }
    }
    return new ValidateTxResponseResult({
        txResponse,
        txReceipt,
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

export type GetEventArguments<T extends BaseContract, TName extends keyof T['filters']> =
    T['filters'][TName] extends TypedContractEvent<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer TOutputObject
    >
        ? TOutputObject
        : never

export async function decodeEvent<T extends BaseContract, TEventName extends keyof T['filters']>(
    contract: T,
    eventName: TEventName,
    transactionReceipt: TransactionReceipt | null
): Promise<GetEventArguments<T, TEventName>> {
    if (transactionReceipt == null) {
        throw new Error('Transaction receipt is empty')
    }

    const eventFragment = contract.interface.getEvent(eventName as string)
    if (eventFragment === null) {
        throw new Error(`Event "${eventName as string}" doesn't exist in the contract`)
    }

    const topic = eventFragment.topicHash
    const contractAddress = await contract.getAddress()

    const eventLog = transactionReceipt.logs.find(
        (log) => log.address.toLowerCase() === contractAddress.toLowerCase() && log.topics[0] === topic
    )

    if (!eventLog) {
        throw new Error(`Event log for "${eventName as string}" not found in transaction receipt`)
    }

    const decodedArgs = contract.interface.decodeEventLog(eventFragment, eventLog.data, eventLog.topics)

    return decodedArgs.toObject() as GetEventArguments<T, TEventName>
}
