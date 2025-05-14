import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    HederaTokenManagerFacet,
    HederaTokenManagerFacet__factory,
    IHRC__factory,
    RolesFacet,
    RolesFacet__factory,
    SupplierAdminFacet,
    SupplierAdminFacet__factory,
} from '@typechain-types'
import {
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'
import { BigNumber } from 'ethers'

describe('➡️ Supplier Admin Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let rolesFacet: RolesFacet
    let supplierAdminFacet: SupplierAdminFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        rolesFacet = RolesFacet__factory.connect(address, operator)
        supplierAdminFacet = SupplierAdminFacet__factory.connect(address, operator)
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

    it('Admin account can grant and revoke supplier(s) role to an account', async function () {
        const cashInLimit = BigNumber.from(1)

        // Admin grants limited supplier role : success
        let role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
        let result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        const grantRoleResponse = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: grantRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(true)
        result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq(cashInLimit.toString())

        // Admin revokes limited supplier role : success
        const revokeRoleResponse = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
        result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        // Admin grants unlimited supplier role : success
        let isUnlimited = await supplierAdminFacet
            .connect(nonOperator)
            .isUnlimitedSupplierAllowance(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        expect(isUnlimited).to.eq(false)

        const grantUnlimitedRoleResponse = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(true)
        role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(true)

        // Admin revokes unlimited supplier role : success
        const revokeUnlimitedRoleResponse = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeUnlimitedRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(false)
        role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equals(false)
    })

    it('Admin account can increase, decrease and reset supplier(s) amount', async function () {
        const cashInLimit = BigNumber.from(1)
        const amount = BigNumber.from(1)

        // Admin increases supplier allowance : success
        const grantRoleResponse = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))

        await delay({ time: 1, unit: 'sec' })
        const increaseAllowanceResponse = await supplierAdminFacet.increaseSupplierAllowance(
            nonOperator.address,
            amount,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            }
        )
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: increaseAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        let result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        let expectedAmount = cashInLimit.add(amount)
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin decreases supplier allowance : success
        const decreaseAllowanceResponse = await supplierAdminFacet.decreaseSupplierAllowance(
            nonOperator.address,
            amount,
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            }
        )
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: decreaseAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expectedAmount = cashInLimit
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin resets supplier allowance : success
        const resetAllowanceResponse = await supplierAdminFacet.resetSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: resetAllowanceResponse }))

        await delay({ time: 1, unit: 'sec' })
        result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')

        // Remove the supplier role for further testing.....
        const revokeRoleResponse = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
    })

    it('Non Admin account can not grant nor revoke supplier(s) role to an account', async function () {
        const cashInLimit = BigNumber.from(1)

        // Non admin grants limited supplier role : fail
        const grantRoleResponse = await supplierAdminFacet
            .connect(nonOperator)
            .grantSupplierRole(nonOperator.address, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin grants unlimited supplier role : fail
        const grantUnlimitedRoleResponse = await supplierAdminFacet
            .connect(nonOperator)
            .grantUnlimitedSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin revokes limited supplier role : fail
        const grantRoleResponse2 = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse2 }))

        const revokeRoleResponse = await supplierAdminFacet
            .connect(nonOperator)
            .revokeSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Non admin revokes unlimited supplier role : fail
        const grantUnlimitedRoleResponse2 = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse2 }))

        const revokeUnlimitedRoleResponse = await supplierAdminFacet
            .connect(nonOperator)
            .revokeSupplierRole(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeUnlimitedRoleResponse }))
        ).to.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        const revokeRoleResponse2 = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse2 }))
    })

    it('Non Admin account can not increase, decrease and reset supplier(s) amount', async function () {
        const cashInLimit = BigNumber.from(10)
        const amount = BigNumber.from(1)

        // Non Admin increases supplier allowance : fail
        const grantRoleResponse = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))

        const increaseAllowanceResponse = await supplierAdminFacet
            .connect(nonOperator)
            .increaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: increaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // non Admin decreases supplier allowance : fail
        const decreaseAllowanceResponse = await supplierAdminFacet
            .connect(nonOperator)
            .decreaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: decreaseAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // Non Admin resets supplier allowance : fail
        const resetAllowanceResponse = await supplierAdminFacet
            .connect(nonOperator)
            .resetSupplierAllowance(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: resetAllowanceResponse }))
        ).to.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        const revokeRoleResponse = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }))
    })
})

describe('➡️ Supplier Admin Tests - (Unlimited)', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
    let supplierAdminFacet: SupplierAdminFacet
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let cashInFacet: CashInFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        supplierAdminFacet = SupplierAdminFacet__factory.connect(address, operator)
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
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
        ;({ stableCoinProxyAddress, tokenAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: deployedContracts.businessLogicResolver.proxyAddress!,
            stableCoinFactoryProxyAddress: deployedContracts.stableCoinFactoryFacet.proxyAddress!,
        }))

        await setFacets(stableCoinProxyAddress)

        // Grant unlimited supplier role
        const grantUnlimitedRoleResponse = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
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
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))

        await delay({ time: 1.5, unit: 'sec' })
        // Check balance of account and total supply : success
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const finalBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can cash in 100 tokens', async function () {
        const AmountToMint = BigNumber.from(100).mul(ONE_TOKEN)

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(nonOperator.address)

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(nonOperator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))

        // Check balance of account and total supply : success
        await delay({ time: 1.5, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const finalBalanceOf = await hederaTokenManagerFacet.balanceOf(nonOperator.address)
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can not cash in more than maxSupply tokens', async function () {
        // Retrieve current total supply
        const TotalSupply = await hederaTokenManagerFacet.totalSupply()

        // Cashin more tokens than max supply : fail
        const mintResponse = await cashInFacet.mint(
            nonOperator.address,
            DEFAULT_TOKEN.maxSupply.sub(TotalSupply).add(1),
            {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            }
        )
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role can not be granted limited supplier role', async function () {
        // Grant limited supplier role to account with unlimited supplier role : fail
        const grantRoleResponse = await supplierAdminFacet.grantSupplierRole(nonOperator.address, BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role, but revoked, can not cash in anything at all', async function () {
        // Revoke unlimited supplier role
        const revokeRoleResponse = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: revokeRoleResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        // Cashin 1 token : fail
        const mintResponse = await cashInFacet.connect(nonOperator).mint(nonOperator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)

        // Grant unlimited supplier role to continue testing next tests cases
        const grantUnlimitedRoleResponse = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantUnlimitedRoleResponse }))
    })

    it('An account with unlimited supplier role can not increase supplier allowance', async function () {
        // Increase supplier allowance an account with unlimited supplier role : fail
        const increaseAllowanceResponse = await supplierAdminFacet.increaseSupplierAllowance(
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
        const decreaseAllowanceResponse = await supplierAdminFacet.decreaseSupplierAllowance(
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
