import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
  CashInFacet,
  CashInFacet__factory,
  KYCFacet,
  KYCFacet__factory,
  StableCoinTokenMock__factory,
} from '@contracts'
import {
    ADDRESS_ZERO,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    ValidateTxResponseCommand,
    DeployFullInfrastructureCommand
} from '@scripts'
import {
  deployStableCoinInTests,
  deployFullInfrastructureInTests,
  GAS_LIMIT
} from '@test/shared'

describe('➡️ KYC Tests', function () {
    const ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN = 176;

    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
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
            addKyc: true,
            grantKYCToOriginalSender: true,
        }))

        await StableCoinTokenMock__factory.connect(tokenAddress, operator)
          .setStableCoinAddress(stableCoinProxyAddress)

        await setFacets(stableCoinProxyAddress)
    })

    it("An account without KYC role can't grant kyc to an account for a token", async function () {
        kycFacet = kycFacet.connect(nonOperator)

        await expect(kycFacet.grantKyc(operator.address, {
          gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })).to.be.revertedWithCustomError(kycFacet, "AccountHasNoRole")
          .withArgs(nonOperator, ROLES.kyc.hash)
    })

    it("An account with KYC role can grant and revoke kyc to an account for a token + An account without KYC role can't revoke kyc to an account for a token", async function () {
        // Should be able to mint tokens before granting KYC
        await expect(cashInFacet.mint(operator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.emit(cashInFacet, "TokensMinted")
          .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)

        // Should not be able to revoke KYC from an account without KYC role
        kycFacet = kycFacet.connect(nonOperator)
        await expect(kycFacet.revokeKyc(operator.address, {
          gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })).to.be.revertedWithCustomError(kycFacet, "AccountHasNoRole")
          .withArgs(nonOperator, ROLES.kyc.hash)

        // Should be able to revoke KYC from an account with KYC role
        kycFacet = kycFacet.connect(operator);
        await expect(kycFacet.revokeKyc(operator.address, {
          gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })).to.emit(kycFacet, "RevokeTokenKyc")
          .withArgs(tokenAddress, operator.address)

        // Should NOT be able to mint more tokens
        await expect(cashInFacet.mint(operator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.be.revertedWithCustomError(cashInFacet, "ResponseCodeInvalid")
          .withArgs(ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN)

        // Should be able to grant KYC to an account with KYC role
        await expect(kycFacet.grantKyc(operator.address, {
          gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })).to.emit(kycFacet, "GrantTokenKyc")
          .withArgs(tokenAddress, operator.address)

        // Should be able to mint more tokens again
        await expect(cashInFacet.mint(operator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.emit(cashInFacet, "TokensMinted")
          .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)
    })

    it('An account with KYC role can`t grant and revoke kyc to the zero account for a token', async function () {
        kycFacet = kycFacet.connect(operator);

        await expect(kycFacet.grantKyc(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })).to.be.revertedWithCustomError(kycFacet, "AddressZero")

        await expect(kycFacet.revokeKyc(ADDRESS_ZERO, {
          gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })).to.be.revertedWithCustomError(kycFacet, "AddressZero")
    })
})
