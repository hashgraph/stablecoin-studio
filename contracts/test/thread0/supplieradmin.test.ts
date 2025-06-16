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

    it('should confirm nonOperator has no supplier role initially', async function () {
        const role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equal(false)

        const result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')
    })

    it('should allow admin to grant limited supplier role', async function () {
        const cashInLimit = BigNumber.from(1)

        const tx = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: tx }).execute()

        await delay({ time: 1, unit: 'sec' })

        const role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equal(true)

        const result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq(cashInLimit.toString())
    })

    it('should allow admin to revoke limited supplier role', async function () {
        const tx = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: tx }).execute()

        await delay({ time: 1, unit: 'sec' })

        const role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equal(false)

        const result = await supplierAdminFacet.connect(nonOperator).getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })
        expect(result.toString()).to.eq('0')
    })

    it('should allow admin to grant unlimited supplier role', async function () {
        let isUnlimited = await supplierAdminFacet
            .connect(nonOperator)
            .isUnlimitedSupplierAllowance(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        expect(isUnlimited).to.eq(false)

        const tx = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: tx }).execute()

        await delay({ time: 1, unit: 'sec' })

        isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(true)

        const role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equal(true)
    })

    it('should allow admin to revoke unlimited supplier role', async function () {
        const tx = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await new ValidateTxResponseCommand({ txResponse: tx }).execute()

        await delay({ time: 1, unit: 'sec' })

        const isUnlimited = await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
        })
        expect(isUnlimited).to.eq(false)

        const role = await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
        })
        expect(role).to.equal(false)
    })

    it('should allow admin to grant supplier role', async function () {
        const cashInLimit = BigNumber.from(1)

        const tx = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))
    })

    it('should allow admin to increase supplier allowance', async function () {
        const amount = BigNumber.from(1)

        await delay({ time: 1, unit: 'sec' })

        const tx = await supplierAdminFacet.increaseSupplierAllowance(nonOperator.address, amount, {
            gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))

        await delay({ time: 1, unit: 'sec' })

        const result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })

        const expected = BigNumber.from(2) // 1 from initial + 1 added
        expect(result.toString()).to.eq(expected.toString())
    })

    it('should allow admin to decrease supplier allowance', async function () {
        const amount = BigNumber.from(1)

        const tx = await supplierAdminFacet.decreaseSupplierAllowance(nonOperator.address, amount, {
            gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))

        await delay({ time: 1, unit: 'sec' })

        const result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })

        const expected = BigNumber.from(1) // back to initial value
        expect(result.toString()).to.eq(expected.toString())
    })

    it('should allow admin to reset supplier allowance', async function () {
        const tx = await supplierAdminFacet.resetSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))

        await delay({ time: 1, unit: 'sec' })

        const result = await supplierAdminFacet.getSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
        })

        expect(result.toString()).to.eq('0')
    })

    it('should allow admin to revoke supplier role', async function () {
        const tx = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })

        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))
    })

    it('should not allow non-admin to grant limited supplier role', async function () {
        const cashInLimit = BigNumber.from(1)

        const tx = await supplierAdminFacet.connect(nonOperator).grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))).to.be.rejectedWith(Error)
    })

    it('should not allow non-admin to grant unlimited supplier role', async function () {
        const tx = await supplierAdminFacet.connect(nonOperator).grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))).to.be.rejectedWith(Error)
    })

    it('should not allow non-admin to revoke limited supplier role', async function () {
        const cashInLimit = BigNumber.from(1)

        const grantTx = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantTx }))

        const revokeTx = await supplierAdminFacet.connect(nonOperator).revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeTx }))).to.be.rejectedWith(
            Error
        )
    })

    it('should not allow non-admin to revoke unlimited supplier role', async function () {
        const grantTx = await supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantTx }))

        const revokeTx = await supplierAdminFacet.connect(nonOperator).revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: revokeTx }))).to.be.rejectedWith(
            Error
        )
    })

    it('should allow admin to clean up supplier role after tests', async function () {
        const tx = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })

        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))
    })

    it('should allow admin to grant limited supplier role to nonOperator', async function () {
        const cashInLimit = BigNumber.from(10)
        const tx = await supplierAdminFacet.grantSupplierRole(nonOperator.address, cashInLimit, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))
    })

    it('should not allow non-admin to increase supplier allowance', async function () {
        const amount = BigNumber.from(1)
        const tx = await supplierAdminFacet
            .connect(nonOperator)
            .increaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))).to.be.rejectedWith(Error)
    })

    it('should not allow non-admin to decrease supplier allowance', async function () {
        const amount = BigNumber.from(1)
        const tx = await supplierAdminFacet
            .connect(nonOperator)
            .decreaseSupplierAllowance(nonOperator.address, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))).to.be.rejectedWith(Error)
    })

    it('should not allow non-admin to reset supplier allowance', async function () {
        const tx = await supplierAdminFacet.connect(nonOperator).resetSupplierAllowance(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))).to.be.rejectedWith(Error)
    })

    it('should allow admin to revoke the supplier role for cleanup', async function () {
        const tx = await supplierAdminFacet.revokeSupplierRole(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: tx }))
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
