import { validateUpgrade } from '../scripts/hederaUpgrades'
import { ContractFactory as HContractFactory } from '@hashgraph/hethers'
import {
    UpgradeTestContract__factory,
    UpgradeTestContract_Wrong_1__factory,
    UpgradeTestContract_Wrong_2__factory,
    UpgradeTestContract_Wrong_3__factory,
    UpgradeTestContract_Wrong_4__factory,
    UpgradeTestContract_Wrong_5__factory,
    UpgradeTestContract_Wrong_6__factory,
    UpgradeTestContract_Correct_1__factory,
    UpgradeTestContract_Correct_2__factory,
    UpgradeTestContract_Correct_3__factory,

} from '../typechain-types'

export async function checkUpgradeTestContractUpgradability_Correct_1_1(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 1. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Correct_1__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_1_2(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 1 (2). please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Correct_2__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_1_3(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 1 (3). please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Correct_3__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_2(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 2. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_1__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_3(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 3. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_2__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_4(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 4. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_3__factory),
        {
            unsafeAllowRenames: true,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_5(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 5. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_4__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_6(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 6. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_5__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Correct_7(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 7. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_6__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_1(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 1. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_1__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_2(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 2. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_2__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_3(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 3. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_3__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_4(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 4. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_4__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_5(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 5. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_5__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

export async function checkUpgradeTestContractUpgradability_Wrong_6(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 6. please wait...`)

    await validateUpgrade(
        createHContractFactory(UpgradeTestContract__factory),
        createHContractFactory(UpgradeTestContract_Wrong_6__factory),
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        }
    )
}

function createHContractFactory(factory: any): HContractFactory {
    return new HContractFactory(factory.createInterface(), factory.bytecode)
}
