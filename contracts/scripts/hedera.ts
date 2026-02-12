import axios from 'axios'
import { ContractId } from '@hiero-ledger/sdk'
import { NetworkName } from '@configuration'
import { configuration } from '@hardhat-configuration'
import { ADDRESS_ZERO, delay } from '@scripts'

interface IAccount {
    evm_address: string
    key: IKey
    account: string
}

interface IKey {
    _type: string
    key: string
}

export async function addressListToHederaIdList({
    addressList,
    network,
}: {
    addressList: string[]
    network: NetworkName
}): Promise<string[]> {
    return Promise.all(addressList.map((address) => addressToHederaId({ address, network })))
}
export async function addressToHederaId({
    address,
    network,
}: {
    address: string
    network: NetworkName
}): Promise<string> {
    if (address === ADDRESS_ZERO) {
        return '0.0.0'
    }

    // If EVM pure address, fetch account info from mirror node
    if (!address.startsWith('0x0000')) {
        const res = await getFromMirrorNode<IAccount>({
            url: `accounts/${address}`,
            network,
        })
        if (!res) {
            throw new Error(`Error retrieving account information for ${address}`)
        }
        return res.account
    }

    // If generated EVM address (alias), convert to Hedera ContractId
    return ContractId.fromEvmAddress(0, 0, address).toString()
}

async function getFromMirrorNode<T>({
    url,
    network,
    timeBetweenRetries = 1,
    timeout = 10,
}: {
    url: string
    network: NetworkName
    timeBetweenRetries?: number
    timeout?: number
}): Promise<T | undefined> {
    const mirrorUrl = `${configuration.endpoints[network].mirror}/api/v1/${url.startsWith('/') ? url.slice(1) : url}`
    let timePassed = 0
    while (timePassed <= timeout) {
        try {
            const res = await axios.get<T>(mirrorUrl)
            if (res.status === 200) {
                return res.data
            }
        } catch (error) {
            console.error(`Error retrieving data from Mirror Node: ${(error as Error).message}`)
        }
        await delay({ time: timeBetweenRetries, unit: 'seconds' })
        timePassed += timeBetweenRetries
    }
    return undefined
}
