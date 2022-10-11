const {
    TokenCreateTransaction,
    DelegateContractId,
    Hbar,
    Client,
    AccountId,
    PrivateKey,
    ContractFunctionParameters,
    PublicKey,
    ContractCreateFlow,
    TokenId,
    TokenSupplyType,
    ContractExecuteTransaction,
} = require('@hashgraph/sdk')

import {
    HederaERC20__factory,
    HTSTokenOwner__factory,
    HederaERC1967Proxy__factory,
} from '../typechain-types'

import Web3 from 'web3'

const hre = require('hardhat')
const hreConfig = hre.network.config

const web3 = new Web3()

export async function deployContractsWithSDK(
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply = 0,
    maxSupply: number | null,
    memo: string,
    freeze = false
) {
    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

    const account = hreConfig.accounts[0].account
    const privateKey = hreConfig.accounts[0].privateKey
    const publicKey = hreConfig.accounts[0].publicKey

    const clientSdk = getClient()
    clientSdk.setOperator(account, privateKey)

    console.log(
        `Deploying ${HederaERC20__factory.name} contract... please wait.`
    )
    const tokenContract = await deployContractSDK(
        HederaERC20__factory,
        privateKey,
        clientSdk
    )

    console.log(
        `Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`
    )
    const parameters = new ContractFunctionParameters()
        .addAddress(tokenContract!.toSolidityAddress())
        .addBytes(new Uint8Array([]))
    const proxyContract = await deployContractSDK(
        HederaERC1967Proxy__factory,
        privateKey,
        clientSdk,
        parameters
    )
    let parametersContractCall: any[] = []
    await contractCall(
        proxyContract,
        'initialize',
        parametersContractCall,
        clientSdk,
        250000,
        HederaERC20__factory.abi
    )

    console.log(
        `Deploying ${HTSTokenOwner__factory.name} contract... please wait.`
    )
    const tokenOwnerContract = await deployContractSDK(
        HTSTokenOwner__factory,
        privateKey,
        clientSdk
    )

    console.log('Creating token... please wait.')
    memo = JSON.stringify({
        proxyContract: String(proxyContract),
        htsAccount: String(tokenOwnerContract),
    })
    const hederaToken = await createToken(
        tokenOwnerContract,
        name,
        symbol,
        decimals,
        initialSupply,
        maxSupply,
        memo,
        freeze,
        account!,
        privateKey!,
        publicKey!,
        clientSdk
    )

    console.log('Setting up contract... please wait.')
    parametersContractCall = [
        tokenOwnerContract!.toSolidityAddress(),
        TokenId.fromString(hederaToken!.toString()).toSolidityAddress(),
    ]
    await contractCall(
        proxyContract,
        'setTokenAddress',
        parametersContractCall,
        clientSdk,
        80000,
        HederaERC20__factory.abi
    )

    parametersContractCall = [proxyContract!.toSolidityAddress()]
    await contractCall(
        tokenOwnerContract,
        'setERC20Address',
        parametersContractCall,
        clientSdk,
        60000,
        HTSTokenOwner__factory.abi
    )

    console.log('Associate administrator account to token... please wait.')
    parametersContractCall = [
        AccountId.fromString(account!).toSolidityAddress(),
    ]
    await contractCall(
        proxyContract,
        'associateToken',
        parametersContractCall,
        clientSdk,
        1300000,
        HederaERC20__factory.abi
    )

    return proxyContract
}

export async function contractCall(
    contractId: any,
    functionName: string,
    parameters: any[],
    clientOperator: any,
    gas: any,
    abi: any
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
        .execute(clientOperator)

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

async function createToken(
    contractId: any,
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply = 0,
    maxSupply: number | null,
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

async function deployContractSDK(
    factory: any,
    privateKey: any,
    clientOperator: any,
    constructorParameters?: any
) {
    const transaction = new ContractCreateFlow()
        .setBytecode(factory.bytecode)
        .setGas(90_000)
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
