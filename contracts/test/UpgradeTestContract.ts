import { BigNumber } from 'ethers'
import {
    checkUpgradeTestContractUpgradability_Correct_1,
    checkUpgradeTestContractUpgradability_Correct_2,
    checkUpgradeTestContractUpgradability_Correct_3,
    checkUpgradeTestContractUpgradability_Correct_4,
    checkUpgradeTestContractUpgradability_Correct_5,
    checkUpgradeTestContractUpgradability_Wrong_1,
    checkUpgradeTestContractUpgradability_Wrong_2,
    checkUpgradeTestContractUpgradability_Wrong_3,
    checkUpgradeTestContractUpgradability_Wrong_4,
} from '../scripts/upgrade'
import {
    upgradeTo,
    admin,
    changeAdmin,
    owner,
    upgrade,
    changeProxyAdmin,
    transferOwnership,
    getProxyAdmin,
    getProxyImplementation,
    initializeHederaReserve,
    setAdminHederaReserve,
    setAmountHederaReserve,
    latestRoundDataDataHederaReserve,
    decimalsHederaReserve,
    descriptionHederaReserve,
    versionHederaReserve,
} from '../scripts/contractsMethods'
import {
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
    deployUpgradeTestContract,
} from '../scripts/deploy'
import { clientId, toEvmAddress } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import {
    HederaReserveProxyAdmin__factory,
    HederaReserveProxy__factory,
} from '../typechain-types'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let hederaReserveAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenFactor = BigNumber.from(10).pow(3)
const reserve = BigNumber.from('100').mul(TokenFactor)

const proxyAdminAbi = HederaReserveProxyAdmin__factory.abi

describe('UpgradeTestContract Tests', function () {
    before(async function () {
        // Generate Client 1 and Client 2

        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)
        nonOperatorClient = getNonOperatorClient(client1, client2, clientId)
        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        nonOperatorAccount = getNonOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )
        nonOperatorIsE25519 = getNonOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        const result = await deployUpgradeTestContract(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        hederaReserveAddress = result[2]

        console.log('TESTING')
        try {
            await checkUpgradeTestContractUpgradability_Correct_1()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Correct_2()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Correct_3()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Correct_4()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Correct_5()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Wrong_1()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Wrong_2()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Wrong_3()
        } catch (e) {
            console.log(e)
        }

        try {
            await checkUpgradeTestContractUpgradability_Wrong_4()
        } catch (e) {
            console.log(e)
        }
    })

    it('Check initialize can only be run once', async function () {
        expect(
            initializeHederaReserve(
                BigNumber.from(1000),
                proxyAddress,
                operatorClient
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})
