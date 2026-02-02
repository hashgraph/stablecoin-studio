import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { RolesFacet, RolesFacet__factory } from '@contracts'
import { ADDRESS_ZERO, DeployFullInfrastructureCommand, MESSAGES, ROLES, ValidateTxResponseCommand } from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'
import { ContractTransactionResponse } from 'ethers'

describe('➡️ Roles Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let rolesFacet: RolesFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        rolesFacet = RolesFacet__factory.connect(address, operator)
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

    it('Non Admin account can not grant a role to an account', async function () {
        // Non operator has not burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)

        // Non Admin grants burn role : fail
        rolesFacet = rolesFacet.connect(nonOperator)
        await expect(
            rolesFacet.grantRole(ROLES.burn.hash, operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
            .to.be.revertedWithCustomError(rolesFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)

        // Non operator stil has not burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)
    })

    it('Admin account can grant role to an account', async function () {
        // Non operator has not burn role
        rolesFacet = rolesFacet.connect(operator)
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)

        // Admin grants burn role : success
        await expect(
            rolesFacet.grantRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
            .to.emit(rolesFacet, 'RoleGranted')
            .withArgs(ROLES.burn.hash, nonOperator.address, operator.address)

        // Non operator has burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)
    })

    it('Granting role to account 0 fails', async function () {
        await expect(rolesFacet.grantRole(ROLES.burn.hash, ADDRESS_ZERO)).to.be.revertedWithCustomError(
            rolesFacet,
            'AddressZero'
        )
    })

    it('Non Admin account can not revoke role from an account', async function () {
        // Non operator has burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)

        // Non Admin revokes burn role : fail
        rolesFacet = rolesFacet.connect(nonOperator)
        await expect(
            rolesFacet.revokeRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
            .to.be.revertedWithCustomError(rolesFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)

        // Non operator stil has burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)
    })

    it('Admin account can revoke role from an account', async function () {
        // Non operator has burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)

        // Admin revokes burn role : success
        rolesFacet = rolesFacet.connect(operator)
        await expect(
            rolesFacet.revokeRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
            .to.emit(rolesFacet, 'RoleRevoked')
            .withArgs(ROLES.burn.hash, nonOperator.address, operator.address)

        // Non operator has not burn role
        expect(
            await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)
    })

    it('Can not revoke all admin role from a token', async function () {
        const Admins = await rolesFacet.getAccountsWithRole(ROLES.defaultAdmin.hash, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getAccountsWithRole,
        })

        const Length = Admins.length
        for (let i = 0; i < Length - 1; i++) {
            await rolesFacet.revokeRole(ROLES.defaultAdmin.hash, Admins[i], {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        }

        await expect(
            rolesFacet.revokeRole(ROLES.defaultAdmin.hash, Admins[Length - 1], {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        ).to.be.revertedWithCustomError(rolesFacet, 'NoAdminsLeft')
    })
    // * Initial State again

    it('Getting roles', async function () {
        // Check roles
        const roles = await rolesFacet.getRoles(nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const role of roles) {
            expect(role.toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }

        // Assign roles
        const grantRoleResponseList: ContractTransactionResponse[] = []
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.defaultAdmin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.delete.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.freeze.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.pause.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.rescue.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.wipe.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.kyc.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.customFees.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        for (const grantRoleResponse of grantRoleResponseList) {
            await new ValidateTxResponseCommand({
                txResponse: grantRoleResponse,
                confirmationEvent: 'RoleGranted',
            }).execute()
        }

        // Checking roles
        const rolesAfter = await rolesFacet.getRoles(nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const rol of rolesAfter) {
            switch (rol.toUpperCase()) {
                case ROLES.defaultAdmin.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.defaultAdmin.hash.toUpperCase())
                    break
                case ROLES.cashin.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.cashin.hash.toUpperCase())
                    break
                case ROLES.burn.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.burn.hash.toUpperCase())
                    break
                case ROLES.delete.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.delete.hash.toUpperCase())
                    break
                case ROLES.freeze.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.freeze.hash.toUpperCase())
                    break
                case ROLES.pause.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.pause.hash.toUpperCase())
                    break
                case ROLES.rescue.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.rescue.hash.toUpperCase())
                    break
                case ROLES.wipe.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.wipe.hash.toUpperCase())
                    break
                case ROLES.kyc.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.kyc.hash.toUpperCase())
                    break
                case ROLES.customFees.hash.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.customFees.hash.toUpperCase())
                    break
                default:
                    expect(rol.toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
                    break
            }
        }

        // Revoke roles
        const revokeRoleResponseList: ContractTransactionResponse[] = []
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.defaultAdmin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.burn.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.delete.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.freeze.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.pause.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.rescue.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.wipe.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.kyc.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.customFees.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        for (const revokeRoleResponse of revokeRoleResponseList) {
            await new ValidateTxResponseCommand({
                txResponse: revokeRoleResponse,
                confirmationEvent: 'RoleRevoked',
            }).execute()
        }

        // Check roles
        const rolesAfterRevoke = await rolesFacet.getRoles(nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const rol of rolesAfterRevoke) {
            expect(rol.toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }
    })

    it('Retrieve list of existing Roles', async function () {
        const rolesList = await rolesFacet.getRolesList()

        expect(rolesList.length).to.be.equal(11)

        expect(rolesList[0].toString().toUpperCase()).to.be.equal(ROLES.defaultAdmin.hash.toUpperCase())
        expect(rolesList[1].toString().toUpperCase()).to.be.equal(ROLES.cashin.hash.toUpperCase())
        expect(rolesList[2].toString().toUpperCase()).to.be.equal(ROLES.burn.hash.toUpperCase())
        expect(rolesList[3].toString().toUpperCase()).to.be.equal(ROLES.wipe.hash.toUpperCase())
        expect(rolesList[4].toString().toUpperCase()).to.be.equal(ROLES.rescue.hash.toUpperCase())
        expect(rolesList[5].toString().toUpperCase()).to.be.equal(ROLES.pause.hash.toUpperCase())
        expect(rolesList[6].toString().toUpperCase()).to.be.equal(ROLES.freeze.hash.toUpperCase())
        expect(rolesList[7].toString().toUpperCase()).to.be.equal(ROLES.delete.hash.toUpperCase())
        expect(rolesList[8].toString().toUpperCase()).to.be.equal(ROLES.kyc.hash.toUpperCase())
        expect(rolesList[9].toString().toUpperCase()).to.be.equal(ROLES.customFees.hash.toUpperCase())
        expect(rolesList[10].toString().toUpperCase()).to.be.equal(ROLES.hold.hash.toUpperCase())
    })
})
