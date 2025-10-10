import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { RolesFacet, RolesFacet__factory } from '@contracts'
import {
    ADDRESS_ZERO,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ROLES,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'
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

        const { ...deployedContracts } = await deployFullInfrastructure(
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
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Non Admin grants burn role : fail
        const nonOperatorGrantRoleResponse = await rolesFacet
            .connect(nonOperator)
            .grantRole(ROLES.burn.hash, operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorGrantRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
        // Non operator stil has not burn role
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
    })

    it('Admin account can grant role to an account', async function () {
        // Non operator has not burn role
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Admin grants burn role : success
        const grantRoleResponse = await rolesFacet.grantRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantRoleResponse,
            confirmationEvent: 'RoleGranted',
        }).execute()
        // Non operator has burn role
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Granting role to account 0 fails', async function () {
        await expect(rolesFacet.grantRole(ROLES.burn.hash, ADDRESS_ZERO)).to.be.revertedWithCustomError(
            rolesFacet,
            'AddressZero'
        )
    })

    it('Non Admin account can not revoke role from an account', async function () {
        // Non operator has burn role
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
        // Non Admin revokes burn role : fail
        const revokeRoleResponse = await rolesFacet.connect(nonOperator).revokeRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: revokeRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
        // Non operator stil has burn role
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Admin account can revoke role from an account', async function () {
        // Non operator has burn role
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
        // Admin revokes burn role : success
        const revokeRoleResponse = await rolesFacet.revokeRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: revokeRoleResponse,
            confirmationEvent: 'RoleRevoked',
        }).execute()

        // Non operator has not burn role
        await delay({ time: 1, unit: 'sec' })
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn.hash, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
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

        const revokeRoleResponse = await rolesFacet.revokeRole(ROLES.defaultAdmin.hash, Admins[Length - 1], {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: revokeRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
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
})
