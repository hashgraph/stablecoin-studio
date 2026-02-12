import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    RoleManagementFacet,
    RoleManagementFacet__factory,
    RolesFacet,
    RolesFacet__factory,
    SupplierAdminFacet,
    SupplierAdminFacet__factory,
} from '@contracts'
import {
    ADDRESS_ZERO,
    delay,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ROLES,
    UINT256_MAX,
    ValidateTxResponseCommand,
} from '@scripts'
import {
    deployStableCoinInTests,
    deployFullInfrastructureInTests,
    GAS_LIMIT,
    randomAccountAddressList,
} from '@test/shared'
import { toBigInt } from 'ethers'

describe('➡️ Role Management Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let rolesFacet: RolesFacet
    let roleManagementFacet: RoleManagementFacet
    let supplierAdminFacet: SupplierAdminFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress
    const randomAccountList = randomAccountAddressList(3)

    async function setFacets(address: string) {
        roleManagementFacet = RoleManagementFacet__factory.connect(address, operator)
        rolesFacet = RolesFacet__factory.connect(address, operator)
        supplierAdminFacet = SupplierAdminFacet__factory.connect(address, nonOperator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        ;({ stableCoinProxyAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: deployedContracts.businessLogicResolver.proxyAddress!,
            stableCoinFactoryProxyAddress: deployedContracts.stableCoinFactoryFacet.proxyAddress!,
        }))

        await setFacets(stableCoinProxyAddress)
    })

    it('Non operator cannot grant', async function () {
        // Check initial roles for random accounts
        for (const account of randomAccountList) {
            const hasBurnRole = rolesFacet.hasRole(ROLES.burn.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            const hasFreezeRole = rolesFacet.hasRole(ROLES.freeze.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            expect(await hasBurnRole).to.eq(false)
            expect(await hasFreezeRole).to.eq(false)
        }

        // Granting roles with non Admin should fail
        roleManagementFacet = roleManagementFacet.connect(nonOperator)
        await expect(
            roleManagementFacet.grantRoles([ROLES.burn.hash, ROLES.freeze.hash], randomAccountList, [], {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRoles,
            })
        )
            .to.be.revertedWithCustomError(roleManagementFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)

        // Check roles after failed grant
        for (const account of randomAccountList) {
            const hasBurnRole = rolesFacet.hasRole(ROLES.burn.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            const hasFreezeRole = rolesFacet.hasRole(ROLES.freeze.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            expect(await hasBurnRole).to.eq(false)
            expect(await hasFreezeRole).to.eq(false)
        }
    })

    it('Admin grants roles to multiple accounts including CashIn role', async function () {
        // Check initial roles for random accounts
        for (const account of randomAccountList) {
            const roleList = await rolesFacet.getRoles(account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
            })
            for (const role of roleList) {
                expect(role.toUpperCase()).to.eq(ROLES.withoutRole.hash.toUpperCase())
            }
        }
        // Grant roles
        const rolesToGrant = [
            ROLES.burn.hash,
            ROLES.pause.hash,
            ROLES.rescue.hash,
            ROLES.wipe.hash,
            ROLES.cashin.hash,
            ROLES.freeze.hash,
            ROLES.delete.hash,
            ROLES.defaultAdmin.hash,
            ROLES.kyc.hash,
            ROLES.customFees.hash,
            ROLES.hold.hash,
        ]
        roleManagementFacet = roleManagementFacet.connect(operator)
        const txResponse = await roleManagementFacet.grantRoles(
            rolesToGrant,
            randomAccountList,
            randomAccountList.map((_, index) => toBigInt(index + 1)),
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRoles,
            }
        )
        await new ValidateTxResponseCommand({ txResponse }).execute()
        await delay({ time: 1, unit: 'sec' })
        // Check roles and cash in allowances
        for (let accountIndex = 0; accountIndex < randomAccountList.length; accountIndex++) {
            const roles = await rolesFacet.getRoles(randomAccountList[accountIndex], {
                gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
            })
            for (const rol of roles) {
                expect(Array.from(rolesToGrant)).to.include(rol)
            }
            const allowance = await supplierAdminFacet.getSupplierAllowance(randomAccountList[accountIndex], {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })

            expect(allowance.toString()).to.eq((accountIndex + 1).toString())

            const isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(randomAccountList[accountIndex], {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
            expect(isUnlimited).to.eq(false)
        }
    })

    it('Non operator cannot revoke roles', async function () {
        // Check initial roles for random accounts
        for (const account of randomAccountList) {
            const hasBurnRole = rolesFacet.hasRole(ROLES.burn.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            const hasFreezeRole = rolesFacet.hasRole(ROLES.freeze.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            expect(await hasBurnRole).to.eq(true)
            expect(await hasFreezeRole).to.eq(true)
        }

        // Granting roles with non Admin should fail
        roleManagementFacet = roleManagementFacet.connect(nonOperator)
        await expect(
            roleManagementFacet.revokeRoles([ROLES.burn.hash, ROLES.freeze.hash], randomAccountList, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRoles,
            })
        )
            .to.be.revertedWithCustomError(roleManagementFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)

        await delay({ time: 2, unit: 'ms' })
        // Check roles after failed grant
        for (const account of randomAccountList) {
            const hasBurnRole = rolesFacet.hasRole(ROLES.burn.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            const hasFreezeRole = rolesFacet.hasRole(ROLES.freeze.hash, account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
            expect(await hasBurnRole).to.eq(true)
            expect(await hasFreezeRole).to.eq(true)
        }
    })

    it('Admin revokes roles from multiple accounts including CashIn role', async function () {
        const rolesToRevoke = [
            ROLES.burn.hash,
            ROLES.pause.hash,
            ROLES.rescue.hash,
            ROLES.wipe.hash,
            ROLES.cashin.hash,
            ROLES.freeze.hash,
            ROLES.delete.hash,
            ROLES.defaultAdmin.hash,
            ROLES.kyc.hash,
            ROLES.customFees.hash,
            ROLES.hold.hash,
        ]
        // Check initial roles for random accounts
        for (const account of randomAccountList) {
            const roleList = await rolesFacet.getRoles(account, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
            })
            for (const role of roleList) {
                expect(Array.from(rolesToRevoke)).to.include(role)
            }
        }

        // Revoke roles
        roleManagementFacet = roleManagementFacet.connect(operator)
        const txResponse = await roleManagementFacet.revokeRoles(rolesToRevoke, randomAccountList, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRoles,
        })
        await new ValidateTxResponseCommand({ txResponse }).execute()
        await delay({ time: 2, unit: 'ms' })
        // Check roles and cash in allowances
        await delay({ time: 1, unit: 'sec' })
        for (let i = 0; i < randomAccountList.length; i++) {
            const roles = await rolesFacet.getRoles(randomAccountList[i], {
                gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
            })
            for (const rol of roles) {
                expect(rol.toUpperCase()).to.eq(ROLES.withoutRole.hash.toUpperCase())
            }

            const allowance = await supplierAdminFacet.getSupplierAllowance(randomAccountList[i], {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
            expect(allowance.toString()).to.eq('0')

            const isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(randomAccountList[i], {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
            expect(isUnlimited).to.eq(false)
        }
    })

    it('Admin Cannot grant CashIn role without allowances', async function () {
        // Granting roles with cash in but without allowances
        const Roles = [ROLES.cashin.hash]
        const amounts: bigint[] = []

        await expect(
            roleManagementFacet.grantRoles(
                Roles,
                randomAccountList,
                amounts.map((_, index) => toBigInt(index)),
                {
                    gasLimit: GAS_LIMIT.hederaTokenManager.grantRoles,
                }
            )
        )
            .to.be.revertedWithCustomError(roleManagementFacet, 'ArraysLengthNotEqual')
            .withArgs(3, 0)
    })

    it('Can not revoke all admin role from a token', async function () {
        // Non operator has burn role
        const Admins = await rolesFacet.getAccountsWithRole(ROLES.defaultAdmin.hash, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getAccountsWithRole,
        })

        const adminAccounts: string[] = []

        for (let i = 0; i < Admins.length; i++) {
            adminAccounts.push(Admins[i])
        }

        await expect(
            roleManagementFacet.revokeRoles([ROLES.defaultAdmin.hash], adminAccounts, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRoles,
            })
        ).to.be.revertedWithCustomError(roleManagementFacet, 'NoAdminsLeft')
    })

    it('An account can get all roles of any account', async function () {
        // Grant roles
        const Roles = [ROLES.burn.hash]
        const grantRoles = await roleManagementFacet.grantRoles(Roles, randomAccountList, [], {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRoles,
        })
        await new ValidateTxResponseCommand({ txResponse: grantRoles }).execute()

        // Get roles
        const burnRoleAccounts = await rolesFacet.getAccountsWithRole(ROLES.burn.hash, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getAccountsWithRole,
        })
        for (const account of randomAccountList) {
            expect(burnRoleAccounts).to.include(account)
        }

        // Revoke roles
        const revokeRoles = await roleManagementFacet.revokeRoles(Roles, randomAccountList, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRoles,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeRoles }).execute()

        // Get roles
        await delay({ time: 1, unit: 'sec' })
        const burnRoleAccountsAfterRevoke = await rolesFacet.getAccountsWithRole(ROLES.burn.hash, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getAccountsWithRole,
        })

        for (const account of randomAccountList) {
            expect(burnRoleAccountsAfterRevoke).to.not.include(account)
        }
    })

    it('Granting role to account 0 fails', async function () {
        const listOfAccounts: string[] = []

        for (let i = 0; i < randomAccountList.length; i++) {
            listOfAccounts.push(randomAccountList[i])
        }

        listOfAccounts.push(ADDRESS_ZERO)

        await expect(
            roleManagementFacet.grantRoles([ROLES.burn.hash], listOfAccounts, [])
        ).to.be.revertedWithCustomError(roleManagementFacet, 'AddressZero')
    })

    it('Granting CashInRole with 0 amount fails', async function () {
        await expect(
            roleManagementFacet.grantRoles(
                [ROLES.cashin.hash],
                randomAccountList,
                randomAccountList.map(() => 0)
            )
        ).to.be.revertedWithCustomError(roleManagementFacet, 'AmountIsZero')
    })

    it('Granting CashInRole with max uint256 amount grants unlimited rights', async function () {
        await roleManagementFacet.grantRoles(
            [ROLES.cashin.hash],
            randomAccountList,
            randomAccountList.map(() => UINT256_MAX)
        )

        for (let i = 0; i < randomAccountList.length; i++) {
            const isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(randomAccountList[i], {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
            expect(isUnlimited).to.eq(true)
        }
    })
})
