import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { delay, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, ONE_TOKEN } from '@test/shared'
import { BigNumber } from 'ethers'

describe('➡️ Wipe Tests', function () {
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
        console.info('  🏗️ Deploying full infrastructure...')
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

    it('Account with WIPE role can wipe 10 tokens from an account with 20 tokens', async function () {
        const tokensToMint = BigNumber.from(20).mul(ONE_TOKEN)
        const tokensToWipe = BigNumber.from(10).mul(ONE_TOKEN)

        // Mint 20 tokens
        const mintResponse = await hederaTokenManager.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await hederaTokenManager.totalSupply()
        const initialBalanceOf = await hederaTokenManager.balanceOf(operator.address)

        // Wipe 10 tokens
        const wipeResponse = await hederaTokenManager.wipe(operator.address, tokensToWipe, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: wipeResponse, confirmationEvent: 'TokensWiped' })
        )

        // Check balance of account and total supply : success
        const finalTotalSupply = await hederaTokenManager.totalSupply()
        const finalBalanceOf = await hederaTokenManager.balanceOf(operator.address)
        const expectedTotalSupply = initialTotalSupply.sub(tokensToWipe)
        const expectedBalanceOf = initialBalanceOf.sub(tokensToWipe)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it("Account with WIPE role cannot wipe more than account's balance", async function () {
        const tokensToMint = BigNumber.from(20).mul(ONE_TOKEN)

        // Mint 20 tokens
        const mintResponse = await hederaTokenManager.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Get the current balance for account
        await delay({ time: 1, unit: 'sec' })
        const currentBalance = await hederaTokenManager.balanceOf(operator.address)

        // Wipe more than account's balance : fail
        const wipeResponse = await hederaTokenManager.wipe(operator.address, currentBalance.add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: wipeResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('Account with WIPE role cannot wipe a negative amount', async function () {
        // Wipe a negative amount of tokens : fail
        const wipeResponse = await hederaTokenManager.wipe(operator.address, -1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: wipeResponse }))
        ).to.be.rejectedWith(Error)
    })

    it('Account without WIPE role cannot wipe tokens', async function () {
        const tokensToMint = BigNumber.from(20).mul(ONE_TOKEN)

        // Mint 20 tokens
        const mintResponse = await hederaTokenManager.mint(operator.address, tokensToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )

        // Wipe with account that does not have the wipe role: fail
        const nonOperatorWipeResponse = await hederaTokenManager
            .connect(nonOperator)
            .wipe(operator.address, BigNumber.from(1), {
                gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
            })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: nonOperatorWipeResponse }))
        ).to.be.rejectedWith(Error)
    })
})
