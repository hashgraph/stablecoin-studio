const {
    ContractId,
    AccountId,
    ContractFunctionParameters,
    TokenId,
    TokenSupplyType,
    PublicKey,
    DelegateContractId
} = require('@hashgraph/sdk')

const factoryAddress = "";

import {
    HederaERC20__factory,
    HederaERC1967Proxy__factory,
    StableCoinFactory__factory
} from '../typechain-types'

import {getClient, 
    deployContractSDK,
    contractCall,
    createToken}
 from './utils'

 import {BigNumber} from "ethers";

const hre = require('hardhat')
const hreConfig = hre.network.config

export function initializeClients(){
    const client1 = getClient();    
    const client1account = hreConfig.accounts[0].account;  
    const client1privatekey = hreConfig.accounts[0].privateKey
    const client1publickey = hreConfig.accounts[0].publicKey
    client1.setOperator(client1account, client1privatekey);

    const client2 = getClient();
    const client2account = hreConfig.accounts[1].account;  
    const client2privatekey = hreConfig.accounts[1].privateKey
    const client2publickey = hreConfig.accounts[1].publicKey
    client2.setOperator(client2account, client2privatekey);  

    return [client1,
    client1account,
    client1privatekey,
    client1publickey,
    client2,
    client2account,
    client2privatekey,
    client2publickey]
}

export async function deployFactory(
    account: string,
    privateKey: string
){
    const clientSdk = getClient()
    clientSdk.setOperator(account, privateKey)

    console.log(`Deploying Contract Factory. please wait...`);

    const factory = await deployContractSDK(
        StableCoinFactory__factory,
        privateKey,
        clientSdk
    )

    console.log(`Contract Factory deployed ${factory.toSolidityAddress().toString()}`);

    return factory;
}

export async function deployContractsWithSDK(
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: string,
    maxSupply: string | null,
    memo: string,
    account: string,
    privateKey: string,
    publicKey: string,
    freeze = false
) {
    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

    const clientSdk = getClient()
    clientSdk.setOperator(account, privateKey)

    let f_address = ""

    if(!factoryAddress) f_address = await deployFactory(account, privateKey);
    else f_address = ContractId.fromString(factoryAddress);


    console.log(`Invoking Factory at ${f_address}... please wait.`)

    let tokenObject = {
        "tokenName": name,
        "tokenSymbol": symbol,
        "freeze": freeze,
        "supplyType": (maxSupply !== null)? TokenSupplyType.Finite: TokenSupplyType.Infinite,
        "tokenMaxSupply": maxSupply,
        "tokenInitialSupply": initialSupply,
        "tokenDecimals": decimals,
        "senderPublicKey": PublicKey.fromString(publicKey).toBytes()
    };

    console.log(`Token Object: ${JSON.stringify(tokenObject)}`)

    let parametersContractCall = [tokenObject]

    console.log(`deploying stableCoin... please wait.`)

    let proxyContract = await contractCall(
        f_address,
        'deployStableCoin',
        parametersContractCall,
        clientSdk,
        15000000,
        StableCoinFactory__factory.abi,
        25
    )

    console.log(`Proxy created: ${proxyContract.toString()}`)

    return proxyContract
}

export async function deployContractsWithSDK_old(
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: string,
    maxSupply: string | null,
    memo: string,
    account: string,
    privateKey: string,
    publicKey: string,
    freeze = false
) {
    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

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

    console.log('Creating token... please wait.')
    memo = JSON.stringify({
        proxyContract: String(proxyContract)
    })
    const hederaToken = await createToken(
        proxyContract,
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

    console.log(`Initializing Proxy for Token ${hederaToken.toSolidityAddress()}... please wait.`)
    let parametersContractCall = [hederaToken.toSolidityAddress()]
    await contractCall(
        proxyContract,
        'initialize',
        parametersContractCall,
        clientSdk,
        250000,
        HederaERC20__factory.abi
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