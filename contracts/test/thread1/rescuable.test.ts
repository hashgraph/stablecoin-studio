import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { WEIBARS_PER_TINYBAR } from '@configuration'
import {
    HederaTokenManagerFacet,
    HederaTokenManagerFacet__factory,
    RescuableFacet,
    RescuableFacet__factory,
    StableCoinTokenMock__factory,
} from '@contracts'
import {
    delay,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_HBAR,
    ONE_TOKEN,
    TEN_TOKENS,
    TWO_HBAR,
    ROLES,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'
import { TransactionRequest } from 'ethers'

describe('➡️ Rescue Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let tokenAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let rescuableFacet: RescuableFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        rescuableFacet = RescuableFacet__factory.connect(address, operator)
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
        }))

        await StableCoinTokenMock__factory.connect(tokenAddress, operator).setStableCoinAddress(stableCoinProxyAddress)

        await setFacets(stableCoinProxyAddress)

        // HBAR Transfer
        const transferTx = {
            to: stableCoinProxyAddress,
            value: TWO_HBAR,
            gasLimit: GAS_LIMIT.transfer,
            chainId: network.config.chainId,
        } as TransactionRequest
        const response = await operator.sendTransaction(transferTx)
        await new ValidateTxResponseCommand({ txResponse: response }).execute()
    })

    it('Account with RESCUE role can rescue 10 tokens', async function () {
        // Get the initial balance of the token owner and client
        const initialTokenOwnerBalance = await hederaTokenManagerFacet.balanceOf(stableCoinProxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        const initialClientBalance = await hederaTokenManagerFacet.balanceOf(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })

        // rescue some tokens
        const response = await rescuableFacet.rescue(TEN_TOKENS, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
        })
        await new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenRescued' }).execute()

        await delay({ time: 1, unit: 'sec' })
        // check new balances : success
        const finalTokenOwnerBalance = await hederaTokenManagerFacet.balanceOf(stableCoinProxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        const finalClientBalance = await hederaTokenManagerFacet.balanceOf(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })

        const expectedTokenOwnerBalance = initialTokenOwnerBalance - TEN_TOKENS
        const expectedClientBalance = initialClientBalance + TEN_TOKENS

        expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString())
        expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString())
    })

    it('Account with RESCUE role cannot rescue zero or less tokens', async function () {
        await expect(
            rescuableFacet.rescue(0, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
            })
        )
            .to.be.revertedWithCustomError(rescuableFacet, 'NegativeAmount')
            .withArgs(0)
    })

    it('Account with RESCUE role cannot rescue more tokens than the token owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await hederaTokenManagerFacet.balanceOf(stableCoinProxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        // Rescue TokenOwnerBalance + 1 : fail
        await expect(
            rescuableFacet.rescue(TokenOwnerBalance + 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
            })
        )
            .to.be.revertedWithCustomError(rescuableFacet, 'GreaterThan')
            .withArgs(TokenOwnerBalance + 1n, TokenOwnerBalance)
    })

    it('Account without RESCUE role cannot rescue tokens', async function () {
        rescuableFacet = rescuableFacet.connect(nonOperator)
        await expect(
            rescuableFacet.rescue(ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
            })
        )
            .to.be.revertedWithCustomError(rescuableFacet, 'AccountHasNoRole')
            .withArgs(nonOperator.address, ROLES.rescue.hash)
    })

    it('Account with RESCUE role can rescue 1 HBAR', async function () {
        // Get the initial balance of the token owner and client
        const amountToRescue = ONE_HBAR
        const initialTokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)
        // By https://docs.hedera.com/hedera/tutorials/smart-contracts/hscs-workshop/hardhat#tinybars-vs-weibars
        const amountToRescueInEvm = amountToRescue / WEIBARS_PER_TINYBAR

        // rescue some tokens
        rescuableFacet = rescuableFacet.connect(operator)
        await expect(
            rescuableFacet.rescueHBAR(amountToRescueInEvm, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
            })
        )
            .to.emit(rescuableFacet, 'HBARRescued')
            .withArgs(operator.address, amountToRescueInEvm)

        await delay({ time: 1, unit: 'sec' })

        // check new balances : success
        const finalTokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)
        const expectedTokenOwnerBalance = initialTokenOwnerBalance - amountToRescueInEvm
        expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString())
    })

    it('Account with RESCUE role cannot rescue more HBAR than the owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)

        // Rescue TokenOwnerBalance + 1 : fail
        await expect(
            rescuableFacet.rescueHBAR(TokenOwnerBalance + 1n, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
            })
        )
            .to.be.revertedWithCustomError(rescuableFacet, 'GreaterThan')
            .withArgs(TokenOwnerBalance + 1n, TokenOwnerBalance)
    })

    it('Account without RESCUE role cannot rescue HBAR', async function () {
        // Account without rescue role, rescues HBAR : fail
        rescuableFacet = rescuableFacet.connect(nonOperator)
        await expect(
            rescuableFacet.rescueHBAR(ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
            })
        )
            .to.be.revertedWithCustomError(rescuableFacet, 'AccountHasNoRole')
            .withArgs(nonOperator.address, ROLES.rescue.hash)
    })
})
