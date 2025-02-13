import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory, IHRC__factory } from '@typechain'
import { delay, MESSAGES, ROLES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, ONE_TOKEN, MAX_SUPPLY } from '@test/shared'
import { BigNumber } from 'ethers'

describe('➡️ Supplier Admin Tests', function () {
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

    it('Admin account can grant and revoke supplier(s) role to an account', async function () {
        const cashInLimit = BigNumber.from(1)

        // Admin grants limited supplier role : success
        let role = await hederaTokenManager.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
        let result = await hederaTokenManager.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        const grantRoleResponse = await hederaTokenManager.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: grantRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        role = await hederaTokenManager.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(true)
        result = await hederaTokenManager.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq(cashInLimit.toString())

        // Admin revokes limited supplier role : success
        const revokeRoleResponse = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        role = await hederaTokenManager.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
        result = await hederaTokenManager.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        // Admin grants unlimited supplier role : success
        let isUnlimited = await hederaTokenManager
            .connect(nonOperator)
            .isUnlimitedSupplierAllowance(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        expect(isUnlimited).to.eq(false)

        const grantUnlimitedRoleResponse = await hederaTokenManager.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        isUnlimited = await hederaTokenManager.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(true)
        role = await hederaTokenManager.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(true)

        // Admin revokes unlimited supplier role : success
        const revokeUnlimitedRoleResponse = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeUnlimitedRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        isUnlimited = await hederaTokenManager.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(false)
        role = await hederaTokenManager.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
    })

    it('Admin account can increase, decrease and reset supplier(s) amount', async function () {
        const cashInLimit = BigNumber.from(1)
        const amount = BigNumber.from(1)

        // Admin increases supplier allowance : success
        const grantRoleResponse = await hederaTokenManager.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))

        await delay({ time: 1, unit: 'sec' })
        const increaseAllowanceResponse = await hederaTokenManager.increaseSupplierAllowance(
            nonOperator.address,
            amount,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            }
        )
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: increaseAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        let result = await hederaTokenManager.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        let expectedAmount = cashInLimit.add(amount)
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin decreases supplier allowance : success
        const decreaseAllowanceResponse = await hederaTokenManager.decreaseSupplierAllowance(
            nonOperator.address,
            amount,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            }
        )
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: decreaseAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        result = await hederaTokenManager.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expectedAmount = cashInLimit
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin resets supplier allowance : success
        const resetAllowanceResponse = await hederaTokenManager.resetSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: resetAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        result = await hederaTokenManager.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        // Remove the supplier role for further testing.....
        const revokeRoleResponse = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
    })

    it('Non Admin account can not grant nor revoke supplier(s) role to an account', async function () {
        const cashInLimit = BigNumber.from(1)

        // Non admin grants limited supplier role : fail
        const grantRoleResponse = await hederaTokenManager
            .connect(nonOperator)
            .grantSupplierRole(nonOperator.address, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin grants unlimited supplier role : fail
        const grantUnlimitedRoleResponse = await hederaTokenManager
            .connect(nonOperator)
            .grantUnlimitedSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin revokes limited supplier role : fail
        const grantRoleResponse2 = await hederaTokenManager.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse2 }))

        const revokeRoleResponse = await hederaTokenManager
            .connect(nonOperator)
            .revokeSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin revokes unlimited supplier role : fail
        const grantUnlimitedRoleResponse2 = await hederaTokenManager.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse2 }))

        const revokeUnlimitedRoleResponse = await hederaTokenManager
            .connect(nonOperator)
            .revokeSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeUnlimitedRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        const revokeRoleResponse2 = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse2 }))
    })

    it('Non Admin account can not increase, decrease and reset supplier(s) amount', async function () {
        const cashInLimit = BigNumber.from(10)
        const amount = BigNumber.from(1)

        // Non Admin increases supplier allowance : fail
        const grantRoleResponse = await hederaTokenManager.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))

        const increaseAllowanceResponse = await hederaTokenManager
            .connect(nonOperator)
            .increaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: increaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // non Admin decreases supplier allowance : fail
        const decreaseAllowanceResponse = await hederaTokenManager
            .connect(nonOperator)
            .decreaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: decreaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // Non Admin resets supplier allowance : fail
        const resetAllowanceResponse = await hederaTokenManager
            .connect(nonOperator)
            .resetSupplierAllowance(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: resetAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        const revokeRoleResponse = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
    })
})

describe('➡️ Supplier Admin Tests - (Unlimited)', function () {
    // Contracts
    let proxyAddress: string
    let tokenAddress: string
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
        ;({ proxyAddress, tokenAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)

        // Grant unlimited supplier role
        const grantUnlimitedRoleResponse = await hederaTokenManager.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }))

        // Associate token to nonOperator account
        const associateResponse = await IHRC__factory.connect(tokenAddress, nonOperator).associate({
            gasLimit: GAS_LIMIT.hederaTokenManager.associate,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: associateResponse }))
    })

    it('An account with unlimited supplier role can cash in 100 tokens to the treasury account', async function () {
        const AmountToMint = BigNumber.from(100).mul(ONE_TOKEN)

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManager.totalSupply()
        const initialBalanceOf = await hederaTokenManager.balanceOf(operator.address)

        // Cashin tokens to previously associated account
        const mintResponse = await hederaTokenManager.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))

        await delay({ time: 1.5, unit: 'sec' })
        // Check balance of account and total supply : success
        const finalTotalSupply = await hederaTokenManager.totalSupply()
        const finalBalanceOf = await hederaTokenManager.balanceOf(operator.address)
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can cash in 100 tokens', async function () {
        const AmountToMint = BigNumber.from(100).mul(ONE_TOKEN)

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManager.totalSupply()
        const initialBalanceOf = await hederaTokenManager.balanceOf(nonOperator.address)

        // Cashin tokens to previously associated account
        const mintResponse = await hederaTokenManager.mint(nonOperator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))

        // Check balance of account and total supply : success
        await delay({ time: 1.5, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManager.totalSupply()
        const finalBalanceOf = await hederaTokenManager.balanceOf(nonOperator.address)
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can not cash in more than maxSupply tokens', async function () {
        // Retrieve current total supply
        const TotalSupply = await hederaTokenManager.totalSupply()

        // Cashin more tokens than max supply : fail
        const mintResponse = await hederaTokenManager.mint(nonOperator.address, MAX_SUPPLY.sub(TotalSupply).add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role can not be granted limited supplier role', async function () {
        // Grant limited supplier role to account with unlimited supplier role : fail
        const grantRoleResponse = await hederaTokenManager.grantSupplierRole(nonOperator.address, BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role, but revoked, can not cash in anything at all', async function () {
        // Revoke unlimited supplier role
        const revokeRoleResponse = await hederaTokenManager.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        // Cashin 1 token : fail
        const mintResponse = await hederaTokenManager.connect(nonOperator).mint(nonOperator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)

        // Grant unlimited supplier role to continue testing next tests cases
        const grantUnlimitedRoleResponse = await hederaTokenManager.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }))
    })

    it('An account with unlimited supplier role can not increase supplier allowance', async function () {
        // Increase supplier allowance an account with unlimited supplier role : fail
        const increaseAllowanceResponse = await hederaTokenManager.increaseSupplierAllowance(
            nonOperator.address,
            ONE_TOKEN,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            }
        )
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: increaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role can not decrease supplier allowance', async function () {
        // Decrease supplier allowance an account with unlimited supplier role : fail
        const decreaseAllowanceResponse = await hederaTokenManager.decreaseSupplierAllowance(
            nonOperator.address,
            ONE_TOKEN,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            }
        )
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: decreaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)
    })
})
