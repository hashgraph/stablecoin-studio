import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { delay, MESSAGES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, INIT_SUPPLY, GAS_LIMIT } from '@test/shared'
import { NetworkName } from '@configuration'

describe('➡️ Burn Tests', () => {
    // Contracts
    let proxyAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    before(async () => {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()
        // * Deploy contracts
        ;({ proxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async () => {
        const tokensToBurn = INIT_SUPPLY.div(10)

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await hederaTokenManager.totalSupply()

        // burn some tokens
        const burnResponse = await hederaTokenManager.burn(tokensToBurn, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: burnResponse, confirmationEvent: 'TokensBurned' })
        )
        // check new total supply and balance of treasury account : success
        await delay({ time: 1, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManager.totalSupply()
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async () => {
        // Retrieve original total supply
        const currentTotalSupply = await hederaTokenManager.totalSupply()

        // burn more tokens than original total supply : fail
        const response = await hederaTokenManager.burn(currentTotalSupply.add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Account with BURN role cannot burn a negative amount', async () => {
        // burn a negative amount of tokens : fail
        const response = await hederaTokenManager.burn(-1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Account without BURN role cannot burn tokens', async () => {
        const nonOperatorHederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, nonOperator)

        // Account without burn role, burns tokens : fail
        const result = await nonOperatorHederaTokenManager.burn(BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })
})
