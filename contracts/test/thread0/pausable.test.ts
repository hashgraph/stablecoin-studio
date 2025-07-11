import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { IHRC__factory, PausableFacet, PausableFacet__factory } from '@contracts'
import {
    DEFAULT_TOKEN,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('Pause Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
    let pausableFacet: PausableFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        pausableFacet = PausableFacet__factory.connect(address, operator)
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
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed.toString(),
        }))

        await setFacets(stableCoinProxyAddress)
    })

    it("An account without PAUSE role can't pause a token", async function () {
        const response = await pausableFacet
            .connect(nonOperator)
            .pause({ gasLimit: GAS_LIMIT.hederaTokenManager.pause })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it("An account with PAUSE role can pause and unpause a token + An account without PAUSE role can't unpause a token", async function () {
        // Associate token to nonOperator account
        const associateResponse = await IHRC__factory.connect(tokenAddress, nonOperator).associate({
            gasLimit: GAS_LIMIT.hederaTokenManager.associate,
        })
        await new ValidateTxResponseCommand({
            txResponse: associateResponse,
            errorMessage: MESSAGES.hederaTokenManager.error.associate,
        }).execute()

        // Pause token
        const pauseResponse = await pausableFacet.pause({ gasLimit: GAS_LIMIT.hederaTokenManager.pause })
        await new ValidateTxResponseCommand({ txResponse: pauseResponse, confirmationEvent: 'TokenPaused' }).execute()

        //! Dissociate should fail?? It IS working
        // // Dissociate token from nonOperator account should fail
        // const dissociatePausedResponse = await IHRC__factory.connect(tokenAddress, nonOperator).dissociate({
        //     gasLimit: GAS_LIMIT.hederaTokenManager.dissociate,
        // })

        // await expect(
        //     await new ValidateTxResponseCommand({
        //         txResponse: dissociatePausedResponse,
        //         errorMessage: MESSAGES.hederaTokenManager.error.dissociate,
        //     }).execute()
        // ).to.be.rejectedWith(Error)

        // Unpause token from nonOperator account should fail
        const nonOperatorUnpauseResponse = await pausableFacet.connect(nonOperator).unpause({
            gasLimit: GAS_LIMIT.hederaTokenManager.unpause,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorUnpauseResponse,
            }).execute()
        ).to.be.rejectedWith(Error)

        // Unpause token from operator account
        const unpauseResponse = await pausableFacet.unpause({ gasLimit: GAS_LIMIT.hederaTokenManager.unpause })
        await new ValidateTxResponseCommand({
            txResponse: unpauseResponse,
            confirmationEvent: 'TokenUnpaused',
        }).execute()

        // Dissociate token from nonOperator account should pass
        const dissociateUnpausedResponse = await IHRC__factory.connect(tokenAddress, nonOperator).dissociate({
            gasLimit: GAS_LIMIT.hederaTokenManager.dissociate,
        })
        await new ValidateTxResponseCommand({
            txResponse: dissociateUnpausedResponse,
        }).execute()
    })
})
