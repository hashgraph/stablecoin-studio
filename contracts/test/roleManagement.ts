import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import {
    deployContractsWithSDK,
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
} from '../scripts/deploy'
import {
    grantRoles,
    revokeRoles,
    getRoles,
    getAccountsForRole,
    getSupplierAllowance,
    isUnlimitedSupplierAllowance,
} from '../scripts/contractsMethods'
import {
    BURN_ROLE,
    PAUSE_ROLE,
    RESCUE_ROLE,
    WIPE_ROLE,
    CASHIN_ROLE,
    FREEZE_ROLE,
    DELETE_ROLE,
    WITHOUT_ROLE,
    DEFAULT_ADMIN_ROLE,
    KYC_ROLE,
    RolesId,
    ADDRESS_1,
    ADDRESS_2,
    ADDRESS_3,
    ADDRESS_4,
    ADDRESS_5,
    ADDRESS_6,
    ADDRESS_7,
    ADDRESS_8,
    ADDRESS_9,
    ADDRESS_10,
} from '../scripts/constants'

import { clientId, toEvmAddress } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'
const AllAccounts = [
    ADDRESS_1,
    ADDRESS_2,
    ADDRESS_3,
    ADDRESS_4,
    ADDRESS_5,
    ADDRESS_6,
    ADDRESS_7,
    ADDRESS_8,
    ADDRESS_9,
    ADDRESS_10,
]

describe('Role Management Tests', function () {
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

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: TokenDecimals,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
        })

        proxyAddress = result[0]
    })

    it('Non Admin Cannot grant or revoke roles', async function () {
        // Granting roles with non Admin
        const Roles = [BURN_ROLE, FREEZE_ROLE]
        const amounts: BigNumber[] = []
        const areE25519: boolean[] = []
        AllAccounts.forEach((accountToGrantRolesTo, index) => {
            areE25519.push(true)
        })

        await expect(
            grantRoles(
                Roles,
                proxyAddress,
                nonOperatorClient,
                AllAccounts,
                amounts,
                areE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Granting roles with admin
        await grantRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            amounts,
            areE25519
        )

        // Revoking roles with non admin
        await expect(
            revokeRoles(
                Roles,
                proxyAddress,
                nonOperatorClient,
                AllAccounts,
                areE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Revoking roles with admin
        await revokeRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            areE25519
        )
    })

    it('Admin Cannot grant CashIn role without allowances', async function () {
        // Granting roles with cash in but without allowances
        const Roles = [CASHIN_ROLE]
        const amounts: BigNumber[] = []
        const areE25519: boolean[] = []
        AllAccounts.forEach((accountToGrantRolesTo, index) => {
            areE25519.push(true)
        })

        await expect(
            grantRoles(
                Roles,
                proxyAddress,
                operatorClient,
                AllAccounts,
                amounts,
                areE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Admin grants and revokes roles to multiple accounts including CashIn role', async function () {
        // Checking roles
        for (let i = 0; i < AllAccounts.length; i++) {
            const result = await getRoles(
                proxyAddress,
                operatorClient,
                AllAccounts[i],
                true
            )

            result.forEach((role: string) => {
                expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase())
            })
        }

        // Granting roles
        const Roles = [
            BURN_ROLE,
            PAUSE_ROLE,
            RESCUE_ROLE,
            WIPE_ROLE,
            CASHIN_ROLE,
            FREEZE_ROLE,
            DELETE_ROLE,
            DEFAULT_ADMIN_ROLE,
            KYC_ROLE,
        ]
        const amounts: BigNumber[] = []
        const areE25519: boolean[] = []

        for (let i = 0; i < AllAccounts.length; i++) {
            amounts.push(BigNumber.from(i))
            areE25519.push(true)
        }

        await grantRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            amounts,
            areE25519
        )

        // Checking roles and cash in allowances
        for (let i = 0; i < AllAccounts.length; i++) {
            const result = await getRoles(
                proxyAddress,
                operatorClient,
                AllAccounts[i],
                true
            )

            for (let i = 0; i < result.length; i++) {
                if (i == RolesId.Cashin)
                    expect(result[i].toUpperCase()).to.equals(
                        CASHIN_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Burn)
                    expect(result[i].toUpperCase()).to.equals(
                        BURN_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Delete)
                    expect(result[i].toUpperCase()).to.equals(
                        DELETE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Freeze)
                    expect(result[i].toUpperCase()).to.equals(
                        FREEZE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Wipe)
                    expect(result[i].toUpperCase()).to.equals(
                        WIPE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Rescue)
                    expect(result[i].toUpperCase()).to.equals(
                        RESCUE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Pause)
                    expect(result[i].toUpperCase()).to.equals(
                        PAUSE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Kyc)
                    expect(result[i].toUpperCase()).to.equals(
                        KYC_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Admin)
                    expect(result[i].toUpperCase()).to.equals(
                        DEFAULT_ADMIN_ROLE.toUpperCase()
                    )
                else
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
            }

            const allowance = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                AllAccounts[i],
                true
            )

            expect(allowance.toString()).to.eq(i.toString())

            const isUnlimited = await isUnlimitedSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                AllAccounts[i],
                true
            )

            expect(isUnlimited).to.eq(i == 0)
        }

        // Revoking roles
        await revokeRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            areE25519
        )

        // Checking roles and cash in allowances
        for (let i = 0; i < AllAccounts.length; i++) {
            const result = await getRoles(
                proxyAddress,
                operatorClient,
                AllAccounts[i],
                true
            )

            for (let i = 0; i < result.length; i++) {
                if (i == RolesId.Cashin)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Burn)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Delete)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Freeze)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Wipe)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Rescue)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Pause)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Kyc)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Admin)
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else
                    expect(result[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
            }

            const allowance = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                AllAccounts[i],
                true
            )

            expect(allowance.toString()).to.eq('0')

            const isUnlimited = await isUnlimitedSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                AllAccounts[i],
                true
            )

            expect(isUnlimited).to.eq(false)
        }
    })

    it('An account can get all roles of any account', async function () {
        // Granting roles
        const Roles = [
            BURN_ROLE,
            PAUSE_ROLE,
            RESCUE_ROLE,
            WIPE_ROLE,
            CASHIN_ROLE,
            FREEZE_ROLE,
            DELETE_ROLE,
            DEFAULT_ADMIN_ROLE,
            KYC_ROLE,
        ]
        const amounts: BigNumber[] = []
        const areE25519: boolean[] = []

        for (let i = 0; i < AllAccounts.length; i++) {
            amounts.push(BigNumber.from(i))
            areE25519.push(true)
        }

        await grantRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            amounts,
            areE25519
        )

        let burnRoleAccounts = await getAccountsForRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(burnRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let pauseRoleAccounts = await getAccountsForRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(pauseRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let rescueRoleAccounts = await getAccountsForRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(rescueRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let wipeRoleAccounts = await getAccountsForRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(wipeRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let cashinRoleAccounts = await getAccountsForRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(cashinRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let freezeRoleAccounts = await getAccountsForRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(freezeRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let deleteRoleAccounts = await getAccountsForRole(
            DELETE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(deleteRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let defaultAdminRoleAccounts = await getAccountsForRole(
            DEFAULT_ADMIN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(defaultAdminRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        let kycRoleAccounts = await getAccountsForRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(kycRoleAccounts).to.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        // Revoking roles
        await revokeRoles(
            Roles,
            proxyAddress,
            operatorClient,
            AllAccounts,
            areE25519
        )

        burnRoleAccounts = await getAccountsForRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(burnRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        pauseRoleAccounts = await getAccountsForRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(pauseRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        rescueRoleAccounts = await getAccountsForRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(rescueRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        wipeRoleAccounts = await getAccountsForRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(wipeRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        cashinRoleAccounts = await getAccountsForRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(cashinRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        freezeRoleAccounts = await getAccountsForRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(freezeRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        deleteRoleAccounts = await getAccountsForRole(
            DELETE_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(deleteRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        defaultAdminRoleAccounts = await getAccountsForRole(
            DEFAULT_ADMIN_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(defaultAdminRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })

        kycRoleAccounts = await getAccountsForRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient
        )

        AllAccounts.forEach(async (accountId, index) => {
            expect(kycRoleAccounts).to.not.include(
                await toEvmAddress(accountId, areE25519[index])
            )
        })
    })
})
