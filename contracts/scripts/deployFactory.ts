/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    initializeClients,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    toHashgraphKey,
    deployFactory as dp,
    deployHederaERC20,
} from './deploy'

import { getClient, clientId } from './utils'

export const deployFactory = async () => {
    const [
        client1,
        client1account,
        client1privatekey,
        client1publickey,
        client1isED25519Type,
        client2,
        client2account,
        client2privatekey,
        client2publickey,
        client2isED25519Type,
    ] = initializeClients()

    const operatorAccount = getOperatorAccount(
        client1account,
        client2account,
        clientId
    )
    const operatorPriKey = getOperatorPrivateKey(
        client1privatekey,
        client2privatekey,
        clientId
    )
    const operatorIsE25519 = getOperatorE25519(
        client1isED25519Type,
        client2isED25519Type,
        clientId
    )
    // Deploy Token using Client
    const clientSdk = getClient()
    clientSdk.setOperator(
        operatorAccount,
        toHashgraphKey(operatorPriKey, operatorIsE25519)
    )

    const resultErc20 = await deployHederaERC20(clientSdk, operatorPriKey)
    const result = await dp(clientSdk, operatorPriKey)

    const erc20 = resultErc20
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
        '\nHederaERC20 Address: \t',
        erc20.toString()
    )
}
