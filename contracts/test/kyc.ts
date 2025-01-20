import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import { grantKyc, Mint, revokeKyc } from '../scripts/contractsMethods'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorClient,
    ONE_TOKEN,
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

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

describe('KYC Tests', function () {
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
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from('100000')).toString(),
            grantKYCToOriginalSender: true,
            addKyc: true,
        })

        proxyAddress = result[0]
        token = result[8]
    })

    it("An account without KYC role can't grant kyc to an account for a token", async function () {
        await expect(
            grantKyc(proxyAddress, operatorAccount, operatorIsE25519, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it("An account with KYC role can grant and revoke kyc to an account for a token + An account without KYC role can't revoke kyc to an account for a token", async function () {
        await Mint(proxyAddress, ONE_TOKEN, operatorClient, operatorAccount, operatorIsE25519)

        await expect(
            revokeKyc(proxyAddress, operatorAccount, operatorIsE25519, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)

        //Reset kyc
        await revokeKyc(proxyAddress, operatorAccount, operatorIsE25519, operatorClient)

        await expect(
            Mint(proxyAddress, ONE_TOKEN, operatorClient, operatorAccount, operatorIsE25519)
        ).to.eventually.be.rejectedWith(Error)

        await grantKyc(proxyAddress, operatorAccount, operatorIsE25519, operatorClient)

        await Mint(proxyAddress, ONE_TOKEN, operatorClient, operatorAccount, operatorIsE25519)
    })

    it('An account with KYC role can`t grant and revoke kyc to the zero account for a token', async function () {
        await expect(grantKyc(proxyAddress, '0.0.0', true, operatorClient)).to.eventually.be.rejectedWith(Error)

        await expect(revokeKyc(proxyAddress, '0.0.0', true, nonOperatorClient)).to.eventually.be.rejectedWith(Error)
    })
})
