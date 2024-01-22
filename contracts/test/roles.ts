/* eslint-disable @typescript-eslint/no-unused-vars */
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import {
    getRoleId,
    getRoles,
    grantRole,
    revokeRole,
} from '../scripts/contractsMethods'
import {
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
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    nonOperatorAccount,
    nonOperatorIsE25519,
    operatorClient,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

export const roles = (proxyAddresses: ContractId[]) => {
    describe('Roles Tests', function () {
        before(async function () {
            // Deploy Token using Client
            proxyAddress = proxyAddresses[0]
        })

        it('Getting roles', async function () {
            // Checking roles
            let result = await getRoles(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            result.forEach((role: string) => {
                expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase())
            })

            // Assigning roles
            await grantRole(
                DEFAULT_ADMIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                BURN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                PAUSE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                RESCUE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await grantRole(
                KYC_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Checking roles
            result = await getRoles(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
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

            // Revoking roles
            await revokeRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                BURN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                PAUSE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                RESCUE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                KYC_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await revokeRole(
                DEFAULT_ADMIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Checking roles
            result = await getRoles(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            result.forEach((role: string) => {
                expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase())
            })
        })

        it('Getting roles Id', async function () {
            // Retrieving roles
            const roleAdmin = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Admin
            )
            const roleCashin = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Cashin
            )
            const roleBurn = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Burn
            )
            const rolePause = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Pause
            )
            const roleWipe = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Wipe
            )
            const roleRescue = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Rescue
            )
            const roleFreeze = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Freeze
            )
            const roleDelete = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Delete
            )
            const roleKyc = await getRoleId(
                proxyAddress,
                operatorClient,
                RolesId.Kyc
            )

            // Checking
            expect(roleAdmin.toUpperCase()).to.equals(
                DEFAULT_ADMIN_ROLE.toUpperCase()
            )
            expect(roleCashin.toUpperCase()).to.equals(
                CASHIN_ROLE.toUpperCase()
            )
            expect(roleBurn.toUpperCase()).to.equals(BURN_ROLE.toUpperCase())
            expect(rolePause.toUpperCase()).to.equals(PAUSE_ROLE.toUpperCase())
            expect(roleWipe.toUpperCase()).to.equals(WIPE_ROLE.toUpperCase())
            expect(roleRescue.toUpperCase()).to.equals(
                RESCUE_ROLE.toUpperCase()
            )
            expect(roleFreeze.toUpperCase()).to.equals(
                FREEZE_ROLE.toUpperCase()
            )
            expect(roleDelete.toUpperCase()).to.equals(
                DELETE_ROLE.toUpperCase()
            )
            expect(roleKyc.toUpperCase()).to.equals(KYC_ROLE.toUpperCase())
        })
    })
}
