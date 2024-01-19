/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Client,
    ContractCreateFlow,
    ContractFunctionParameters,
    ContractId,
    PrivateKey,
} from '@hashgraph/sdk'
import {
    ProxyAdmin__factory,
    TransparentUpgradeableProxy__factory,
} from '../../typechain-types'
import { contractCall } from './utils'

const GasContractInitialize = 130000

export async function deployContract(
    factory: any,
    privateKey: string,
    clientOperator: Client,
    constructorParameters?: any,
    contractMemo?: string
): Promise<ContractId> {
    const transaction = new ContractCreateFlow()
        .setBytecode(factory.bytecode)
        .setGas(500_000)
    //.setAdminKey(Key)
    if (contractMemo) {
        transaction.setContractMemo(contractMemo)
    }
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
        throw Error('Error deploying contract')
    }
    console.log(
        ` ${
            factory.name
        } - contractId ${contractId} -contractId ${contractId?.toSolidityAddress()}   `
    )
    return contractId
}

//TODO: this function is not used
export async function deployUpgradableContract(
    factory: any,
    clientOperator: Client,
    privateKeyOperator: string,
    init_params?: any[]
): Promise<ContractId[]> {
    console.log(`Deploying proxy admin. please wait...`)

    const ProxyAdmin = await deployContract(
        ProxyAdmin__factory,
        privateKeyOperator,
        clientOperator
    )

    console.log(`Deploying logic. please wait...`)

    const Logic = await deployContract(
        factory,
        privateKeyOperator,
        clientOperator
    )

    console.log(`Deploying proxy. please wait...`)

    const params = new ContractFunctionParameters()
        .addAddress(Logic.toSolidityAddress())
        .addAddress(ProxyAdmin.toSolidityAddress())
        .addBytes(new Uint8Array([]))

    const Proxy = await deployContract(
        TransparentUpgradeableProxy__factory,
        privateKeyOperator,
        clientOperator,
        params
    )

    if (init_params) {
        console.log(`Initializing the proxy. please wait...`)

        await contractCall(
            Proxy,
            'initialize',
            init_params,
            clientOperator,
            GasContractInitialize,
            factory.abi
        )
    }

    return [Proxy, ProxyAdmin, Logic]
}
