/* eslint-disable @typescript-eslint/no-explicit-any */
import { upgrades } from 'hardhat'
import { Client, ContractId, AccountId } from '@hashgraph/sdk'
import { deployContract } from './deploy'
import { ValidationOptions } from '@openzeppelin/upgrades-core'
import { ProxyAdmin__factory } from '../../typechain-types'
import { contractCall } from './utils'
import { ContractFactory, utils } from 'ethers'
import { GAS_LIMIT_TINY } from '../constants'
import axios from 'axios'
import { upgrade } from '../contractsMethods'

export async function validateUpgrade(
    oldImpl__bytecode: string,
    oldImpl__abi: any,
    newImpl__bytecode: string,
    newImpl__abi: any,
    opts: ValidationOptions = {}
) {
    console.log(`Checking upgrade compatibility. please wait...`)

    await upgrades.validateUpgrade(
        createContractFactory(oldImpl__abi, oldImpl__bytecode),
        createContractFactory(newImpl__abi, newImpl__bytecode),
        opts
    )

    console.log('Validation OK')
}

export async function upgradeContract(
    oldImpl__abi: any,
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
        const instance = axios.create({
            validateStatus: function (status: number) {
                return (status >= 200 && status < 300) || status == 404
            },
        })

        // checking new implementation compatibility
        const params = [proxyAddress]

        const result = await contractCall(
            proxyAdminAddress,
            'getProxyImplementation',
            params,
            clientOperator,
            GAS_LIMIT_TINY,
            ProxyAdmin__factory.abi
        )

        const url =
            'https://testnet.mirrornode.hedera.com/api/v1/contracts/' +
            AccountId.fromSolidityAddress(result[0]).toString()

        const response = await instance.get<any>(url)

        await validateUpgrade(
            response.data.bytecode,
            oldImpl__abi,
            newImpl__factory.bytecode,
            newImpl__factory.abi,
            opts
        )
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
            ProxyAdmin__factory.abi,
            proxyAdminAddress,
            clientOperator,
            newImpl.toSolidityAddress().toString(),
            proxyAddress,
            data
        )
    else
        await upgradeTransparentProxy(
            ProxyAdmin__factory.abi,
            proxyAdminAddress,
            clientOperator,
            newImpl.toSolidityAddress().toString(),
            proxyAddress
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
        ProxyAdmin__factory.abi,
        proxyAdminAddress,
        clientOperator,
        oldImpl__address,
        proxyAddress
    )

    console.log('Roll-back completed')
}

async function upgradeTransparentProxy(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string
) {
    console.log(`Upgrading Transparent Proxy ${proxyAddress}
        implementation to ${newImplementationContract} 
        using proxy Admin ${proxyAdminAddress.toSolidityAddress()}. 
        please wait...`)

    await upgrade(
        proxyAdminAbi,
        proxyAdminAddress,
        client,
        newImplementationContract,
        proxyAddress
    )

    console.log('Upgrade OK')
}

async function upgradeAndCallTransparentProxy(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string,
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
        1800000,
        proxyAdminAbi
    )

    console.log('Upgrade and call OK')
}

function createContractFactory(abi: string, byteCode: string) {
    return new ContractFactory(new utils.Interface(abi), byteCode)
}
