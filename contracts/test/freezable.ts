import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import { Mint, freeze, unfreeze } from '../scripts/contractsMethods'
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

describe('Freeze Tests', function () {
    before(async function () {
        // Deploy Token using Client
        const [result] = await Promise.all([
            deployContractsWithSDK({
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
            }),
        ])

        proxyAddress = result[0]
    })

    it("Account without FREEZE role can't freeze transfers of the token for the account", async function () {
        await expect(
            freeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it("Account with FREEZE role can freeze and unfreeze transfers of the token for the account + Account without FREEZE role can't unfreeze transfers of the token for the account", async function () {
        await Mint(
            proxyAddress,
            ONE_TOKEN,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        await freeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        await expect(
            Mint(
                proxyAddress,
                ONE_TOKEN,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        await expect(
            unfreeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        await unfreeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        await Mint(
            proxyAddress,
            ONE_TOKEN,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
    })
})
