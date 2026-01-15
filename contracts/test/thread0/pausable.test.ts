import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { IHRC__factory, PausableFacet, PausableFacet__factory } from '@contracts'
import {
    DEFAULT_TOKEN,
    MESSAGES,
    ROLES,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    ValidateTxResponseCommand
} from '@scripts'
import {
  deployStableCoinInTests,
  deployFullInfrastructureInTests,
  GAS_LIMIT
} from '@test/shared'

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
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed.toString(),
        }))

        await setFacets(stableCoinProxyAddress)
    })

    it("An account without PAUSE role can't pause a token", async function () {
      pausableFacet = pausableFacet.connect(nonOperator)

      await expect(pausableFacet.pause({
        gasLimit: GAS_LIMIT.hederaTokenManager.pause,
      })).to.be.revertedWithCustomError(pausableFacet, "AccountHasNoRole")
        .withArgs(nonOperator, ROLES.pause.hash)
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
        pausableFacet = pausableFacet.connect(operator)
        await expect(pausableFacet.pause({
          gasLimit: GAS_LIMIT.hederaTokenManager.pause,
        })).to.emit(pausableFacet, "TokenPaused")
          .withArgs(tokenAddress)

        pausableFacet = pausableFacet.connect(nonOperator)
        await expect(pausableFacet.unpause({
          gasLimit: GAS_LIMIT.hederaTokenManager.unpause,
        })).to.be.revertedWithCustomError(pausableFacet, "AccountHasNoRole")
          .withArgs(nonOperator, ROLES.pause.hash)

        pausableFacet = pausableFacet.connect(operator)
        await expect(pausableFacet.unpause({
          gasLimit: GAS_LIMIT.hederaTokenManager.unpause,
        })).to.emit(pausableFacet, "TokenUnpaused")
          .withArgs(tokenAddress)

        // Dissociate token from nonOperator account should pass
        const dissociateUnpausedResponse = await IHRC__factory.connect(tokenAddress, nonOperator).dissociate({
            gasLimit: GAS_LIMIT.hederaTokenManager.dissociate,
        })
        await new ValidateTxResponseCommand({
            txResponse: dissociateUnpausedResponse,
        }).execute()
    })
})
