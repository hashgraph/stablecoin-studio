const {
    TokenCreateTransaction,
    DelegateContractId,
    Hbar,
    Client,
    AccountId,
    PrivateKey,
    PublicKey,
    ContractCreateFlow,
    TokenSupplyType,
    ContractExecuteTransaction,
} = require('@hashgraph/sdk')

import Web3 from 'web3'

const hre = require('hardhat')

const web3 = new Web3()

export async function contractCall(
    contractId: any,
    functionName: string,
    parameters: any[],
    clientOperator: any,
    gas: any,
    abi: any,
    value: string | null = null
) {
    const functionCallParameters = encodeFunctionCall(
        functionName,
        parameters,
        abi
    )

    let contractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallParameters)
        .setGas(gas)
        .execute(clientOperator)
        .setPayableAmount(value)

    const record = await contractTx.getRecord(clientOperator)

    const results = decodeFunctionResult(
        abi,
        functionName,
        record.contractFunctionResult?.bytes
    )

    return results
}

function encodeFunctionCall(functionName: any, parameters: any[], abi: any) {
    const functionAbi = abi.find(
        (func: { name: any; type: string }) =>
            func.name === functionName && func.type === 'function'
    )
    const encodedParametersHex = web3.eth.abi
        .encodeFunctionCall(functionAbi, parameters)
        .slice(2)
    return Buffer.from(encodedParametersHex, 'hex')
}

function decodeFunctionResult(abi: any, functionName: any, resultAsBytes: any) {
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

export function getClient() {
    switch (hre.network.name) {
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
    contractId: any,
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: string,
    maxSupply: string | null,
    memo: string,
    freeze = false,
    accountId: string,
    privateKey: string,
    publicKey: string,
    clientSdk: any
) {
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
        .setFreezeKey(PublicKey.fromString(publicKey))
        .setWipeKey(DelegateContractId.fromString(contractId))
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
    privateKey: any,
    clientOperator: any,
    constructorParameters?: any
) {
    const transaction = new ContractCreateFlow()
        .setBytecode(factory.bytecode)
        .setGas(250_000)
        .setAdminKey(PrivateKey.fromStringED25519(privateKey))
    if (constructorParameters) {
        transaction.setConstructorParameters(constructorParameters)
    }

    const contractCreateSign = await transaction.sign(
        PrivateKey.fromStringED25519(privateKey)
    )

    const txResponse = await contractCreateSign.execute(clientOperator)
    const receipt = await txResponse.getReceipt(clientOperator)

    const contractId = receipt.contractId
    console.log(
        ` ${
            factory.name
        } - contractId ${contractId} -contractId ${contractId?.toSolidityAddress()}   `
    )
    return contractId
}