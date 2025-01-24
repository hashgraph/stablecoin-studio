import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { deployFullInfrastructureInTests, INIT_SUPPLY, GAS_LIMIT } from '@test/shared'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { validateTxResponse, ValidateTxResponseCommand } from '@scripts'

let proxyAddress: string
let hederaTokenManager: HederaTokenManager

describe('Burn Tests', function () {
    before(async function () {
        // Disable | Mock console.log()
        // console.log = () => {}
        // * Deploy StableCoin Token
        const [signer] = await ethers.getSigners()
        proxyAddress = await deployFullInfrastructureInTests(signer)
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, signer)
    })

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async function () {
        const tokensToBurn = INIT_SUPPLY.div(10)

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await hederaTokenManager.totalSupply()

        // burn some tokens
        const burnResponse = await hederaTokenManager.burn(tokensToBurn, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: burnResponse }))

        // check new total supply and balance of treasury account : success
        const finalTotalSupply = await hederaTokenManager.totalSupply()
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async function () {
        // Retrieve original total supply
        const currentTotalSupply = await hederaTokenManager.totalSupply()

        // burn more tokens than original total supply : fail
        await expect(
            hederaTokenManager.burn(currentTotalSupply.add(1), {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    })

    it('Account with BURN role cannot burn a negative amount', async function () {
        // burn a negative amount of tokens : fail
        await expect(
            hederaTokenManager.burn(BigNumber.from('-1'), {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        ).to.be.revertedWith('SafeMath: subtraction overflow')
    })

    it('Account without BURN role cannot burn tokens', async function () {
        const [_, nonOperator] = await ethers.getSigners()
        const nonOperatorHederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, nonOperator)

        // Account without burn role, burns tokens : fail
        await expect(
            nonOperatorHederaTokenManager.burn(BigNumber.from(1), {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        ).to.be.revertedWith('AccessControl: account does not have burn role')
    })
})
