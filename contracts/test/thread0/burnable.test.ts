import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    BurnableFacet__factory,
    HederaTokenManagerFacet__factory,
    HederaTokenManagerFacet,
    BurnableFacet,
} from '@contracts'
import {
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Burn Tests', () => {
    // Contracts
    let stableCoinProxyAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let burnFacet: BurnableFacet

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        burnFacet = BurnableFacet__factory.connect(address, operator)
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

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async () => {
        const tokensToBurn = DEFAULT_TOKEN.initialSupply / 10n

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()

        // burn some tokens
        const burnResponse = await burnFacet.burn(tokensToBurn, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: burnResponse, confirmationEvent: 'TokensBurned' })
        )
        // check new total supply and balance of treasury account : success
        await delay({ time: 1, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const expectedTotalSupply = initialTotalSupply - tokensToBurn

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async () => {
        // Retrieve original total supply
        const currentTotalSupply = await hederaTokenManagerFacet.totalSupply()

        // burn more tokens than original total supply : fail
        const response = await burnFacet.burn(currentTotalSupply + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Account with BURN role cannot burn a negative amount', async () => {
        // burn a negative amount of tokens : fail
        const response = await burnFacet.burn(-1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Account without BURN role cannot burn tokens', async () => {
        const nonOperatorBurnableFacet = BurnableFacet__factory.connect(stableCoinProxyAddress, nonOperator)

        // Account without burn role, burns tokens : fail
        const result = await nonOperatorBurnableFacet.burn(1, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })
})
