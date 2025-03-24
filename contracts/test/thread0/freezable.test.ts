import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { MESSAGES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, ONE_TOKEN } from '@test/shared'

describe('➡️ Freeze Tests', function () {
    // Contracts
    let proxyAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    before(async function () {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()
        // * Deploy contracts
        ;({ proxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it("Account without FREEZE role can't freeze transfers of the token for the account", async function () {
        const response = await hederaTokenManager.connect(nonOperator).freeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it("Account with FREEZE role can freeze and unfreeze transfers of the token for the account + Account without FREEZE role can't unfreeze transfers of the token for the account", async function () {
        // Should be able to mint tokens before freezing
        const mintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
        )
        // Freeze transfers
        const freezeResponse = await hederaTokenManager.freeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.freeze,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: freezeResponse, confirmationEvent: 'TransfersFrozen' })
        )
        // Should NOT be able to mint more tokens
        const freezedMintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: freezedMintResponse }))
        ).to.be.rejectedWith(Error)
        // Should NOT be able to unfreeze from non-operator account
        const nonOperatorUnfreezeResponse = await hederaTokenManager.connect(nonOperator).unfreeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: nonOperatorUnfreezeResponse }))
        ).to.be.rejectedWith(Error)
        // Should be able to unfreeze transfers from operator account
        const unfreezeResponse = await hederaTokenManager.unfreeze(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.unfreeze,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: unfreezeResponse, confirmationEvent: 'TransfersUnfrozen' })
        )
        // Should be able to mint more tokens again
        const unfreezedMintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: unfreezedMintResponse, confirmationEvent: 'TokensMinted' })
        )
    })
})
