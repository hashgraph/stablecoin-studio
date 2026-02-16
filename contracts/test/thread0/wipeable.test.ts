import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    HederaTokenManagerFacet,
    HederaTokenManagerFacet__factory,
    WipeableFacet,
    WipeableFacet__factory,
    StableCoinTokenMock__factory,
} from '@contracts'
import {
  delay,
  DeployFullInfrastructureCommand,
  ADDRESS_ZERO,
  MESSAGES,
  ONE_TOKEN,
  ROLES
} from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Wipe Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let wipeFacet: WipeableFacet
    let cashInFacet: CashInFacet
    let tokenAddress: string

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        wipeFacet = WipeableFacet__factory.connect(address, operator)
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

    it('Account without WIPE role cannot wipe tokens', async function () {
        const tokensToMint = 20n * ONE_TOKEN

        // Mint 20 tokens
        await expect(
            cashInFacet.mint(operator.address, tokensToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, tokensToMint, operator.address)

        wipeFacet = wipeFacet.connect(nonOperator)
        await expect(
            wipeFacet.wipe(operator.address, 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        )
            .to.be.revertedWithCustomError(wipeFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.wipe.hash)
    })

    it('Account with WIPE role cannot wipe in address zero account', async function () {
        // Wipe in zero address account : fail
        wipeFacet = wipeFacet.connect(operator)
        await expect(
            wipeFacet.wipe(ADDRESS_ZERO, 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        )
            .to.be.revertedWithCustomError(wipeFacet, 'AddressZero')
            .withArgs(ADDRESS_ZERO)
    })

    it('Account with WIPE role cannot wipe a negative amount', async function () {
        // Wipe a negative amount of tokens : fail
        wipeFacet = wipeFacet.connect(operator)
        await expect(
            wipeFacet.wipe(operator.address, -1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        )
            .to.be.revertedWithCustomError(wipeFacet, 'NegativeAmount')
            .withArgs(-1n)
    })

    it('Account with WIPE role can wipe 10 tokens from an account with 20 tokens', async function () {
        const tokensToMint = 20n * ONE_TOKEN
        const tokensToWipe = 10n * ONE_TOKEN

        // Mint 20 tokens
        await expect(
            cashInFacet.mint(operator.address, tokensToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, tokensToMint, operator.address)

        // Get the initial total supply and account's balanceOf
        await delay({ time: 1, unit: 'sec' })
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Wipe 10 tokens
        wipeFacet = wipeFacet.connect(operator)
        await expect(
            wipeFacet.wipe(operator.address, tokensToWipe, {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        )
            .to.emit(wipeFacet, 'TokensWiped')
            .withArgs(operator.address, tokenAddress, operator.address, tokensToWipe)

        // Check balance of account and total supply : success
        await delay({ time: 1, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const finalBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)
        const expectedTotalSupply = initialTotalSupply - tokensToWipe
        const expectedBalanceOf = initialBalanceOf - tokensToWipe

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it("Account with WIPE role cannot wipe more than account's balance", async function () {
        const tokensToMint = 20n * ONE_TOKEN

        // Mint 20 tokens
        await expect(
            cashInFacet.mint(operator.address, tokensToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
        )
            .to.emit(cashInFacet, 'TokensMinted')
            .withArgs(operator.address, tokenAddress, tokensToMint, operator.address)

        // Get the current balance for account
        await delay({ time: 1, unit: 'sec' })
        const currentBalance = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Wipe more than account's balance : fail
        await expect(
            wipeFacet.wipe(operator.address, currentBalance + 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        )
            .to.be.revertedWithCustomError(wipeFacet, 'GreaterThan')
            .withArgs(currentBalance + 1n, currentBalance)
    })
})
