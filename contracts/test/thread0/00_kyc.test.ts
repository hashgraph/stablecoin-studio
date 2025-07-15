import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { CashInFacet, CashInFacet__factory, KYCFacet, KYCFacet__factory } from '@contracts'
import {
    ADDRESS_ZERO,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ KYC Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let kycFacet: KYCFacet
    let cashInFacet: CashInFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        kycFacet = KYCFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        // console.log = () => {} // eslint-disable-line
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
            addKyc: true,
            grantKYCToOriginalSender: true,
        }))
        await setFacets(stableCoinProxyAddress)
    })

    it("An account without KYC role can't grant kyc to an account for a token", async function () {
        const response = await kycFacet
            .connect(nonOperator)
            .grantKyc(operator.address, { gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: response,
                errorMessage: MESSAGES.hederaTokenManager.error.grantKyc,
            }).execute()
        ).to.be.rejectedWith(Error)
    })

    it("An account with KYC role can grant and revoke kyc to an account for a token + An account without KYC role can't revoke kyc to an account for a token", async function () {
        // Should be able to mint tokens before granting KYC
        const mintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' }).execute()

        // Should not be able to revoke KYC from an account without KYC role
        const nonOperatorRevokeResponse = await kycFacet.connect(nonOperator).revokeKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorRevokeResponse,
            }).execute()
        ).to.be.rejectedWith(Error)

        // Should be able to revoke KYC from an account with KYC role
        const revokeResponse = await kycFacet.revokeKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await new ValidateTxResponseCommand({
            txResponse: revokeResponse,
            confirmationEvent: 'RevokeTokenKyc',
        }).execute()

        // Should NOT be able to mint more tokens
        const revokedMintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: revokedMintResponse }).execute()).to.be.rejectedWith(
            Error
        )

        // Should be able to grant KYC to an account with KYC role
        const grantResponse = await kycFacet.grantKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantResponse,
            confirmationEvent: 'GrantTokenKyc',
        }).execute()

        // Should be able to mint more tokens again
        const grantedMintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantedMintResponse,
            confirmationEvent: 'TokensMinted',
        }).execute()
    })

    it('An account with KYC role can`t grant and revoke kyc to the zero account for a token', async function () {
        const grantResponse = await kycFacet.grantKyc(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: grantResponse }).execute()).to.be.rejectedWith(Error)

        const revokeResponse = await kycFacet.revokeKyc(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: revokeResponse }).execute()).to.be.rejectedWith(Error)
    })
})
