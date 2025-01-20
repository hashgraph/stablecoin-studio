import '@hashgraph/hardhat-hethers'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import { Burn, getTotalSupply } from '../scripts/contractsMethods'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
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
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

describe('Burn Tests', function () {
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
        })

        proxyAddress = result[0]
    })

    it('Account with BURN role can burn 10 tokens from the treasury account having 100 tokens', async function () {
        const tokensToBurn = INIT_SUPPLY.div(10)

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await getTotalSupply(proxyAddress, operatorClient)

        // burn some tokens
        await Burn(proxyAddress, tokensToBurn, operatorClient)

        // check new total supply and balance of treasury account : success
        const finalTotalSupply = await getTotalSupply(proxyAddress, operatorClient)
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
    })

    it('Account with BURN role cannot burn more tokens than the treasury account has', async function () {
        // Retrieve original total supply
        const currentTotalSupply = await getTotalSupply(proxyAddress, operatorClient)

        // burn more tokens than original total supply : fail
        await expect(Burn(proxyAddress, currentTotalSupply.add(1), operatorClient)).to.eventually.be.rejectedWith(Error)
    })

    it('Account with BURN role cannot burn a negative amount', async function () {
        // burn more tokens than original total supply : fail
        await expect(Burn(proxyAddress, BigNumber.from('-1'), operatorClient)).to.eventually.be.rejectedWith(Error)
    })

    it('Account without BURN role cannot burn tokens', async function () {
        // Account without burn role, burns tokens : fail
        await expect(Burn(proxyAddress, BigNumber.from(1), nonOperatorClient)).to.eventually.be.rejectedWith(Error)
    })
})
