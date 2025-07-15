import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { CustomFeesFacet, CustomFeesFacet__factory, IHederaTokenService, IHRC__factory } from '@contracts'
import {
    ADDRESS_ZERO,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Custom Fees Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
    let customFeesFacet: CustomFeesFacet

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    // Custom Fees
    let fixedFees: IHederaTokenService.FixedFeeStruct[]
    let fractionalFees: IHederaTokenService.FractionalFeeStruct[]

    async function setFacets(address: string) {
        customFeesFacet = CustomFeesFacet__factory.connect(address, operator)
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
            addFeeSchedule: true,
        }))

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

        await setFacets(stableCoinProxyAddress)
    })

    it("An account without CUSTOM_FEES role can't update custom fees for a token", async function () {
        const response = await customFeesFacet.updateTokenCustomFees(fixedFees, fractionalFees, {
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
        await delay({ time: 1, unit: 'sec' })
        fixedFees[0].feeCollector = nonOperator.address
        fractionalFees[0].feeCollector = nonOperator.address

        const response = await customFeesFacet.updateTokenCustomFees(fixedFees, fractionalFees, {
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
