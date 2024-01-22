import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import {
    freeze,
    getBalanceOf,
    grantRole,
    hasRole,
    rescue,
    revokeRole,
    unfreeze,
} from '../scripts/contractsMethods'
import { FREEZE_ROLE } from '../scripts/constants'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    nonOperatorAccount,
    nonOperatorClient,
    nonOperatorIsE25519,
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    TOKEN_FACTOR,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

export const freezable = (deployedContracts: ContractId[]) => {
    describe('Freeze Tests', function () {
        before(async function () {
            proxyAddress = deployedContracts[0]
        })

        it('Admin account can grant and revoke freeze role to an account', async function () {
            // Admin grants freeze role : success
            let result = await hasRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)

            await grantRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            result = await hasRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(true)

            // Admin revokes freeze role : success
            await revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await hasRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)
        })

        it('Non Admin account can not grant freeze role to an account', async function () {
            // Non Admin grants freeze role : fail
            await expect(
                grantRole(
                    FREEZE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Non Admin account can not revoke freeze role to an account', async function () {
            // Non Admin revokes freeze role : fail
            await grantRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                revokeRole(
                    FREEZE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            //Reset status
            await revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it("An account without freeze role can't freeze transfers of the token for the account", async function () {
            await expect(
                freeze(
                    proxyAddress,
                    nonOperatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it("An account without freeze role can't unfreeze transfers of the token for the account", async function () {
            await expect(
                unfreeze(
                    proxyAddress,
                    nonOperatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with freeze role can freeze transfers of the token for the account', async function () {
            await grantRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            await expect(
                freeze(
                    proxyAddress,
                    nonOperatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).not.to.eventually.be.rejectedWith(Error)

            //Reset status
            await unfreeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
            await revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('An account with freeze role can unfreeze transfers of the token for the account', async function () {
            await grantRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            await expect(
                unfreeze(
                    proxyAddress,
                    nonOperatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).not.to.eventually.be.rejectedWith(Error)

            //Reset status
            await revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('When freezing transfers of the token for the account a rescue operation can not be performed', async function () {
            const AmountToRescue = BigNumber.from(1).mul(TOKEN_FACTOR)

            await freeze(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            await expect(
                rescue(proxyAddress, AmountToRescue, operatorClient)
            ).to.eventually.be.rejectedWith(Error)

            //Reset status
            await unfreeze(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        })

        it('When unfreezing transfers of the token for the account a rescue operation can be performed', async function () {
            const AmountToRescue = BigNumber.from(1).mul(TOKEN_FACTOR)

            await freeze(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            await unfreeze(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            await rescue(proxyAddress, AmountToRescue, operatorClient)
            const balance = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            expect(balance.toString()).to.equals(AmountToRescue.toString())
        })
    })
}
