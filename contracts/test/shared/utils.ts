import { BigNumber } from 'ethers'
import {
    deployContractsWithSDK,
    getNonOperatorAccount,
    getNonOperatorClient,
    getNonOperatorE25519,
    getOperatorAccount,
    getOperatorClient,
    getOperatorE25519,
    getOperatorPrivateKey,
    getOperatorPublicKey,
    initializeClients,
} from '../../scripts/deploy'
import { clientId } from '../../scripts/utils'
import { ContractId } from '@hashgraph/sdk'

export const TOKEN_DECIMALS = 6
export const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
export const TOKEN_NAME = 'MIDAS'
export const TOKEN_SYMBOL = 'MD'
export const TOKEN_FACTOR = BigNumber.from(10).pow(TOKEN_DECIMALS)
export const INIT_SUPPLY = BigNumber.from(100).mul(TOKEN_FACTOR)
export const MAX_SUPPLY = BigNumber.from(1000).mul(TOKEN_FACTOR)
export const ONE_TOKEN = BigNumber.from(1).mul(TOKEN_FACTOR)
export const [
    clientOne,
    clientOneAccount,
    clientOnePrivateKey,
    clientOnePublicKey,
    clientOneIsED25519Type,
    clientTwo,
    clientTwoAccount,
    clientTwoPrivateKey,
    clientTwoPublicKey,
    clientTwoIsED25519Type,
] = initializeClients()
export const operatorClient = getOperatorClient(clientOne, clientTwo, clientId)
export const nonOperatorClient = getNonOperatorClient(
    clientOne,
    clientTwo,
    clientId
)
export const operatorAccount = getOperatorAccount(
    clientOneAccount,
    clientTwoAccount,
    clientId
)
export const nonOperatorAccount = getNonOperatorAccount(
    clientOneAccount,
    clientTwoAccount,
    clientId
)
export const operatorPriKey = getOperatorPrivateKey(
    clientOnePrivateKey,
    clientTwoPrivateKey,
    clientId
)
export const operatorPubKey = getOperatorPublicKey(
    clientOnePublicKey,
    clientTwoPublicKey,
    clientId
)
export const operatorIsE25519 = getOperatorE25519(
    clientOneIsED25519Type,
    clientTwoIsED25519Type,
    clientId
)
export const nonOperatorIsE25519 = getNonOperatorE25519(
    clientOneIsED25519Type,
    clientTwoIsED25519Type,
    clientId
)

export interface IContractIdMap {
    [key: string]: ContractId[]
}

export const regularfactory = 'REGULAR_FACTORY'
export const regularfactoryplus100000 = 'REGULAR_FACTORY_PLUS_100000'

export const buildDeployedContracts = () => {
    const deployedContracts: IContractIdMap = {}
    deployedContracts[regularfactory] = []
    deployedContracts[regularfactoryplus100000] = []
    return deployedContracts
}

export const deployRegularFactory = async (
    deployedContracts: IContractIdMap
) => {
    const [result] = await Promise.all([
        deployContractsWithSDK({
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        }),
    ])
    result.forEach((contractId) =>
        deployedContracts[regularfactory].push(contractId)
    )
}
export const deployRegularFactoryPlus100000 = async (
    deployedContracts: IContractIdMap
) => {
    const [result] = await Promise.all([
        deployContractsWithSDK({
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
        }),
    ])
    result.forEach((contractId) =>
        deployedContracts[regularfactoryplus100000].push(contractId)
    )
}
