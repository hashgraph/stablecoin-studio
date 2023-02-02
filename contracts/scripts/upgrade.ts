import { validateUpgrade } from '../scripts/hederaUpgrades'
import { ContractFactory as HContractFactory } from '@hashgraph/hethers'
import {
    HederaReserve__factory,
    HederaReserve_2__factory,
} from '../typechain-types'

export async function checkHederaReserveUpgradability(): Promise<void> {
    console.log(`Checking upgrade compatibility. please wait...`)

    await validateUpgrade(
        createHContractFactory(HederaReserve__factory),
        createHContractFactory(HederaReserve_2__factory)
    )
}

function createHContractFactory(factory: any): HContractFactory {
    return new HContractFactory(factory.createInterface(), factory.bytecode)
}
