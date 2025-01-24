import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { deployContractsWithSDK } from '../scripts/deploy'
import { pause, unpause } from '../scripts/contractsMethods'
import { associateToken, dissociateToken } from '../scripts/utils'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorAccount,
    nonOperatorClient,
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    operatorPriKey,
    operatorPubKey,
    TOKEN_DECIMALS,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

describe('Pause Tests', function () {
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
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        proxyAddress = result[0]
        token = result[8]
    })

    it("An account without PAUSE role can't pause a token", async function () {
        await expect(pause(proxyAddress, nonOperatorClient)).to.eventually.be.rejectedWith(Error)
    })

    it("An account with PAUSE role can pause and unpause a token + An account without PAUSE role can't unpause a token", async function () {
        await associateToken(token.toString(), nonOperatorAccount, nonOperatorClient)

        await pause(proxyAddress, operatorClient)

        await expect(
            dissociateToken(token.toString(), nonOperatorAccount, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)

        await expect(unpause(proxyAddress, nonOperatorClient)).to.eventually.be.rejectedWith(Error)

        await unpause(proxyAddress, operatorClient)

        await dissociateToken(token.toString(), nonOperatorAccount, nonOperatorClient)
    })
})
