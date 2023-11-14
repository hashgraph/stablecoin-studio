import { BigNumber } from 'ethers'
import {
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

export const TOKEN_DECIMALS = 6
export const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
export const TOKEN_NAME = 'MIDAS'
export const TOKEN_SYMBOL = 'MD'
export const TOKEN_FACTOR = BigNumber.from(10).pow(TOKEN_DECIMALS)
export const INIT_SUPPLY = BigNumber.from(100).mul(TOKEN_FACTOR)
export const MAX_SUPPLY = BigNumber.from(1000).mul(TOKEN_FACTOR)

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
