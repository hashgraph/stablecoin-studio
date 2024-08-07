import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    deleteToken,
    grantRole,
    hasRole,
    Mint,
    revokeRole,
} from '../scripts/contractsMethods'
import { DELETE_ROLE } from '../scripts/constants'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
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
    TOKEN_FACTOR,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

describe('Delete Tests', function () {
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
    })

    it("Account without DELETE role can't delete a token", async function () {
        await expect(
            deleteToken(proxyAddress, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Account with DELETE role can delete a token', async function () {
        const ONE = BigNumber.from(1).mul(TOKEN_FACTOR)
        // We first grant delete role to account
        await grantRole(
            DELETE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // We check that the token exists by minting 1
        await Mint(
            proxyAddress,
            ONE,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Delete the token
        await deleteToken(proxyAddress, nonOperatorClient)

        // We check that the token does not exist by unsucessfully trying to mint 1
        await expect(
            Mint(
                proxyAddress,
                ONE,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //The status CANNOT BE revertedsince we deleted the token
    })
})
