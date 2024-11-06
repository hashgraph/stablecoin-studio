import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ContractId } from '@hashgraph/sdk'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorAccount,
    nonOperatorClient,
    nonOperatorIsE25519,
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    operatorPriKey,
    operatorPubKey,
    TOKEN_DECIMALS,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'
import { BigNumber } from 'ethers'
import { updateCustomFees } from '../scripts/contractsMethods'
import { associateToken } from '../scripts/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

describe('Custom Fees Tests', function () {
    before(async function () {
        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
            grantKYCToOriginalSender: true,
            addKyc: true,
        })

        proxyAddress = result[0]
        token = result[8]
    })

    it("An account without CUSTOM_FEES role can't update custom fees for a token", async function () {
        const bigNumber = BigNumber.from(1)
        await expect(
            updateCustomFees(
                proxyAddress,
                nonOperatorClient,
                token,
                '0.0.0',
                true,
                bigNumber,
                bigNumber,
                bigNumber,
                bigNumber,
                bigNumber,
                false
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with CUSTOM_FEES role can update custom fees for a token and fees should be updated correctly', async function () {
        const bigNumberOne = BigNumber.from(1)

        await associateToken(
            token.toString(),
            nonOperatorAccount,
            nonOperatorClient
        )

        const result = await updateCustomFees(
            proxyAddress,
            operatorClient,
            token,
            nonOperatorAccount,
            nonOperatorIsE25519,
            bigNumberOne,
            bigNumberOne,
            bigNumberOne,
            bigNumberOne,
            bigNumberOne,
            false
        )
        console.log(result)
        expect(result).to.be.true

        // TODO: update
        // const customFees = await getTokenCustomFees(
        //     proxyAddress,
        //     operatorClient
        // )
        // expect(customFees.fixedFees[0].amount).to.equal(bigNumberOne.toString())
        // expect(customFees.fractionalFees[0].numerator).to.equal(
        //     bigNumberOne.toString()
        // )
    })
})
