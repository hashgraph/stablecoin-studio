import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { delay, MESSAGES, ROLES, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'
import { ContractTransaction } from 'ethers'

describe('➡️ Roles Tests', function () {
    // Contracts
    let proxyAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    before(async function () {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()
        // if ((network.name as NetworkName) === NETWORK_LIST.name[0]) {
        //     await deployPrecompiledHederaTokenServiceMock(hre, signer)
        // }
        ;({ proxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it('Non Admin account can not grant a role to an account', async function () {
        // Non operator has not burn role
        let hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Non Admin grants burn role : fail
        const nonOperatorGrantRoleResponse = await hederaTokenManager
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
        hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
    })

    it('Admin account can grant role to an account', async function () {
        // Non operator has not burn role
        let hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
        // Admin grants burn role : success
        const grantRoleResponse = await hederaTokenManager.grantRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantRoleResponse,
            confirmationEvent: 'RoleGranted',
        }).execute()
        // Non operator has burn role
        hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Non Admin account can not revoke role from an account', async function () {
        // Non operator has burn role
        let hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
        // Non Admin revokes burn role : fail
        const revokeRoleResponse = await hederaTokenManager
            .connect(nonOperator)
            .revokeRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: revokeRoleResponse,
            }).execute()
        ).to.be.rejectedWith(Error)
        // Non operator stil has burn role
        hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
    })

    it('Admin account can revoke role from an account', async function () {
        // Non operator has burn role
        let hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(true)
        // Admin revokes burn role : success
        const revokeRoleResponse = await hederaTokenManager.revokeRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
        })
        await new ValidateTxResponseCommand({
            txResponse: revokeRoleResponse,
            confirmationEvent: 'RoleRevoked',
        }).execute()

        // Non operator has not burn role
        await delay({ time: 1, unit: 'sec' })
        hasBurnRole = await hederaTokenManager.hasRole(ROLES.burn.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(hasBurnRole).to.equals(false)
    })
    // * Initial State again

    it('Getting roles', async function () {
        // Check roles
        const roles = await hederaTokenManager.getRoles(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const role of roles) {
            expect(role.toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }

        // Assign roles
        const grantRoleResponseList: ContractTransaction[] = []
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.defaultAdmin.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.cashin.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.delete.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.freeze.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.pause.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.rescue.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.wipe.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.kyc.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
            })
        )
        grantRoleResponseList.push(
            await hederaTokenManager.grantRole(ROLES.customFees.hash, nonOperator.address, {
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
        const rolesAfter = await hederaTokenManager.getRoles(nonOperator.address, {
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
        const revokeRoleResponseList: ContractTransaction[] = []
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.defaultAdmin.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.cashin.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.burn.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.delete.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.freeze.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.pause.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.rescue.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.wipe.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.kyc.hash, nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeRole,
            })
        )
        revokeRoleResponseList.push(
            await hederaTokenManager.revokeRole(ROLES.customFees.hash, nonOperator.address, {
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
        const rolesAfterRevoke = await hederaTokenManager.getRoles(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        for (const rol of rolesAfterRevoke) {
            expect(rol.toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }
    })

    it('Getting roles Id', async function () {
        // Retreive role Ids
        const roleAdmin = hederaTokenManager.getRoleId(ROLES.defaultAdmin.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleCashin = hederaTokenManager.getRoleId(ROLES.cashin.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleBurn = hederaTokenManager.getRoleId(ROLES.burn.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const rolePause = hederaTokenManager.getRoleId(ROLES.pause.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleWipe = hederaTokenManager.getRoleId(ROLES.wipe.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleRescue = hederaTokenManager.getRoleId(ROLES.rescue.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleFreeze = hederaTokenManager.getRoleId(ROLES.freeze.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleDelete = hederaTokenManager.getRoleId(ROLES.delete.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleKyc = hederaTokenManager.getRoleId(ROLES.kyc.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })
        const roleCustomFees = hederaTokenManager.getRoleId(ROLES.customFees.id, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
        })

        // Check
        expect((await roleAdmin).toUpperCase()).to.equals(ROLES.defaultAdmin.hash.toUpperCase())
        expect((await roleCashin).toUpperCase()).to.equals(ROLES.cashin.hash.toUpperCase())
        expect((await roleBurn).toUpperCase()).to.equals(ROLES.burn.hash.toUpperCase())
        expect((await rolePause).toUpperCase()).to.equals(ROLES.pause.hash.toUpperCase())
        expect((await roleWipe).toUpperCase()).to.equals(ROLES.wipe.hash.toUpperCase())
        expect((await roleRescue).toUpperCase()).to.equals(ROLES.rescue.hash.toUpperCase())
        expect((await roleFreeze).toUpperCase()).to.equals(ROLES.freeze.hash.toUpperCase())
        expect((await roleDelete).toUpperCase()).to.equals(ROLES.delete.hash.toUpperCase())
        expect((await roleKyc).toUpperCase()).to.equals(ROLES.kyc.hash.toUpperCase())
        expect((await roleCustomFees).toUpperCase()).to.equals(ROLES.customFees.hash.toUpperCase())
    })
})
