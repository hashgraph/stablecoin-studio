/* eslint-disable @typescript-eslint/no-unused-vars */
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import {
    getAccountsForRole,
    getRoles,
    getSupplierAllowance,
    grantRoles,
    isUnlimitedSupplierAllowance,
    revokeRoles,
} from '../scripts/contractsMethods'
import {
    ACCOUNT_EIGHT,
    ACCOUNT_FIVE,
    ACCOUNT_FOUR,
    ACCOUNT_NINE,
    ACCOUNT_ONE,
    ACCOUNT_SEVEN,
    ACCOUNT_SIX,
    ACCOUNT_TEN,
    ACCOUNT_THREE,
    ACCOUNT_TWO,
    BURN_ROLE,
    CASHIN_ROLE,
    DEFAULT_ADMIN_ROLE,
    DELETE_ROLE,
    FREEZE_ROLE,
    KYC_ROLE,
    PAUSE_ROLE,
    RESCUE_ROLE,
    RolesId,
    WIPE_ROLE,
    WITHOUT_ROLE,
} from '../scripts/constants'

import { toEvmAddress } from '../scripts/utils'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    nonOperatorClient,
    operatorClient,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect
const ACCOUNTS = [
    ACCOUNT_ONE,
    ACCOUNT_TWO,
    ACCOUNT_THREE,
    ACCOUNT_FOUR,
    ACCOUNT_FIVE,
    ACCOUNT_SIX,
    ACCOUNT_SEVEN,
    ACCOUNT_EIGHT,
    ACCOUNT_NINE,
    ACCOUNT_TEN,
]
let proxyAddress: ContractId

export const roleManagement = (proxyAddresses: ContractId[]) => {
    describe('Role Management Tests', function () {
        before(async function () {
            proxyAddress = proxyAddresses[0]
        })

        it('Non Admin Cannot grant or revoke roles', async function () {
            // Granting roles with non Admin
            const Roles = [BURN_ROLE, FREEZE_ROLE]
            const amounts: BigNumber[] = []
            const areE25519: boolean[] = []
            ACCOUNTS.forEach(() => {
                areE25519.push(true)
            })

            await expect(
                grantRoles(
                    Roles,
                    proxyAddress,
                    nonOperatorClient,
                    ACCOUNTS,
                    amounts,
                    areE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Granting roles with admin
            await grantRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                amounts,
                areE25519
            )

            // Revoking roles with non admin
            await expect(
                revokeRoles(
                    Roles,
                    proxyAddress,
                    nonOperatorClient,
                    ACCOUNTS,
                    areE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Revoking roles with admin
            await revokeRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                areE25519
            )
        })

        it('Admin Cannot grant CashIn role without allowances', async function () {
            // Granting roles with cash in but without allowances
            const Roles = [CASHIN_ROLE]
            const amounts: BigNumber[] = []
            const areE25519: boolean[] = []
            ACCOUNTS.forEach(() => {
                areE25519.push(true)
            })

            await expect(
                grantRoles(
                    Roles,
                    proxyAddress,
                    operatorClient,
                    ACCOUNTS,
                    amounts,
                    areE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Admin grants and revokes roles to multiple accounts including CashIn role', async function () {
            // Checking roles
            for (let i = 0; i < ACCOUNTS.length; i++) {
                const result = await getRoles(
                    proxyAddress,
                    operatorClient,
                    ACCOUNTS[i],
                    true
                )

                result.forEach((role: string) => {
                    expect(role.toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
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

            for (let i = 0; i < ACCOUNTS.length; i++) {
                amounts.push(BigNumber.from(i))
                areE25519.push(true)
            }

            await grantRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                amounts,
                areE25519
            )

            // Checking roles and cash in allowances
            for (
                let accountIndex = 0;
                accountIndex < ACCOUNTS.length;
                accountIndex++
            ) {
                const result = await getRoles(
                    proxyAddress,
                    operatorClient,
                    ACCOUNTS[accountIndex],
                    true
                )

                for (
                    let roleIndex = 0;
                    roleIndex < result.length;
                    roleIndex++
                ) {
                    if (roleIndex == RolesId.Cashin)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            CASHIN_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Burn)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            BURN_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Delete)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            DELETE_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Freeze)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            FREEZE_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Wipe)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            WIPE_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Rescue)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            RESCUE_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Pause)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            PAUSE_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Kyc)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            KYC_ROLE.toUpperCase()
                        )
                    else if (roleIndex == RolesId.Admin)
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            DEFAULT_ADMIN_ROLE.toUpperCase()
                        )
                    else
                        expect(result[roleIndex].toUpperCase()).to.equals(
                            WITHOUT_ROLE.toUpperCase()
                        )
                }

                const allowance = await getSupplierAllowance(
                    proxyAddress,
                    nonOperatorClient,
                    ACCOUNTS[accountIndex],
                    true
                )

                expect(allowance.toString()).to.eq(accountIndex.toString())

                const isUnlimited = await isUnlimitedSupplierAllowance(
                    proxyAddress,
                    nonOperatorClient,
                    ACCOUNTS[accountIndex],
                    true
                )

                expect(isUnlimited).to.eq(accountIndex == 0)
            }

            // Revoking roles
            await revokeRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                areE25519
            )

            // Checking roles and cash in allowances
            for (let i = 0; i < ACCOUNTS.length; i++) {
                const result = await getRoles(
                    proxyAddress,
                    operatorClient,
                    ACCOUNTS[i],
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
                    ACCOUNTS[i],
                    true
                )

                expect(allowance.toString()).to.eq('0')

                const isUnlimited = await isUnlimitedSupplierAllowance(
                    proxyAddress,
                    nonOperatorClient,
                    ACCOUNTS[i],
                    true
                )

                expect(isUnlimited).to.eq(false)
            }
        })

        it('An account can get all roles of any account', async function () {
            // Granting roles
            const Roles = [BURN_ROLE]
            const areE25519: boolean[] = []

            for (let i = 0; i < ACCOUNTS.length; i++) {
                areE25519.push(true)
            }

            await grantRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                [],
                areE25519
            )

            let burnRoleAccounts = await getAccountsForRole(
                BURN_ROLE,
                proxyAddress,
                operatorClient
            )

            for (const accountId of ACCOUNTS) {
                const index = ACCOUNTS.indexOf(accountId)
                expect(burnRoleAccounts).to.include(
                    await toEvmAddress(accountId, areE25519[index])
                )
            }

            // Revoking roles
            await revokeRoles(
                Roles,
                proxyAddress,
                operatorClient,
                ACCOUNTS,
                areE25519
            )

            burnRoleAccounts = await getAccountsForRole(
                BURN_ROLE,
                proxyAddress,
                operatorClient
            )

            for (const accountId of ACCOUNTS) {
                const index = ACCOUNTS.indexOf(accountId)
                expect(burnRoleAccounts).to.not.include(
                    await toEvmAddress(accountId, areE25519[index])
                )
            }
        })
    })
}
