import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory } from '@typechain'
import { delay, ROLES, ValidateTxResponseCommand } from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT, ONE_HBAR, ONE_TOKEN, TEN_TOKENS, TWO_HBAR } from '@test/shared'
import { BigNumber } from 'ethers'

describe('➡️ Rescue Tests', function () {
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
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)

        // HBAR Transfer
        console.log(
            (await ethers.provider.getBalance(operator.address)).div(BigNumber.from(10).pow(18)).toString(),
            TWO_HBAR.div(BigNumber.from(10).pow(18)).toString(),
            (await ethers.provider.getBalance(proxyAddress)).toString()
        )
        const transferTx = {
            to: proxyAddress,
            value: TWO_HBAR,
            gasLimit: GAS_LIMIT.transfer,
            chainId: network.config.chainId,
        } as TransactionRequest
        console.log(transferTx)
        const response = await operator.sendTransaction(transferTx)
        await new ValidateTxResponseCommand({ txResponse: response }).execute()
    })

    it('Account with RESCUE role can rescue 10 tokens', async function () {
        // Get the initial balance of the token owner and client
        const initialTokenOwnerBalance = await hederaTokenManager.balanceOf(proxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        const initialClientBalance = await hederaTokenManager.balanceOf(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })

        // rescue some tokens
        const response = await hederaTokenManager.rescue(TEN_TOKENS, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
        })
        await new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenRescued' }).execute()

        await delay({ time: 1, unit: 'sec' })
        // check new balances : success
        const finalTokenOwnerBalance = await hederaTokenManager.balanceOf(proxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })
        const finalClientBalance = await hederaTokenManager.balanceOf(operator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })

        const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(TEN_TOKENS)
        const expectedClientBalance = initialClientBalance.add(TEN_TOKENS)

        expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString())
        expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString())
    })

    it('Account with RESCUE role cannot rescue more tokens than the token owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await hederaTokenManager.balanceOf(proxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.balanceOf,
        })

        // Rescue TokenOwnerBalance + 1 : fail
        const txResponse = await hederaTokenManager.rescue(TokenOwnerBalance.add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    //! Not working. Need to check
    it('Account without RESCUE role cannot rescue tokens', async function () {
        console.log(await hederaTokenManager.hasRole(ROLES.rescue.hash, nonOperator.address))
        // Account without rescue role, rescues tokens : fail
        await expect(
            hederaTokenManager.connect(nonOperator).rescue(ONE_TOKEN, {
                gasLimit: GAS_LIMIT.hederaTokenManager.rescue,
                from: nonOperator.address,
            })
        ).to.be.eventually.rejectedWith(Error)
    })

    it('Account with RESCUE role can rescue 1 HBAR', async function () {
        // Get the initial balance of the token owner and client
        const AmountToRescue = ONE_HBAR
        const initialTokenOwnerBalance = await ethers.provider.getBalance(proxyAddress)

        console.log('initialTokenOwnerBalance', initialTokenOwnerBalance.toString())

        // rescue some tokens
        const response = await hederaTokenManager.rescueHBAR(AmountToRescue, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })
        await new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'HBARRescued' }).execute()

        await delay({ time: 1, unit: 'sec' })
        // check new balances : success
        const finalTokenOwnerBalance = await ethers.provider.getBalance(proxyAddress)

        const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(AmountToRescue)
        expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString())
    })

    it('Account with RESCUE role cannot rescue more HBAR than the owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await ethers.provider.getBalance(proxyAddress)

        // Rescue TokenOwnerBalance + 1 : fail
        const txResponse = await hederaTokenManager.rescueHBAR(TokenOwnerBalance.add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Account without RESCUE role cannot rescue HBAR', async function () {
        // Account without rescue role, rescues HBAR : fail
        const txResponse = await hederaTokenManager.connect(nonOperator).rescueHBAR(ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.rescueHBAR,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })
})
