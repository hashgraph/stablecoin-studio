/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    deployFactory as dp,
    deployHederaTokenManager,
    getOperatorAccount,
    getOperatorE25519,
    getOperatorPrivateKey,
    initializeClients,
    toHashgraphKey,
} from './deploy'

import { clientId, getClient, getContractInfo, toEvmAddress } from './utils'

export const deployFactory = async () => {
    const [
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

    const operatorAccount = getOperatorAccount(
        clientOneAccount,
        clientTwoAccount,
        clientId
    )
    const operatorPriKey = getOperatorPrivateKey(
        clientOnePrivateKey,
        clientTwoPrivateKey,
        clientId
    )
    const operatorIsE25519 = getOperatorE25519(
        clientOneIsED25519Type,
        clientTwoIsED25519Type,
        clientId
    )
    // Deploy Token using Client
    const clientSdk = getClient()
    clientSdk.setOperator(
        operatorAccount,
        toHashgraphKey(operatorPriKey, operatorIsE25519)
    )
    const resultTokenManager = await deployHederaTokenManager(
        clientSdk,
        operatorPriKey
    )
    const initializeFactory = {
        admin: await toEvmAddress(operatorAccount, operatorIsE25519),
        tokenManager: (await getContractInfo(resultTokenManager.toString()))
            .evm_address,
    }
    const result = await dp(
        initializeFactory,
        clientSdk,
        operatorPriKey,
        operatorIsE25519
    )

    const tokenManager = resultTokenManager
    const proxyAddress = result[0]
    const proxyAdminAddress = result[1]
    const factoryAddress = result[2]
    console.log(
        '\nProxy Address: \t',
        proxyAddress.toString(),
        '\nProxy Admin Address: \t',
        proxyAdminAddress.toString(),
        '\nFactory Address: \t',
        factoryAddress.toString(),
        '\nHederaTokenManager Address: \t',
        tokenManager.toString()
    )
}
