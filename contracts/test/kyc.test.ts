import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { ADDRESS_ZERO, MESSAGES, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, ONE_TOKEN } from '@test/shared'

describe('➡️ KYC Tests', function () {
    // Contracts
    let proxyAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    before(async function () {
        // Disable | Mock console.log()
        // console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info('  🏗️ Deploying full infrastructure...')
        ;[operator, nonOperator] = await ethers.getSigners()
        // if ((network.name as NetworkName) === NETWORK_LIST.name[0]) {
        //     await deployPrecompiledHederaTokenServiceMock(hre, signer)
        // }
        ;({ proxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
            addFeeSchedule: true,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it("An account without KYC role can't grant kyc to an account for a token", async function () {
        const response = await hederaTokenManager
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
        const mintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' }).execute()
        console.log('Mint ok')
        // Should not be able to revoke KYC from an account without KYC role
        const nonOperatorRevokeResponse = await hederaTokenManager.connect(nonOperator).revokeKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await expect(
            new ValidateTxResponseCommand({
                txResponse: nonOperatorRevokeResponse,
            }).execute()
        ).to.be.rejectedWith(Error)

        // Should be able to revoke KYC from an account with KYC role
        const revokeResponse = await hederaTokenManager.revokeKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await new ValidateTxResponseCommand({
            txResponse: revokeResponse,
            confirmationEvent: 'RevokeTokenKyc',
        }).execute()
        console.log('Revoke ok')

        // Should NOT be able to mint more tokens
        const revokedMintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: revokedMintResponse }).execute()).to.be.rejectedWith(
            Error
        )

        // Should be able to grant KYC to an account with KYC role
        const grantResponse = await hederaTokenManager.grantKyc(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantResponse,
            confirmationEvent: 'GrantTokenKyc',
        }).execute()
        console.log('Grant ok')

        // Should be able to mint more tokens again
        const grantedMintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({
            txResponse: grantedMintResponse,
            confirmationEvent: 'TokensMinted',
        }).execute()
        console.log('Mint ok')
    })

    it('An account with KYC role can`t grant and revoke kyc to the zero account for a token', async function () {
        const grantResponse = await hederaTokenManager.grantKyc(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: grantResponse }).execute()).to.be.rejectedWith(Error)

        const revokeResponse = await hederaTokenManager.revokeKyc(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.hederaTokenManager.revokeKyc,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: revokeResponse }).execute()).to.be.rejectedWith(Error)
    })
})
