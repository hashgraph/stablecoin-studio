import {
    Client,
    TokenCreateTransaction,
    DelegateContractId,
    Hbar,
    AccountId,
    PrivateKey,
    PublicKey,
    ContractCreateFlow,
    TokenSupplyType,
    ContractExecuteTransaction,
    TokenId,
    ContractId,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TransferTransaction,
    TransactionResponse,
} from '@hashgraph/sdk'

import Web3 from 'web3'
import axios from 'axios'
import { ADDRESS_0 } from './constants'
import TokenTransfer from '@hashgraph/sdk/lib/token/TokenTransfer.js'
import { BigNumber } from 'ethers'

const web3 = new Web3()
const SuccessStatus = 22

export const clientId = 2

export async function contractCall(
    contractId: ContractId,
    functionName: string,
    parameters: any[],
    clientOperator: Client,
    gas: number,
    abi: any,
    value: number | string | Long | Hbar = 0
) {
    const functionCallParameters = encodeFunctionCall(
        functionName,
        parameters,
        abi
    )

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallParameters)
        .setGas(gas)
        .setPayableAmount(value)
        .execute(clientOperator)

    const record = await contractTx.getRecord(clientOperator)
    let results
    if (record.contractFunctionResult) {
        results = decodeFunctionResult(
            abi,
            functionName,
            record.contractFunctionResult?.bytes
        )
    }

    return results
}

function encodeFunctionCall(functionName: string, parameters: any[], abi: any) {
    const functionAbi = abi.find(
        (func: { name: string; type: string }) =>
            func.name === functionName && func.type === 'function'
    )
    const encodedParametersHex = web3.eth.abi
        .encodeFunctionCall(functionAbi, parameters)
        .slice(2)
    return Buffer.from(encodedParametersHex, 'hex')
}

function decodeFunctionResult(
    abi: any,
    functionName: string,
    resultAsBytes: Uint8Array
) {
    const functionAbi = abi.find(
        (func: { name: any }) => func.name === functionName
    )
    const functionParameters = functionAbi?.outputs
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'))
    const result = web3.eth.abi.decodeParameters(
        functionParameters || [],
        resultHex
    )

    const jsonParsedArray = JSON.parse(JSON.stringify(result))

    return jsonParsedArray
}

async function checkTxResponse(
    txResponse: TransactionResponse,
    clientOperator: Client
) {
    const receipt = await txResponse.getReceipt(clientOperator)

    //Get the transaction consensus status
    const transactionStatus = receipt.status

    if (transactionStatus._code !== SuccessStatus) {
        throw new Error(transactionStatus._code.toString())
    }
}

export async function associateToken(
    tokenId: string,
    targetId: string,
    clientOperator: Client
) {
    const txResponse = await new TokenAssociateTransaction()
        .setTokenIds([tokenId])
        .setAccountId(targetId)
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export async function dissociateToken(
    tokenId: string,
    targetId: string,
    clientOperator: Client
) {
    const txResponse = await new TokenDissociateTransaction()
        .setTokenIds([tokenId])
        .setAccountId(targetId)
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export async function transferToken(
    tokenId: string,
    targetId: string,
    amount: BigNumber,
    clientOperator: Client
) {
    const txResponse = await new TransferTransaction()
        .addTokenTransfer(tokenId, targetId, amount.toNumber())
        .addTokenTransfer(
            tokenId,
            clientOperator.operatorAccountId!.toString(),
            -1 * amount.toNumber()
        )
        .execute(clientOperator)

    await checkTxResponse(txResponse, clientOperator)
}

export function oneYearLaterInSeconds(): number {
    const currentDate: Date = new Date()
    return Math.floor(
        currentDate.setFullYear(currentDate.getFullYear() + 1) / 1000
    )
}

export function getClient(network?: string): Client {
    if (!network) {
        const hre = require('hardhat')
        network = hre.network.name
    }
    switch (network) {
        case 'previewnet':
            return Client.forPreviewnet()
            break
        case 'mainnet':
            return Client.forMainnet()
            break
        default:
        case 'testnet':
            return Client.forTestnet()
            break
    }
}

export async function createToken(
    contractId: string,
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: number,
    maxSupply: number | null,
    memo: string,
    freeze = false,
    accountId: string,
    privateKey: string,
    publicKey: string,
    clientSdk: Client
): Promise<TokenId | null> {
    const transaction = new TokenCreateTransaction()
        .setMaxTransactionFee(new Hbar(25))
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTokenMemo(memo)
        .setFreezeDefault(freeze)
        .setTreasuryAccountId(AccountId.fromString(contractId.toString()))
        .setAdminKey(PublicKey.fromString(publicKey))
        .setFreezeKey(DelegateContractId.fromString(contractId))
        .setWipeKey(DelegateContractId.fromString(contractId))
        .setPauseKey(DelegateContractId.fromString(contractId))
        .setSupplyKey(DelegateContractId.fromString(contractId))

    if (maxSupply !== null) {
        transaction.setSupplyType(TokenSupplyType.Finite)
        transaction.setMaxSupply(maxSupply)
    }
    transaction.freezeWith(clientSdk)

    const transactionSign = await transaction.sign(
        PrivateKey.fromStringED25519(privateKey)
    )
    const txResponse = await transactionSign.execute(clientSdk)
    const receipt = await txResponse.getReceipt(clientSdk)
    const tokenId = receipt.tokenId
    console.log(
        `Token ${name} created tokenId ${tokenId} - tokenAddress ${tokenId?.toSolidityAddress()}   `
    )
    return tokenId
}

export async function deployContractSDK(
    factory: any,
    privateKey: string,
    clientOperator: Client,
    constructorParameters?: any,
    adminKey?: PrivateKey
): Promise<ContractId> {
    const Key = adminKey ? adminKey : PrivateKey.fromStringED25519(privateKey)

    const transaction = new ContractCreateFlow()
        .setBytecode(factory.bytecode)
        .setGas(250_000)
    //.setAdminKey(Key)
    if (constructorParameters) {
        transaction.setConstructorParameters(constructorParameters)
    }

    const contractCreateSign = await transaction.sign(
        PrivateKey.fromStringED25519(privateKey)
    )

    const txResponse = await contractCreateSign.execute(clientOperator)
    const receipt = await txResponse.getReceipt(clientOperator)

    const contractId = receipt.contractId
    if (!contractId) {
        throw Error('Error deploying contractSDK')
    }
    console.log(
        ` ${
            factory.name
        } - contractId ${contractId} -contractId ${contractId?.toSolidityAddress()}   `
    )
    return contractId
}

export async function toEvmAddress(
    accountId: string,
    isE25519: boolean
): Promise<string> {
    try {
        if (isE25519)
            return '0x' + AccountId.fromString(accountId).toSolidityAddress()

        const URI_BASE = `${getHederaNetworkMirrorNodeURL()}/api/v1/`
        const url = URI_BASE + 'accounts/' + accountId
        const res = await axios.get<IAccount>(url)
        return res.data.evm_address
    } catch (error) {
        throw new Error('Error retrieving the Evm Address : ' + error)
    }
}

export async function evmToHederaFormat(evmAddress: string): Promise<string> {
    if (evmAddress === ADDRESS_0) return '0.0.0'
    const URI_BASE = `${getHederaNetworkMirrorNodeURL()}/api/v1/`
    const url = URI_BASE + 'accounts/' + evmAddress
    const res = await axios.get<IAccount>(url)
    return res.data.account
}

interface IAccount {
    evm_address: string
    key: IKey
    account: string
}

interface IKey {
    _type: string
    key: string
}

function getHederaNetworkMirrorNodeURL(network?: string): string {
    if (!network) {
        const hre = require('hardhat')
        network = hre.network.name
    }
    switch (network) {
        case 'mainnet':
            return 'https://mainnet-public.mirrornode.hedera.com'
        case 'previewnet':
            return 'https://previewnet.mirrornode.hedera.com'
        case 'testnet':
            return 'https://testnet.mirrornode.hedera.com'
        default:
            return 'http://127.0.0.1:5551'
    }
}
