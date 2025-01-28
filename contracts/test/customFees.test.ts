import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { HederaTokenManager, HederaTokenManager__factory, IHederaTokenService, IHRC__factory } from '@typechain'
import { ADDRESS_ZERO, MESSAGES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'

describe('Custom Fees Tests', function () {
    let proxyAddress: string
    let tokenAddress: string
    let hederaTokenManager: HederaTokenManager

    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    let fixedFees: IHederaTokenService.FixedFeeStruct[]
    let fractionalFees: IHederaTokenService.FractionalFeeStruct[]

    before(async function () {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info('Deploying full infrastructure...')
        ;[operator, nonOperator] = await ethers.getSigners()
        // if ((network.name as Network) === NETWORK_LIST.name[0]) {
        //     await deployPrecompiledHederaTokenServiceMock(hre, signer)
        // }
        ;({ proxyAddress, tokenAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            addFeeSchedule: true,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)

        // This test specific
        fixedFees = [
            {
                amount: 1n,
                tokenId: tokenAddress,
                useHbarsForPayment: true,
                useCurrentTokenForPayment: false,
                feeCollector: ADDRESS_ZERO,
            },
        ]
        fractionalFees = [
            {
                numerator: 1n,
                denominator: 1n,
                maximumAmount: 1n,
                minimumAmount: 1n,
                netOfTransfers: false,
                feeCollector: ADDRESS_ZERO,
            },
        ]
    })

    it("An account without CUSTOM_FEES role can't update custom fees for a token", async function () {
        const response = await hederaTokenManager.updateTokenCustomFees(fixedFees, fractionalFees, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateCustomFees,
        })
        await expect(
            validateTxResponse(
                new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenCustomFeesUpdated' })
            )
        ).to.be.rejectedWith(Error)
    })

    it('An account with CUSTOM_FEES role can update custom fees for a token and fees should be updated correctly', async function () {
        // Associate token with nonOperator
        const associateResponse = await IHRC__factory.connect(tokenAddress, nonOperator).associate({
            gasLimit: GAS_LIMIT.hederaTokenManager.associate,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: associateResponse,
                errorMessage: MESSAGES.hederaTokenManager.error.associate,
            })
        )
        // Change fee collector to nonOperator
        fixedFees[0].feeCollector = nonOperator.address
        fractionalFees[0].feeCollector = nonOperator.address

        const response = await hederaTokenManager.updateTokenCustomFees(fixedFees, fractionalFees, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateCustomFees,
        })

        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenCustomFeesUpdated' })
        )

        // TODO: update
        // const customFees = await getTokenCustomFees(
        //     proxyAddress,
        //     operatorClient
        // )
        // expect(customFees.fixedFees[0].amount).to.equal(bigNumberOne.toString())
        // expect(customFees.fractionalFees[0].numerator).to.equal(
        //     bigNumberOne.toString()
        // )
    })
})
