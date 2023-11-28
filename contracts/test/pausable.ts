import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    grantRole,
    hasRole,
    pause,
    revokeRole,
    unpause,
} from '../scripts/contractsMethods'
import { PAUSE_ROLE } from '../scripts/constants'
import { associateToken } from '../scripts/utils'
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
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

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

    it('Admin account can grant and revoke pause role to an account', async function () {
        // Admin grants pause role : success
        let result = await hasRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes pause role : success
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant pause role to an account', async function () {
        // Non Admin grants pause role : fail
        await expect(
            grantRole(
                PAUSE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke pause role to an account', async function () {
        // Non Admin revokes pause role : fail
        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                PAUSE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it("An account without pause role can't pause a token", async function () {
        await expect(
            pause(proxyAddress, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it("An account without pause role can't unpause a token", async function () {
        await expect(
            unpause(proxyAddress, nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with pause role can pause a token', async function () {
        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await expect(
            pause(proxyAddress, nonOperatorClient)
        ).not.to.eventually.be.rejectedWith(Error)

        //Reset status
        await unpause(proxyAddress, nonOperatorClient)
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with pause role can unpause a token', async function () {
        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await expect(
            unpause(proxyAddress, nonOperatorClient)
        ).not.to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('A paused token can not be used for any other operation, like associating', async function () {
        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await pause(proxyAddress, nonOperatorClient)
        await expect(
            associateToken(
                token.toString(),
                nonOperatorAccount,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await unpause(proxyAddress, nonOperatorClient)
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An unpaused token can be used for any other operation, like associating', async function () {
        await grantRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await pause(proxyAddress, nonOperatorClient)
        await unpause(proxyAddress, nonOperatorClient)
        await expect(
            associateToken(
                token.toString(),
                nonOperatorAccount,
                nonOperatorClient
            )
        ).not.to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            PAUSE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })
})
