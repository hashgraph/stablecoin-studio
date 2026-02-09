import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    BurnableFacet__factory,
    HederaTokenManagerFacet__factory,
    HederaTokenManagerFacet,
    BurnableFacet,
    StableCoinTokenMock__factory,
} from '@contracts'
import { DEFAULT_TOKEN, MESSAGES, ROLES, delay, DeployFullInfrastructureCommand } from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Burn Tests', () => {
    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
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
        //console.log = () => {} // eslint-disable-line
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
        }))

        await StableCoinTokenMock__factory.connect(tokenAddress, operator).setStableCoinAddress(stableCoinProxyAddress)

        await setFacets(stableCoinProxyAddress)
    })

    it('Account without BURN role cannot burn tokens', async () => {
        burnFacet = burnFacet.connect(nonOperator)

        await expect(
            burnFacet.burn(1, {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        )
            .to.be.revertedWithCustomError(burnFacet, 'AccountHasNoRole')
            .withArgs(nonOperator, ROLES.burn.hash)
    })

    it('Account with BURN role cannot burn a negative amount', async () => {
        burnFacet = burnFacet.connect(operator)

        await expect(
            burnFacet.burn(-1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        )
            .to.be.revertedWithCustomError(burnFacet, 'NegativeAmount')
            .withArgs(-1n)
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async () => {
        // Retrieve original total supply
        const currentTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const burnableAmount = await burnFacet.getBurnableAmount()

        // burn more tokens than original total supply : fail
        await expect(
            burnFacet.burn(currentTotalSupply + 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        )
            .to.be.revertedWithCustomError(burnFacet, 'BurnableAmountExceeded')
            .withArgs(burnableAmount)
    })

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async () => {
        const tokensToBurn = DEFAULT_TOKEN.initialSupply / 10n

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()

        console.log(await burnFacet.getBurnableAmount())

        // burn some tokens
        await expect(
            burnFacet.burn(tokensToBurn, {
                gasLimit: GAS_LIMIT.hederaTokenManager.burn,
            })
        )
            .to.emit(burnFacet, 'TokensBurned')
            .withArgs(operator.address, tokenAddress, tokensToBurn)

        // check new total supply and balance of treasury account : success
        await delay({ time: 1, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const expectedTotalSupply = initialTotalSupply - tokensToBurn

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })
})
