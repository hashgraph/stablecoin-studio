import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { CashInFacet, CashInFacet__factory, FreezableFacet, FreezableFacet__factory } from '@contracts'
import {
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Freeze Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let freezableFacet: FreezableFacet
    let cashInFacet: CashInFacet

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        freezableFacet = FreezableFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
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

    it("Account without FREEZE role can't freeze transfers of the token for the account", async function () {
        const response = await freezableFacet.connect(nonOperator).freeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it("Account with FREEZE role can freeze and unfreeze transfers of the token for the account + Account without FREEZE role can't unfreeze transfers of the token for the account", async function () {
        // Should be able to mint tokens before freezing
        const mintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )
        // Freeze transfers
        const freezeResponse = await freezableFacet.freeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: freezeResponse, confirmationEvent: 'TransfersFrozen' })
        )
        // Should NOT be able to mint more tokens
        const freezedMintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: freezedMintResponse }))
        ).to.be.rejectedWith(Error)
        // Should NOT be able to unfreeze from non-operator account
        const nonOperatorUnfreezeResponse = await freezableFacet.connect(nonOperator).unfreeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: nonOperatorUnfreezeResponse }))
        ).to.be.rejectedWith(Error)
        // Should be able to unfreeze transfers from operator account
        const unfreezeResponse = await freezableFacet.unfreeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: unfreezeResponse, confirmationEvent: 'TransfersUnfrozen' })
        )
        // Should be able to mint more tokens again
        const unfreezedMintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: unfreezedMintResponse, confirmationEvent: 'TokensMinted' })
        )
    })
})
