import axios from 'axios'
import { NetworkName } from '@configuration'
import { ADDRESS_ZERO } from './constants'
import { delay } from '@scripts'
import { configuration } from '@hardhat-configuration'

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
    return Promise.all(addressList.map((address) => addresstoHederaId({ address, network })))
}

export async function addresstoHederaId({
    address: address,
    network,
}: {
    address: string
    network: NetworkName
}): Promise<string> {
    if (address === ADDRESS_ZERO) {
        return '0.0.0'
    }

    const url = `accounts/${address}`
    const res = await getFromMirrorNode<IAccount>({
        url,
        network,
    })
    if (!res) {
        throw new Error(`Error retrieving account information for ${address}`)
    }
    return res.account
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
