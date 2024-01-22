import '@hashgraph/hardhat-hethers'
import { BigNumber } from 'ethers'
import {
    getBalanceOf,
    getTotalSupply,
    grantRole,
    hasRole,
    Mint,
    revokeRole,
    Wipe,
} from '../scripts/contractsMethods'
import { WIPE_ROLE } from '../scripts/constants'
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

export const wipeable = (proxyAddresses: ContractId[]) => {
    describe('Wipe Tests', function () {
        before(async function () {
            // Deploy Token using Client
            proxyAddress = proxyAddresses[0]
        })

        it('Admin account can grant and revoke wipe role to an account', async function () {
            // Admin grants wipe role : success
            let result = await hasRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)

            await grantRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            result = await hasRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(true)

            // Admin revokes wipe role : success
            await revokeRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await hasRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result).to.equals(false)
        })

        it('Non Admin account can not grant wipe role to an account', async function () {
            // Non Admin grants wipe role : fail
            await expect(
                grantRole(
                    WIPE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Non Admin account can not revoke wipe role to an account', async function () {
            // Non Admin revokes wipe role : fail
            await grantRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                revokeRole(
                    WIPE_ROLE,
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            //Reset status
            await revokeRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('wipe 10 tokens from an account with 20 tokens', async function () {
            const TokensToMint = BigNumber.from(20).mul(TOKEN_FACTOR)
            const TokensToWipe = BigNumber.from(10).mul(TOKEN_FACTOR)

            // Mint 20 tokens
            await Mint(
                proxyAddress,
                TokensToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Get the initial total supply and account's balanceOf
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const initialBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Wipe 10 tokens
            await Wipe(
                proxyAddress,
                TokensToWipe,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Check balance of account and total supply : success
            const finalTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const finalBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe)
            const expectedBalanceOf = initialBalanceOf.sub(TokensToWipe)

            expect(finalTotalSupply.toString()).to.equals(
                expectedTotalSupply.toString()
            )
            expect(finalBalanceOf.toString()).to.equals(
                expectedBalanceOf.toString()
            )
        })

        it("Wiping more than account's balance", async function () {
            const TokensToMint = BigNumber.from(20).mul(TOKEN_FACTOR)

            // Mint 20 tokens
            await Mint(
                proxyAddress,
                TokensToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Get the current balance for account
            const result = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Wipe more than account's balance : fail
            await expect(
                Wipe(
                    proxyAddress,
                    result.add(1),
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Wiping from account without the wipe role', async function () {
            const TokensToMint = BigNumber.from(20).mul(TOKEN_FACTOR)

            // Mint 20 tokens
            await Mint(
                proxyAddress,
                TokensToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Wipe with account that does not have the wipe role: fail
            await expect(
                Wipe(
                    proxyAddress,
                    BigNumber.from(1),
                    nonOperatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('User with granted wipe role can wipe tokens', async function () {
            const TokensToMint = BigNumber.from(20).mul(TOKEN_FACTOR)
            const TokensToWipe = BigNumber.from(1)

            // Mint 20 tokens
            await Mint(
                proxyAddress,
                TokensToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Retrieve original total supply
            const initialBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            // Grant wipe role to account
            await grantRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Wipe tokens with newly granted account
            await Wipe(
                proxyAddress,
                TokensToWipe,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Check final total supply and treasury account's balanceOf : success
            const finalBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            const finalTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const expectedFinalBalanceOf = initialBalanceOf.sub(TokensToWipe)
            const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe)

            expect(finalBalanceOf.toString()).to.equals(
                expectedFinalBalanceOf.toString()
            )
            expect(finalTotalSupply.toString()).to.equals(
                expectedTotalSupply.toString()
            )
        })
    })
}
