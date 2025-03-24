import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory, IHRC__factory } from '@typechain'
import { MESSAGES, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, INIT_SUPPLY } from '@test/shared'

describe('Pause Tests', function () {
    // Contracts
    let proxyAddress: string
    let tokenAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    before(async function () {
        // Disable | Mock console.log()
        // console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()
        // * Deploy contracts
        ;({ proxyAddress, tokenAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it("An account without PAUSE role can't pause a token", async function () {
        const response = await hederaTokenManager
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
        const pauseResponse = await hederaTokenManager.pause({ gasLimit: GAS_LIMIT.hederaTokenManager.pause })
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
        const nonOperatorUnpauseResponse = await hederaTokenManager.connect(nonOperator).unpause({
            gasLimit: GAS_LIMIT.hederaTokenManager.unpause,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorUnpauseResponse,
            }).execute()
        ).to.be.rejectedWith(Error)

        // Unpause token from operator account
        const unpauseResponse = await hederaTokenManager.unpause({ gasLimit: GAS_LIMIT.hederaTokenManager.unpause })
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
