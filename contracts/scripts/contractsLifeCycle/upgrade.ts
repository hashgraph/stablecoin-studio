import { upgrades } from 'hardhat'
import { Client, ContractId } from '@hashgraph/sdk'
import { deployContract } from './deploy'
import { ValidationOptions } from '@openzeppelin/upgrades-core'
import { ProxyAdmin__factory } from '../../typechain-types'
import { contractCall, createContractFactory } from './utils'

const GasUpgrade = 1800000

export async function validateUpgrade(
    oldImpl__factory: any,
    newImpl__factory: any,
    opts: ValidationOptions = {}
) {
    console.log(
        `Checking upgrade compatibility between ${oldImpl__factory.name} and ${newImpl__factory.name}. please wait...`
    )

    await upgrades.validateUpgrade(
        createContractFactory(oldImpl__factory),
        createContractFactory(newImpl__factory),
        opts
    )

    console.log('Validation OK')
}

export async function upgradeContract(
    oldImpl__factory: any,
    newImpl__factory: any,
    opts: ValidationOptions = {},
    clientOperator: Client,
    privateKey: string,
    proxyAdminAddress: ContractId,
    proxyAddress: string,
    data?: any,
    call = false,
    checkUpgradeValidity = true
) {
    if (checkUpgradeValidity) {
        // checking new implementation compatibility
        await validateUpgrade(oldImpl__factory, newImpl__factory, opts)
    }

    // Deploying new implementation
    console.log(
        `Deploying New ${newImpl__factory.name} Implementation. please wait...`
    )

    const newImpl = await deployContract(
        newImpl__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `New ${
            newImpl__factory.name
        } Implementation deployed ${newImpl.toSolidityAddress()}`
    )

    // Upgrading transparent proxy contract
    if (call)
        await upgradeAndCallTransparentProxy(
            proxyAdminAddress,
            clientOperator,
            newImpl.toSolidityAddress().toString(),
            proxyAddress,
            GasUpgrade,
            data
        )
    else
        await upgradeTransparentProxy(
            proxyAdminAddress,
            clientOperator,
            newImpl.toSolidityAddress().toString(),
            proxyAddress,
            GasUpgrade
        )

    return newImpl
}

export async function rollBackContract(
    oldImpl__address: string,
    newImpl__address: string,
    clientOperator: Client,
    proxyAdminAddress: ContractId,
    proxyAddress: string
) {
    console.log(`Rolling back from ${newImpl__address}
        to ${oldImpl__address} for Transparent proxy ${proxyAddress} 
        using proxy Admin ${proxyAdminAddress.toSolidityAddress()}.
         please wait...`)

    await upgradeTransparentProxy(
        proxyAdminAddress,
        clientOperator,
        oldImpl__address,
        proxyAddress,
        GasUpgrade
    )

    console.log('Roll-back completed')
}

async function upgradeTransparentProxy(
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string,
    gas: number
) {
    console.log(`Upgrading Transparent Proxy ${proxyAddress}
        implementation to ${newImplementationContract} 
        using proxy Admin ${proxyAdminAddress.toSolidityAddress()}. 
        please wait...`)

    const params = [proxyAddress, newImplementationContract]

    await contractCall(
        proxyAdminAddress,
        'upgrade',
        params,
        client,
        gas,
        ProxyAdmin__factory.abi
    )

    console.log('Upgrade OK')
}

async function upgradeAndCallTransparentProxy(
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string,
    gas: number,
    data: any
) {
    console.log(`Upgrading and Calling Transparent Proxy ${proxyAddress}
        implementation to ${newImplementationContract} with data ${JSON.stringify(
        data
    )} 
        using proxy Admin ${proxyAdminAddress.toSolidityAddress()}. 
        please wait...`)

    const params = [proxyAddress, newImplementationContract, data]
    await contractCall(
        proxyAdminAddress,
        'upgradeAndCall',
        params,
        client,
        gas,
        ProxyAdmin__factory.abi
    )

    console.log('Upgrade and call OK')
}
