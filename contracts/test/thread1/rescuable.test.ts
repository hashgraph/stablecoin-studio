import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { WEIBARS_PER_TINYBAR } from '@configuration'
import {
    HederaTokenManagerFacet,
    HederaTokenManagerFacet__factory,
    RescuableFacet,
    RescuableFacet__factory,
} from '@contracts'
import {
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_HBAR,
    ONE_TOKEN,
    TEN_TOKENS,
    TWO_HBAR,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'
import { TransactionRequest } from 'ethers'

describe('➡️ Rescue Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
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

    it('Account with RESCUE role cannot rescue more tokens than the token owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await hederaTokenManagerFacet.balanceOf(stableCoinProxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        // Rescue TokenOwnerBalance + 1 : fail
        const txResponse = await rescuableFacet.rescue(TokenOwnerBalance + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Account without RESCUE role cannot rescue tokens', async function () {
        const txResponse = await rescuableFacet.connect(nonOperator).rescue(ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
        })
        // Account without rescue role, rescues tokens : fail
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.eventually.rejectedWith(Error)
    })

    it('Account with RESCUE role can rescue 1 HBAR', async function () {
        // Get the initial balance of the token owner and client
        const amountToRescue = ONE_HBAR
        const initialTokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)
        // By https://docs.hedera.com/hedera/tutorials/smart-contracts/hscs-workshop/hardhat#tinybars-vs-weibars
        const amountToRescueInEvm = ONE_HBAR / WEIBARS_PER_TINYBAR

        // rescue some tokens
        const response = await rescuableFacet.rescueHBAR(amountToRescueInEvm, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })

        await new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'HBARRescued' }).execute()

        await delay({ time: 1, unit: 'sec' })

        // check new balances : success
        const finalTokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)

        const expectedTokenOwnerBalance = initialTokenOwnerBalance - amountToRescue
        expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString())
    })

    it('Account with RESCUE role cannot rescue more HBAR than the owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await ethers.provider.getBalance(stableCoinProxyAddress)

        // Rescue TokenOwnerBalance + 1 : fail
        const txResponse = await rescuableFacet.rescueHBAR(TokenOwnerBalance + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Account without RESCUE role cannot rescue HBAR', async function () {
        // Account without rescue role, rescues HBAR : fail
        const txResponse = await rescuableFacet.connect(nonOperator).rescueHBAR(ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })
})
