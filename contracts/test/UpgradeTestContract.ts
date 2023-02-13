import { BigNumber } from 'ethers'
import {
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
    deployUpgradeTestContract,
} from '../scripts/deploy'
import { clientId } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    upgradeContract,
    rollBackContract,
} from '../scripts/contractsLifeCycle/upgrade'
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

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let hederaReserveAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenFactor = BigNumber.from(10).pow(3)
const reserve = BigNumber.from('100').mul(TokenFactor)

describe('UpgradeTestContract Tests', function () {
    before(async function () {
        // Generate Client 1 and Client 2

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

        operatorClient = getOperatorClient(client1, client2, clientId)
        nonOperatorClient = getNonOperatorClient(client1, client2, clientId)
        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        nonOperatorAccount = getNonOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )
        nonOperatorIsE25519 = getNonOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        const result = await deployUpgradeTestContract(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        hederaReserveAddress = result[2]
    })

    it('CORRECT 1 1', async function () {
        await checkUpgradeTestContractUpgradability_Correct_1_1()
    })

    it('CORRECT 1 2', async function () {
        await checkUpgradeTestContractUpgradability_Correct_1_2()
    })

    it('CORRECT 1 3', async function () {
        await checkUpgradeTestContractUpgradability_Correct_1_3()
    })

    it('CORRECT 2', async function () {
        await checkUpgradeTestContractUpgradability_Correct_2()
    })

    it('CORRECT 3', async function () {
        await checkUpgradeTestContractUpgradability_Correct_3()
    })

    it('CORRECT 4', async function () {
        await checkUpgradeTestContractUpgradability_Correct_4()
    })

    it('CORRECT 5', async function () {
        await checkUpgradeTestContractUpgradability_Correct_5()
    })

    it('CORRECT 6', async function () {
        await checkUpgradeTestContractUpgradability_Correct_6()
    })

    it('CORRECT 7', async function () {
        await checkUpgradeTestContractUpgradability_Correct_7()
    })

    it('WRONG 1', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_1()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })

    it('WRONG 2', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_2()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })

    it('WRONG 3', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_3()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })

    it('WRONG 4', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_4()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })

    it('WRONG 5', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_5()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })

    it('WRONG 6', async function () {
        let failed = false
        try {
            await checkUpgradeTestContractUpgradability_Wrong_6()
        } catch (e) {
            console.log(e)
            failed = true
        }
        expect(failed).to.be.true
    })
})

async function checkUpgradeTestContractUpgradability_Correct_1_1(): Promise<void> {
    console.log(`Upgrading for Correct 1. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Correct_1__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_1_2(): Promise<void> {
    console.log(
        `Checking upgrade compatibility for Correct 1 (2). please wait...`
    )

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Correct_2__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_1_3(): Promise<void> {
    console.log(
        `Checking upgrade compatibility for Correct 1 (3). please wait...`
    )

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Correct_3__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_2(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 2. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_1__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_3(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 3. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_2__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_4(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 4. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_3__factory,
        {
            unsafeAllowRenames: true,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_5(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 5. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_4__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_6(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 6. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_5__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Correct_7(): Promise<void> {
    console.log(`Checking upgrade compatibility for Correct 7. please wait...`)

    const newImpl = await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_6__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: true,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )

    // Rolling Back test
    console.log(`Rolling back. please wait...`)

    await rollBackContract(
        hederaReserveAddress.toSolidityAddress(),
        newImpl.toSolidityAddress(),
        operatorClient,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_1(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 1. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_1__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_2(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 2. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_2__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_3(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 3. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_3__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_4(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 4. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_4__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_5(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 5. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_5__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}

async function checkUpgradeTestContractUpgradability_Wrong_6(): Promise<void> {
    console.log(`Checking upgrade compatibility for Wrong 6. please wait...`)

    await upgradeContract(
        UpgradeTestContract__factory,
        UpgradeTestContract_Wrong_6__factory,
        {
            unsafeAllowRenames: false,
            unsafeSkipStorageCheck: false,
            kind: 'transparent',
        },
        operatorClient,
        operatorPriKey,
        proxyAdminAddress,
        proxyAddress.toSolidityAddress().toString()
    )
}
