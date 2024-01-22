import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK, deployHederaReserve } from '../scripts/deploy'
import {
    getReserveAddress,
    getReserveAmount,
    initializeHederaReserve,
    Mint,
    updateDataFeed,
} from '../scripts/contractsMethods'
import { getContractInfo } from '../scripts/utils'
import { AccountId, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    operatorPriKey,
    operatorPubKey,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

const RESERVE_DECIMALS = 2
const ONE_TOKEN_FACTOR = BigNumber.from(10).pow(1)
const TWO_TOKEN_FACTOR = BigNumber.from(10).pow(2)
const THREE_TOKEN_FACTOR = BigNumber.from(10).pow(3)
const INIT_SUPPLY_ONE_DECIMALS = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)
const MAX_SUPPLY_ONE_DECIMALS = BigNumber.from(1000).mul(ONE_TOKEN_FACTOR)
const INIT_SUPPLY_TWO_DECIMALS = BigNumber.from(100).mul(TWO_TOKEN_FACTOR)
const MAX_SUPPLY_TWO_DECIMALS = BigNumber.from(1000).mul(TWO_TOKEN_FACTOR)
const INIT_SUPPLY_THREE_DECIMALS = BigNumber.from(100).mul(THREE_TOKEN_FACTOR)
const MAX_SUPPLY_THREE_DECIMALS = BigNumber.from(1000).mul(THREE_TOKEN_FACTOR)
const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
const INIT_RESERVE_100 = BigNumber.from(10)
    .pow(RESERVE_DECIMALS)
    .mul(BigNumber.from(100))
const INIT_RESERVE_1000 = BigNumber.from(10)
    .pow(RESERVE_DECIMALS)
    .mul(BigNumber.from(1000))

let proxyAddress: ContractId
let hederaReserveProxy: ContractId

export const reserve = () => {
    describe('Reserve Tests', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: 3,
                initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
                maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_RESERVE_100.toString(),
            })

            proxyAddress = result[0]
            hederaReserveProxy = result[7]
        })

        it('Get getReserveAmount', async () => {
            const reserve = await getReserveAmount(proxyAddress, operatorClient)
            expect(reserve).to.equals(INIT_RESERVE_100.toString())
        })

        it('Get datafeed', async () => {
            const datafeed = await getReserveAddress(
                proxyAddress,
                operatorClient
            )
            expect(datafeed.toUpperCase()).not.to.equals(
                '0x' +
                    (
                        await getContractInfo(hederaReserveProxy.toString())
                    ).evm_address.toUpperCase()
            )
        })

        it('Update datafeed', async () => {
            const beforeDataFeed = await getReserveAddress(
                proxyAddress,
                operatorClient
            )
            const beforeReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )
            const newReserve = beforeReserve.add(
                BigNumber.from('100').mul(THREE_TOKEN_FACTOR)
            )
            const [newDataFeed] = await deployHederaReserve(
                newReserve,
                operatorAccount,
                operatorIsE25519,
                operatorClient,
                operatorPriKey
            )
            await updateDataFeed(newDataFeed, proxyAddress, operatorClient)

            await initializeHederaReserve(
                BigNumber.from(newReserve),
                newDataFeed,
                operatorClient,
                AccountId.fromString(operatorAccount).toSolidityAddress()
            )
            const afterDataFeed = await getReserveAddress(
                proxyAddress,
                operatorClient
            )
            const afterReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )

            expect(beforeDataFeed).not.to.equals(afterDataFeed)
            expect(beforeReserve).not.to.equals(afterReserve)
            expect(afterReserve).to.equals(newReserve)
        })
    })

    describe('Reserve Tests with reserve and token with same Decimals', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: 2,
                initialSupply: INIT_SUPPLY_TWO_DECIMALS.toString(),
                maxSupply: MAX_SUPPLY_TWO_DECIMALS.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_RESERVE_1000.toString(),
            })

            proxyAddress = result[0]
            hederaReserveProxy = result[7]
        })

        it('Can Mint less tokens than reserve', async function () {
            const AmountToMint = BigNumber.from(10).mul(TWO_TOKEN_FACTOR)

            // Get the initial reserve amount
            const initialReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Check the reserve account : success
            const finalReserve = (
                await getReserveAmount(proxyAddress, operatorClient)
            ).sub(AmountToMint)

            const expectedTotalReserve = initialReserve.sub(AmountToMint)
            expect(finalReserve.toString()).to.equals(
                expectedTotalReserve.toString()
            )
        })

        it('Can not mint more tokens than reserve', async function () {
            // Retrieve current reserve amount
            const totalReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )
            // Cashin more tokens than reserve amount: fail
            await expect(
                Mint(
                    proxyAddress,
                    totalReserve.add(1),
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })
    })

    describe('Reserve Tests with reserve decimals higher than token decimals', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: 1,
                initialSupply: INIT_SUPPLY_ONE_DECIMALS.toString(),
                maxSupply: MAX_SUPPLY_ONE_DECIMALS.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_RESERVE_100.toString(),
            })

            proxyAddress = result[0]
            hederaReserveProxy = result[7]
        })

        it('Can Mint less tokens than reserve', async function () {
            const AmountToMint = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)

            // Get the initial reserve amount
            const initialReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Check the reserve account : success
            const finalReserve = (
                await getReserveAmount(proxyAddress, operatorClient)
            ).sub(AmountToMint)

            const expectedTotalReserve = initialReserve.sub(AmountToMint)
            expect(finalReserve.toString()).to.equals(
                expectedTotalReserve.toString()
            )
        })

        it('Can not mint more tokens than reserve', async function () {
            // Retrieve current reserve amount
            const totalReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )
            // Cashin more tokens than reserve amount: fail
            await expect(
                Mint(
                    proxyAddress,
                    totalReserve.add(1),
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })
    })

    describe('Reserve Tests with reserve decimals lower than token decimals', function () {
        before(async function () {
            // Deploy Token using Client
            const result = await deployContractsWithSDK({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: 3,
                initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
                maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
                memo: TOKEN_MEMO,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                initialAmountDataFeed: INIT_RESERVE_1000.toString(),
            })

            proxyAddress = result[0]
            hederaReserveProxy = result[7]
        })

        it('Can Mint less tokens than reserve', async function () {
            const AmountToMint = BigNumber.from(10).mul(THREE_TOKEN_FACTOR)

            // Get the initial reserve amount
            const initialReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )

            // Cashin tokens to previously associated account
            await Mint(
                proxyAddress,
                AmountToMint,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            // Check the reserve account : success
            const finalReserve = (
                await getReserveAmount(proxyAddress, operatorClient)
            ).sub(AmountToMint)

            const expectedTotalReserve = initialReserve.sub(AmountToMint)
            expect(finalReserve.toString()).to.equals(
                expectedTotalReserve.toString()
            )
        })

        it('Can not mint more tokens than reserve', async function () {
            // Retrieve current reserve amount
            const totalReserve = await getReserveAmount(
                proxyAddress,
                operatorClient
            )
            // Cashin more tokens than reserve amount: fail
            await expect(
                Mint(
                    proxyAddress,
                    totalReserve.add(1),
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })
    })
}
