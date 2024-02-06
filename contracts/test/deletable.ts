import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import {
    deleteToken,
    grantRole,
    hasRole,
    Mint,
    revokeRole,
} from '../scripts/contractsMethods'
import { DELETE_ROLE } from '../scripts/constants'
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

export const deletable = (proxyAddresses: ContractId[]) => {
    describe('Delete Tests', () => {
        before(() => {
            proxyAddress = proxyAddresses[0]
        })

        it('Admin account can grant and revoke delete role to an account', async function () {
            // Admin grants delete role : success
            let result = await hasRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)
            await grantRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await hasRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(true)

            // Admin revokes delete role : success
            await revokeRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await hasRole(
                DELETE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)
        })

        it('Non Admin account can not grant delete role to an account', async function () {
            // Non Admin grants delete role : fail
            await expect(
                grantRole(
                    DELETE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Non Admin account can not revoke delete role to an account', async function () {
            // Non Admin revokes delete role : fail
            await grantRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                revokeRole(
                    DELETE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            //Reset status
            await revokeRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it("An account without delete role can't delete a token", async function () {
            await expect(
                deleteToken(proxyAddress, nonOperatorClient)
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with delete role can delete a token', async function () {
            const ONE = BigNumber.from(1).mul(TOKEN_FACTOR)
            // We first grant delete role to account
            await grantRole(
                DELETE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // We check that the token exists by minting 1
            await Mint(
                proxyAddress,
                ONE,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Delete the token
            await deleteToken(proxyAddress, nonOperatorClient)

            // We check that the token does not exist by unsucessfully trying to mint 1
            await expect(
                Mint(
                    proxyAddress,
                    ONE,
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            //The status CANNOT BE revertedsince we deleted the token
        })
    })
}
