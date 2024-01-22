import '@hashgraph/hardhat-hethers'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    decreaseSupplierAllowance,
    getBalanceOf,
    getSupplierAllowance,
    getTotalSupply,
    grantRole,
    grantSupplierRole,
    grantUnlimitedSupplierRole,
    hasRole,
    increaseSupplierAllowance,
    isUnlimitedSupplierAllowance,
    Mint,
    resetSupplierAllowance,
    revokeRole,
    revokeSupplierRole,
    Wipe,
} from '../scripts/contractsMethods'
import { CASHIN_ROLE, WIPE_ROLE } from '../scripts/constants'
import { associateToken, getContractInfo } from '../scripts/utils'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorAccount,
    nonOperatorClient,
    nonOperatorIsE25519,
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    operatorPriKey,
    operatorPubKey,
    TOKEN_DECIMALS,
    TOKEN_FACTOR,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

export const supplierAdmin = () => {
    describe('Supplier Admin Tests - (roles)', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_SUPPLY.add(
                    BigNumber.from('150').mul(TOKEN_FACTOR)
                ).toString(),
            })
            proxyAddress = result[0]
        })

        it('Admin account can grant and revoke supplier(s) role to an account', async function () {
            const cashInLimit = BigNumber.from(1)

            // Admin grants limited supplier role : success
            let Role = await hasRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(Role).to.equals(false)
            let result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq('0')

            await grantSupplierRole(
                proxyAddress,
                cashInLimit,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            Role = await hasRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(Role).to.equals(true)
            result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq(cashInLimit.toString())

            // Admin revokes limited supplier role : success
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            Role = await hasRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(Role).to.equals(false)
            result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq('0')

            // Admin grants unlimited supplier role : success
            let isUnlimited = await isUnlimitedSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(isUnlimited).to.eq(false)

            await grantUnlimitedSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            isUnlimited = await isUnlimitedSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(isUnlimited).to.eq(true)
            Role = await hasRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(Role).to.equals(true)

            // Admin revokes unlimited supplier role : success
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            isUnlimited = await isUnlimitedSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(isUnlimited).to.eq(false)
            Role = await hasRole(
                CASHIN_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(Role).to.equals(false)
        })

        it('Admin account can increase, decrease and reset supplier(s) amount', async function () {
            const cashInLimit = BigNumber.from(1)
            const amount = BigNumber.from(1)

            // Admin increases supplier allowance : success
            await grantSupplierRole(
                proxyAddress,
                cashInLimit,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await increaseSupplierAllowance(
                proxyAddress,
                amount,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            let result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            let expectedAmount = cashInLimit.add(amount)
            expect(result.toString()).to.eq(expectedAmount.toString())

            // Admin decreases supplier allowance : success
            await decreaseSupplierAllowance(
                proxyAddress,
                amount,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expectedAmount = cashInLimit
            expect(result.toString()).to.eq(expectedAmount.toString())

            // Admin resets supplier allowance : success
            await resetSupplierAllowance(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq('0')

            // Remove the supplier role for further testing.....
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('Non Admin account can not grant nor revoke supplier(s) role to an account', async function () {
            const cashInLimit = BigNumber.from(1)

            // Non admin grants limited supplier role : fail
            await expect(
                grantSupplierRole(
                    proxyAddress,
                    cashInLimit,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Non admin grants unlimited supplier role : fail
            await expect(
                grantUnlimitedSupplierRole(
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Non admin revokes limited supplier role : fail
            await grantSupplierRole(
                proxyAddress,
                cashInLimit,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                revokeSupplierRole(
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Non admin revokes unlimited supplier role : fail
            await grantUnlimitedSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                revokeSupplierRole(
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Remove the supplier role for further testing.....
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('Non Admin account can not increase, decrease and reset supplier(s) amount', async function () {
            const cashInLimit = BigNumber.from(10)
            const amount = BigNumber.from(1)

            // Non Admin increases supplier allowance : fail
            await grantSupplierRole(
                proxyAddress,
                cashInLimit,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            await expect(
                increaseSupplierAllowance(
                    proxyAddress,
                    amount,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // non Admin decreases supplier allowance : fail
            await expect(
                decreaseSupplierAllowance(
                    proxyAddress,
                    amount,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Non Admin resets supplier allowance : fail
            await expect(
                resetSupplierAllowance(
                    proxyAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Remove the supplier role for further testing.....
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })
    })

    describe('Supplier Admin Tests - (Unlimited)', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_SUPPLY.add(
                    BigNumber.from('1500').mul(TOKEN_FACTOR)
                ).toString(),
            })

            proxyAddress = result[0]
            token = result[8]

            // Grant unlimited supplier role
            await grantUnlimitedSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Associate account to token
            await associateToken(
                token.toString(),
                nonOperatorAccount,
                nonOperatorClient
            )
        })

        it('An account with unlimited supplier role can cash in 100 tokens to the treasury account', async function () {
            const AmountToMint = BigNumber.from(100).mul(TOKEN_FACTOR)

            // Get the initial total supply and account's balanceOf
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const initialBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address,
                false,
                false
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                nonOperatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address,
                false,
                false
            )

            // Check balance of account and total supply : success
            const finalTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const finalBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address,
                false,
                false
            )
            const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
            const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

            expect(finalTotalSupply.toString()).to.equals(
                expectedTotalSupply.toString()
            )
            expect(finalBalanceOf.toString()).to.equals(
                expectedBalanceOf.toString()
            )
        })

        it('An account with unlimited supplier role can cash in 100 tokens', async function () {
            const AmountToMint = BigNumber.from(100).mul(TOKEN_FACTOR)

            // Get the initial total supply and account's balanceOf
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const initialBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Check balance of account and total supply : success
            const finalTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const finalBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
            const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

            expect(finalTotalSupply.toString()).to.equals(
                expectedTotalSupply.toString()
            )
            expect(finalBalanceOf.toString()).to.equals(
                expectedBalanceOf.toString()
            )
        })

        it('An account with unlimited supplier role can not cash in more than maxSupply tokens', async function () {
            // Retrieve current total supply
            const TotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            // Cashin more tokens than max supply : fail
            await expect(
                Mint(
                    proxyAddress,
                    MAX_SUPPLY.sub(TotalSupply).add(1),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with unlimited supplier role can not be granted limited supplier role', async function () {
            // Grant limited supplier role to account with unlimited supplier role : fail
            await expect(
                grantSupplierRole(
                    proxyAddress,
                    BigNumber.from(1),
                    operatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with unlimited supplier role, but revoked, can not cash in anything at all', async function () {
            // Revoke unlimited supplier role
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin 1 token : fail
            await expect(
                Mint(
                    proxyAddress,
                    BigNumber.from(1).mul(TOKEN_FACTOR),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            // Grant unlimited supplier role to continue testing next tests cases
            await grantUnlimitedSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('An account with unlimited supplier role can not increase supplier allowance', async function () {
            // Increase supplier allowance an account with unlimited supplier role : fail
            await expect(
                increaseSupplierAllowance(
                    proxyAddress,
                    BigNumber.from(1),
                    operatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with unlimited supplier role can not decrease supplier allowance', async function () {
            // Decrease supplier allowance an account with unlimited supplier role : fail
            await expect(
                decreaseSupplierAllowance(
                    proxyAddress,
                    BigNumber.from(1),
                    operatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })
    })

    describe('Supplier Admin Tests - (Limited)', function () {
        const cashInLimit = BigNumber.from(100).mul(TOKEN_FACTOR)

        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_SUPPLY.add(
                    BigNumber.from('250').mul(TOKEN_FACTOR)
                ).toString(),
            })

            proxyAddress = result[0]
            token = result[8]

            // Associate account to token
            await associateToken(
                token.toString(),
                nonOperatorAccount,
                nonOperatorClient
            )
        })

        beforeEach(async function () {
            // Reset cash in limit for account with limited supplier role
            await grantSupplierRole(
                proxyAddress,
                cashInLimit,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('An account with supplier role and an allowance of 100 tokens can cash in 100 tokens', async function () {
            const AmountToMint = cashInLimit

            // Get the initial total supply and account's balanceOf
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const initialBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Check balance of account and total supply : success
            const finalTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )
            const finalBalanceOf = await getBalanceOf(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
            const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

            expect(finalTotalSupply.toString()).to.equals(
                expectedTotalSupply.toString()
            )
            expect(finalBalanceOf.toString()).to.equals(
                expectedBalanceOf.toString()
            )
        })

        it('An account with supplier role and an allowance of 90 tokens can not cash in 91 tokens', async function () {
            const cashInDecreaseAmount = BigNumber.from(10).mul(TOKEN_FACTOR)

            // decrease allowance
            await decreaseSupplierAllowance(
                proxyAddress,
                cashInDecreaseAmount,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin more token than allowed : fail
            await expect(
                Mint(
                    proxyAddress,
                    cashInLimit.sub(cashInDecreaseAmount).add(1),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with supplier role and an allowance of (100 + maxsupply) tokens can not cash more than maxSupply tokens', async function () {
            // Increase total allowance by maxsupply
            await increaseSupplierAllowance(
                proxyAddress,
                MAX_SUPPLY,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin maxsupply + 1 token : fail
            await expect(
                Mint(
                    proxyAddress,
                    MAX_SUPPLY.add(1),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with supplier role and and allowance of 100 token can mint ALL tokens then allowance can be increased', async function () {
            const extraAllowance = BigNumber.from(10).mul(TOKEN_FACTOR)

            // Cashin all tokens
            await Mint(
                proxyAddress,
                cashInLimit,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Increase total allowance
            await increaseSupplierAllowance(
                proxyAddress,
                extraAllowance,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Check that supplier Allowance was not set
            const result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq(extraAllowance)

            await grantRole(
                WIPE_ROLE,
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            //Wipe all tokens to restore the initial state
            await Wipe(
                proxyAddress,
                extraAllowance,
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
        })

        it('An account with supplier role and an allowance of 100 tokens, can mint 90 tokens but, later on, cannot mint 11 tokens', async function () {
            const amountToMintlater = BigNumber.from(10).mul(TOKEN_FACTOR)

            // Cashin all allowed token minus "amountToMintLater"
            await Mint(
                proxyAddress,
                cashInLimit.sub(amountToMintlater),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin the remaining allowed tokens (amountToMintLater) + 1 token :fail
            await expect(
                Mint(
                    proxyAddress,
                    amountToMintlater.add(1),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('An account with supplier role will reset allowance when unlimited supplier role is granted', async function () {
            // Grant unlimited supplier role
            await grantUnlimitedSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Check that supplier Allowance was not set
            const result = await getSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            expect(result.toString()).to.eq('0')

            // Reset status for further testing...
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        })

        it('An account with supplier role, but revoked, can not cash in anything at all', async function () {
            // Revoke supplier role
            await revokeSupplierRole(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            // Cashin 1 token : fail
            await expect(
                Mint(
                    proxyAddress,
                    BigNumber.from(1).mul(TOKEN_FACTOR),
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })
    })
}
