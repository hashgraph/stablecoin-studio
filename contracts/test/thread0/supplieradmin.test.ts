import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
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
    StableCoinTokenMock__factory,
} from '@contracts'
import {
    ADDRESS_ZERO,
    DEFAULT_TOKEN,
    delay,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'

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

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
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
        expect(
            await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)

        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq('0')
    })

    it('should allow admin to grant limited supplier role', async function () {
        const cashInLimit = 1

        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)

        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq(cashInLimit.toString())
    })

    it('should allow admin to revoke limited supplier role', async function () {
        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)

        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq('0')
    })

    it('should allow admin to grant unlimited supplier role', async function () {
        expect(
            await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        ).to.eq(false)

        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        ).to.eq(true)

        expect(
            await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(true)
    })

    it('should allow admin to revoke unlimited supplier role', async function () {
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
            })
        ).to.eq(false)

        expect(
            await rolesFacet.hasRole(ROLES.cashin.hash, nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.hasRole,
            })
        ).to.equal(false)
    })

    it('should allow admin to grant supplier role', async function () {
        const cashInLimit = 1n

        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
    })

    it('should allow admin to increase supplier allowance', async function () {
        const amount = 1n

        await delay({ time: 1, unit: 'sec' })

        await expect(
            supplierAdminFacet.increaseSupplierAllowance(nonOperator, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })
        )
            .to.emit(supplierAdminFacet, 'SupplierAllowanceIncreased')
            .withArgs(operator.address, nonOperator.address, amount, 1, 2)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq('2')
    })

    it('should allow admin to decrease supplier allowance', async function () {
        const amount = 1n

        await expect(
            supplierAdminFacet.decreaseSupplierAllowance(nonOperator, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })
        )
            .to.emit(supplierAdminFacet, 'SupplierAllowanceDecreased')
            .withArgs(operator.address, nonOperator.address, amount, 2, 1)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq('1')
    })

    it('should allow admin to reset supplier allowance', async function () {
        await expect(
            supplierAdminFacet.resetSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
            })
        )
            .to.emit(supplierAdminFacet, 'SupplierAllowanceReset')
            .withArgs(operator.address, nonOperator.address, 1, 0)

        await delay({ time: 1, unit: 'sec' })

        expect(
            await supplierAdminFacet.getSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.getSupplierAllowance,
            })
        ).to.eq('0')
    })

    it('should allow admin to revoke supplier role', async function () {
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
    })

    it('should not allow non-admin to grant limited supplier role', async function () {
        const cashInLimit = 1n
        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)

        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should not allow non-admin to grant unlimited supplier role', async function () {
        await expect(
            supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should not allow non-admin to revoke limited supplier role', async function () {
        const cashInLimit = 1n

        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should not allow non-admin to revoke unlimited supplier role', async function () {
        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should allow admin to clean up supplier role after tests', async function () {
        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
    })

    it('should allow admin to grant limited supplier role to nonOperator', async function () {
        const cashInLimit = 10n
        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, cashInLimit, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
    })

    it('should not allow non-admin to increase supplier allowance', async function () {
        const amount = 1n
        supplierAdminFacet = supplierAdminFacet.connect(nonOperator)
        await expect(
            supplierAdminFacet.increaseSupplierAllowance(nonOperator, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should not allow non-admin to decrease supplier allowance', async function () {
        const amount = 1n
        await expect(
            supplierAdminFacet.decreaseSupplierAllowance(nonOperator, amount, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should not allow non-admin to reset supplier allowance', async function () {
        await expect(
            supplierAdminFacet.resetSupplierAllowance(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.resetSupplierAllowance,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('should allow admin to revoke the supplier role for cleanup', async function () {
        supplierAdminFacet = supplierAdminFacet.connect(operator)
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
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

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
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

        await StableCoinTokenMock__factory.connect(tokenAddress, operator).setStableCoinAddress(stableCoinProxyAddress)

        await setFacets(stableCoinProxyAddress)

        // Grant unlimited supplier role
        await expect(
            supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        // Associate token to nonOperator account
        const associateResponse = await IHRC__factory.connect(tokenAddress, nonOperator).associate({
            gasLimit: GAS_LIMIT.hederaTokenManager.associate,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: associateResponse }))
    })

    it('An account with unlimited supplier role can cash in 100 tokens to the treasury account', async function () {
        const AmountToMint = 100n * ONE_TOKEN

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Cashin tokens to previously associated account
        await expect(
            cashInFacet.mint(operator.address, AmountToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, AmountToMint, operator.address)

        await delay({ time: 1.5, unit: 'sec' })
        // Check balance of account and total supply : success
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const finalBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)
        const expectedTotalSupply = initialTotalSupply + AmountToMint
        const expectedBalanceOf = initialBalanceOf + AmountToMint

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can cash in 100 tokens', async function () {
        const AmountToMint = 100n * ONE_TOKEN

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(nonOperator)

        // Cashin tokens to previously associated account
        await expect(
            cashInFacet.mint(nonOperator.address, AmountToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, AmountToMint, nonOperator.address)

        // Check balance of account and total supply : success
        await delay({ time: 1.5, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const finalBalanceOf = await hederaTokenManagerFacet.balanceOf(nonOperator)
        const expectedTotalSupply = initialTotalSupply + AmountToMint
        const expectedBalanceOf = initialBalanceOf + AmountToMint

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it('An account with unlimited supplier role can not cash in more than maxSupply tokens', async function () {
        // Retrieve current total supply
        const TotalSupply = await hederaTokenManagerFacet.totalSupply()

        // Cashin more tokens than max supply : fail
        await expect(
            cashInFacet.mint(nonOperator, DEFAULT_TOKEN.maxSupply - TotalSupply + 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.be.revertedWithCustomError(cashInFacet, 'FormatNumberIncorrect')
            .withArgs(DEFAULT_TOKEN.maxSupply - TotalSupply + 1n)
    })

    it('An account with unlimited supplier role can not be granted limited supplier role', async function () {
        // Grant limited supplier role to account with unlimited supplier role : fail
        await expect(
            supplierAdminFacet.grantSupplierRole(nonOperator, 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantSupplierRole,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasUnlimitedSupplierAllowance')
            .withArgs(nonOperator)
    })

    it('An account with unlimited supplier role, but revoked, can not cash in anything at all', async function () {
        // Revoke unlimited supplier role
        await expect(
            supplierAdminFacet.revokeSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.revokeSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleRevoked')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)

        await delay({ time: 1, unit: 'sec' })
        // Cashin 1 token : fail
        cashInFacet = cashInFacet.connect(nonOperator)
        await expect(
            cashInFacet.mint(nonOperator, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.be.revertedWithCustomError(cashInFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.cashin.hash)

        // Grant unlimited supplier role to continue testing next tests cases
        cashInFacet = cashInFacet.connect(operator)
        await expect(
            supplierAdminFacet.grantUnlimitedSupplierRole(nonOperator, {
                gasLimit: GAS_LIMIT.hederaTokenManager.grantUnlimitedSupplierRole,
            })
        )
            .to.emit(supplierAdminFacet, 'RoleGranted')
            .withArgs(ROLES.cashin.hash, nonOperator.address, operator.address)
    })

    it('Granting unlimited or limited supplier role to address 0 fails', async function () {
        await expect(supplierAdminFacet.grantUnlimitedSupplierRole(ADDRESS_ZERO)).to.be.revertedWithCustomError(
            supplierAdminFacet,
            'AddressZero'
        )

        await expect(supplierAdminFacet.grantSupplierRole(ADDRESS_ZERO, 1)).to.be.revertedWithCustomError(
            supplierAdminFacet,
            'AddressZero'
        )
    })

    it('An account with unlimited supplier role can not increase supplier allowance', async function () {
        // Increase supplier allowance an account with unlimited supplier role : fail
        await expect(
            supplierAdminFacet.increaseSupplierAllowance(nonOperator, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.increaseSupplierAllowance,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasUnlimitedSupplierAllowance')
            .withArgs(nonOperator)
    })

    it('An account with unlimited supplier role can not decrease supplier allowance', async function () {
        // Decrease supplier allowance an account with unlimited supplier role : fail
        await expect(
            supplierAdminFacet.decreaseSupplierAllowance(nonOperator, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.decreaseSupplierAllowance,
            })
        )
            .to.be.revertedWithCustomError(supplierAdminFacet, 'AccountHasUnlimitedSupplierAllowance')
            .withArgs(nonOperator)
    })
})
