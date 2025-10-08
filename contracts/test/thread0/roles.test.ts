import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { RolesFacet, RolesFacet__factory } from '@contracts'
import {
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
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Non Admin grants burn role : fail
        const nonOperatorGrantRoleResponse = await rolesFacet
            .connect(nonOperator)
            .grantRole(ROLES.burn, operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorGrantRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
        // Non operator stil has not burn role
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
    })

    it('Admin account can grant role to an account', async function () {
        // Non operator has not burn role
        let hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Admin grants burn role : success
        const grantRoleResponse = await rolesFacet.grantRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantRoleResponse,
            confirmationEvent: 'RoleGranted',
        }).execute()
        // Non operator has burn role
        hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Non Admin account can not revoke role from an account', async function () {
        await rolesFacet.grantRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })

        const revokeRoleResponse = await rolesFacet.connect(nonOperator).revokeRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: revokeRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
        // Non operator stil has burn role
        const hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Admin account can revoke role from an account', async function () {
        await rolesFacet.grantRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })

        // Admin revokes burn role : success
        const revokeRoleResponse = await rolesFacet.revokeRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: revokeRoleResponse,
            confirmationEvent: 'RoleRevoked',
        }).execute()

        // Non operator has not burn role
        await delay({ time: 1, unit: 'sec' })
        const hasBurnRole = await rolesFacet.hasRole(ROLES.burn, nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
    })
    // * Initial State again

    it('Getting roles', async function () {
        // Check roles
        const roles = await rolesFacet.getRoles(nonOperator, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const role of roles) {
            expect(role.toUpperCase()).to.equals(ROLES.withoutRole.toUpperCase())
        }

        // Assign roles
        const grantRoleResponseList: ContractTransactionResponse[] = []
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.defaultAdmin, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.cashin, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.burn, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.delete, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.freeze, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.pause, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.rescue, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.wipe, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.kyc, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await rolesFacet.grantRole(ROLES.customFees, nonOperator, {
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
                case ROLES.defaultAdmin.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.defaultAdmin.toUpperCase())
                    break
                case ROLES.cashin.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.cashin.toUpperCase())
                    break
                case ROLES.burn.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.burn.toUpperCase())
                    break
                case ROLES.delete.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.delete.toUpperCase())
                    break
                case ROLES.freeze.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.freeze.toUpperCase())
                    break
                case ROLES.pause.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.pause.toUpperCase())
                    break
                case ROLES.rescue.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.rescue.toUpperCase())
                    break
                case ROLES.wipe.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.wipe.toUpperCase())
                    break
                case ROLES.kyc.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.kyc.toUpperCase())
                    break
                case ROLES.customFees.toUpperCase():
                    expect(rol.toUpperCase()).to.equals(ROLES.customFees.toUpperCase())
                    break
                default:
                    expect(rol.toUpperCase()).to.equals(ROLES.withoutRole.toUpperCase())
                    break
            }
        }

        // Revoke roles
        const revokeRoleResponseList: ContractTransactionResponse[] = []
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.defaultAdmin, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.cashin, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.burn, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.delete, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.freeze, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.pause, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.rescue, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.wipe, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.kyc, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await rolesFacet.revokeRole(ROLES.customFees, nonOperator, {
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
            expect(rol.toUpperCase()).to.equals(ROLES.withoutRole.toUpperCase())
        }
    })
})
