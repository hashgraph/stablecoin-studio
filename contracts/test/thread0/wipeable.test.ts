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
} from '@contracts'
import {
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Wipe Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let wipeFacet: WipeableFacet
    let cashInFacet: CashInFacet

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

    it('Account with WIPE role can wipe 10 tokens from an account with 20 tokens', async function () {
        const tokensToMint = 20n * ONE_TOKEN
        const tokensToWipe = 10n * ONE_TOKEN

        // Mint 20 tokens
        const mintResponse = await cashInFacet.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Get the initial total supply and account's balanceOf
        await delay({ time: 1, unit: 'sec' })
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const initialBalanceOf = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Wipe 10 tokens
        const wipeResponse = await wipeFacet.wipe(operator.address, tokensToWipe, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: wipeResponse, confirmationEvent: 'TokensWiped' })
        )

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
        const mintResponse = await cashInFacet.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Get the current balance for account
        await delay({ time: 1, unit: 'sec' })
        const currentBalance = await hederaTokenManagerFacet.balanceOf(operator.address)

        // Wipe more than account's balance : fail
        const wipeResponse = await wipeFacet.wipe(operator.address, currentBalance + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: wipeResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('Account with WIPE role cannot wipe a negative amount', async function () {
        // Wipe a negative amount of tokens : fail
        const wipeResponse = await wipeFacet.wipe(operator.address, -1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: wipeResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('Account without WIPE role cannot wipe tokens', async function () {
        const tokensToMint = 20n * ONE_TOKEN

        // Mint 20 tokens
        const mintResponse = await cashInFacet.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Wipe with account that does not have the wipe role: fail
        const nonOperatorWipeResponse = await wipeFacet.connect(nonOperator).wipe(operator.address, 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: nonOperatorWipeResponse }))
        ).to.be.rejectedWith(Error)
    })
})
