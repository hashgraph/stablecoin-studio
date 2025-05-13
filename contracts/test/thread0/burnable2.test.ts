import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'
import {
    BurnableFacet__factory,
    BusinessLogicResolver,
    IStableCoinFactory,
    HederaTokenManagerFacet__factory,
    HederaTokenManagerFacet,
    BurnableFacet,
} from '@typechain-types'
import {
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, INIT_SUPPLY, GAS_LIMIT } from '@test/shared'
import { NetworkName } from '@configuration'

describe('Burn Tests de prueba', () => {
    // Contracts
    let tokenAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let burnFacet: BurnableFacet
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress

    let factory: string
    let businessLogicResolver: string
    // Accounts
    // let operator: SignerWithAddress
    // let nonOperator: SignerWithAddress

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[signer_A, signer_B] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: signer_A,
                useDeployed: false,
                useEnvironment: true,
            })
        )

        factory = deployedContracts.stableCoinFactoryFacet.proxyAddress!
        businessLogicResolver = deployedContracts.businessLogicResolver.proxyAddress!
    })

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;({ tokenAddress } = await deployStableCoinInTests({
            signer: signer_A,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: factory,
            network: network.name as NetworkName,
        }))
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(tokenAddress, signer_A)
        burnFacet = BurnableFacet__factory.connect(tokenAddress, signer_A)
    })

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async () => {
        const tokensToBurn = INIT_SUPPLY.div(10)

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply()

        // burn some tokens
        const burnResponse = await burnFacet.burn(1, {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: burnResponse, confirmationEvent: 'TokensBurned' })
        )
        // check new total supply and balance of treasury account : success
        await delay({ time: 1, unit: 'sec' })
        const finalTotalSupply = await hederaTokenManagerFacet.totalSupply()
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async () => {
        // Retrieve original total supply
        const currentTotalSupply = await hederaTokenManagerFacet.totalSupply()

        // burn more tokens than original total supply : fail
        const response = await burnFacet.burn(currentTotalSupply.add(1), {
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
        const nonOperatorBurnableFacet = BurnableFacet__factory.connect(tokenAddress, signer_B)

        // Account without burn role, burns tokens : fail
        const result = await nonOperatorBurnableFacet.burn(BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.burn,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })
})
