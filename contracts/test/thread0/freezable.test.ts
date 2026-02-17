import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    FreezableFacet,
    FreezableFacet__factory,
    StableCoinTokenMock__factory,
} from '@contracts'
import { DeployFullInfrastructureCommand, MESSAGES, ROLES, ONE_TOKEN, ADDRESS_ZERO } from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Freeze Tests', function () {
    const ACCOUNT_FROZEN_FOR_TOKEN = 165

    // Contracts
    let stableCoinProxyAddress: string
    let freezableFacet: FreezableFacet
    let cashInFacet: CashInFacet
    let tokenAddress: string

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        freezableFacet = FreezableFacet__factory.connect(address, operator)
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
    })

    it("Account without FREEZE role can't freeze transfers of the token for the account", async function () {
        freezableFacet = freezableFacet.connect(nonOperator)
        await expect(
            freezableFacet.freeze(operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
            })
        )
            .to.be.revertedWithCustomError(freezableFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.freeze.hash)
    })

    it("Account with FREEZE role can't freeze address zero account", async function () {
        freezableFacet = freezableFacet.connect(operator)
        await expect(
            freezableFacet.freeze(ADDRESS_ZERO, {
                gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
            })
        )
            .to.be.revertedWithCustomError(freezableFacet, 'AddressZero')
            .withArgs(ADDRESS_ZERO)
    })

    it("Account with FREEZE role can't unfreeze address zero account", async function () {
        freezableFacet = freezableFacet.connect(operator)
        await expect(
            freezableFacet.unfreeze(ADDRESS_ZERO, {
                gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
            })
        )
            .to.be.revertedWithCustomError(freezableFacet, 'AddressZero')
            .withArgs(ADDRESS_ZERO)
    })

    it("Account with FREEZE role can freeze and unfreeze transfers of the token for the account + Account without FREEZE role can't unfreeze transfers of the token for the account", async function () {
        // Should be able to mint tokens before freezing
        await expect(
            cashInFacet.mint(operator.address, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)

        // Freeze transfers
        await expect(
            freezableFacet.freeze(operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
            })
        )
            .to.emit(freezableFacet, 'TransfersFrozen')
            .withArgs(tokenAddress, operator.address)

        // Should NOT be able to mint more tokens
        await expect(
            cashInFacet.mint(operator.address, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.be.revertedWithCustomError(cashInFacet, 'ResponseCodeInvalid')
            .withArgs(ACCOUNT_FROZEN_FOR_TOKEN)

        // Should NOT be able to unfreeze from non-operator account
        freezableFacet = freezableFacet.connect(nonOperator)
        await expect(
            freezableFacet.unfreeze(operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
            })
        )
            .to.be.revertedWithCustomError(freezableFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.freeze.hash)

        // Should be able to unfreeze transfers from operator account
        freezableFacet = freezableFacet.connect(operator)
        await expect(
            freezableFacet.unfreeze(operator.address, {
                gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
            })
        )
            .to.emit(freezableFacet, 'TransfersUnfrozen')
            .withArgs(tokenAddress, operator.address)

        // Should be able to mint more tokens again
        await expect(
            cashInFacet.mint(operator.address, ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)
    })
})
