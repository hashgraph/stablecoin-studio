// import { expect } from 'chai'
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { ethers } from 'hardhat'
// import { HederaReserve__factory, HederaTokenManager, HederaTokenManager__factory } from '@typechain-types'
// import {
//     delay,
//     deployContractWithFactory,
//     DeployContractWithFactoryCommand,
//     deployFullInfrastructure,
//     DeployFullInfrastructureCommand,
//     MESSAGES,
//     ValidateTxResponseCommand,
// } from '@scripts'
// import { GAS_LIMIT, TOKEN_NAME, TOKEN_SYMBOL } from '@test/shared'
// import { BigNumber } from 'ethers'

// const RESERVE_DECIMALS = 2
// const ONE_TOKEN_FACTOR = BigNumber.from(10).pow(1)
// const TWO_TOKEN_FACTOR = BigNumber.from(10).pow(2)
// const THREE_TOKEN_FACTOR = BigNumber.from(10).pow(3)
// const INIT_SUPPLY_ONE_DECIMALS = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)
// const MAX_SUPPLY_ONE_DECIMALS = BigNumber.from(1000).mul(ONE_TOKEN_FACTOR)
// const INIT_SUPPLY_TWO_DECIMALS = BigNumber.from(100).mul(TWO_TOKEN_FACTOR)
// const MAX_SUPPLY_TWO_DECIMALS = BigNumber.from(1000).mul(TWO_TOKEN_FACTOR)
// const INIT_SUPPLY_THREE_DECIMALS = BigNumber.from(100).mul(THREE_TOKEN_FACTOR)
// const MAX_SUPPLY_THREE_DECIMALS = BigNumber.from(1000).mul(THREE_TOKEN_FACTOR)
// const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
// const INIT_RESERVE_100 = BigNumber.from(10).pow(RESERVE_DECIMALS).mul(BigNumber.from(100))
// const INIT_RESERVE_1000 = BigNumber.from(10).pow(RESERVE_DECIMALS).mul(BigNumber.from(1000))

// describe('➡️ Reserve Tests', function () {
//     // Contracts
//     let proxyAddress: string
//     let hederaReserveProxyAdminAddress: string
//     let hederaTokenManager: HederaTokenManager
//     // Accounts
//     let operator: SignerWithAddress

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         ;[operator] = await ethers.getSigners()
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)

//         // Deploy Full Infrastructure
//         const deployCommand = await DeployFullInfrastructureCommand.newInstance({
//             signer: operator,
//             useDeployed: false,
//             tokenInformation: {
//                 name: TOKEN_NAME,
//                 symbol: TOKEN_SYMBOL,
//                 decimals: 3,
//                 initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
//                 maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
//                 memo: TOKEN_MEMO,
//                 freeze: false,
//             },
//             initialAmountDataFeed: INIT_RESERVE_100.toString(),
//             createReserve: true,
//         })
//         const deployResult = await deployFullInfrastructure(deployCommand)

//         proxyAddress = deployResult.stableCoinDeployment.proxyAddress
//         hederaReserveProxyAdminAddress = deployResult.stableCoinDeployment.reserveProxyAdminAddress!
//         hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
//     })

//     it('Get getReserveAmount', async () => {
//         const reserveAmount = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })
//         expect(reserveAmount.toString()).to.equals(INIT_RESERVE_100.toString())
//     })

//     it('Get datafeed', async () => {
//         const datafeed = await hederaTokenManager.getReserveAddress({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
//         })
//         expect(datafeed.toUpperCase()).not.to.equals(hederaReserveProxyAdminAddress.toUpperCase())
//     })

//     it('Update datafeed', async () => {
//         const beforeReserve = hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })
//         const beforeDataFeed = hederaTokenManager.getReserveAddress({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
//         })

//         const newReserve = (await beforeReserve).add(BigNumber.from('100').mul(THREE_TOKEN_FACTOR))

//         // Deploy HederaReserve
//         const { contract: newHederaReserve } = await deployContractWithFactory(
//             new DeployContractWithFactoryCommand({
//                 signer: operator,
//                 factory: new HederaReserve__factory(),
//                 withProxy: true,
//             })
//         )

//         const updateResponse = await hederaTokenManager.updateReserveAddress(newHederaReserve.address, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.updateReserveAddress,
//         })
//         await new ValidateTxResponseCommand({ txResponse: updateResponse }).execute()

//         const initHederaResponse = await newHederaReserve.initialize(BigNumber.from(newReserve), operator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.initialize,
//         })
//         await new ValidateTxResponseCommand({ txResponse: initHederaResponse }).execute()

//         const afterReserve = hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })
//         const afterDataFeed = hederaTokenManager.getReserveAddress({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
//         })

//         expect(await beforeDataFeed).not.to.equals(await afterDataFeed)
//         expect(await beforeReserve).not.to.equals(await afterReserve)
//         expect(await afterReserve).to.equals(newReserve)
//     })
// })

// describe('Reserve Tests with reserve and token with same Decimals', function () {
//     // Contracts
//     let proxyAddress: string
//     let hederaTokenManager: HederaTokenManager
//     // Accounts
//     let operator: SignerWithAddress

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
//         ;[operator] = await ethers.getSigners()

//         // Deploy Full Infrastructure
//         const deployCommand = await DeployFullInfrastructureCommand.newInstance({
//             signer: operator,
//             useDeployed: false,
//             tokenInformation: {
//                 name: TOKEN_NAME,
//                 symbol: TOKEN_SYMBOL,
//                 decimals: 2,
//                 initialSupply: INIT_SUPPLY_TWO_DECIMALS.toString(),
//                 maxSupply: MAX_SUPPLY_TWO_DECIMALS.toString(),
//                 memo: TOKEN_MEMO,
//                 freeze: false,
//             },
//             initialAmountDataFeed: INIT_RESERVE_1000.toString(),
//         })
//         const deployResult = await deployFullInfrastructure(deployCommand)

//         proxyAddress = deployResult.stableCoinDeployment.proxyAddress
//         hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
//     })

//     it('Can Mint less tokens than reserve', async function () {
//         const AmountToMint = BigNumber.from(10).mul(TWO_TOKEN_FACTOR)

//         // Get the initial reserve amount
//         const initialReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin tokens to previously associated account
//         const mintResponse = await hederaTokenManager.mint(operator.address, AmountToMint, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

//         // Check the reserve account : success
//         await delay({ time: 1, unit: 'sec' })
//         const finalReserve = (
//             await hederaTokenManager.getReserveAmount({
//                 gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//             })
//         ).sub(AmountToMint)
//         const expectedTotalReserve = initialReserve.sub(AmountToMint)
//         expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
//     })

//     it('Can not mint more tokens than reserve', async function () {
//         // Retrieve current reserve amount
//         const totalReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin more tokens than reserve amount: fail
//         const mintResponse = await hederaTokenManager.mint(operator.address, totalReserve.add(1), {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await expect(
//             new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()
//         ).to.eventually.be.rejectedWith(Error)
//     })
// })

// describe('Reserve Tests with reserve decimals higher than token decimals', function () {
//     // Contracts
//     let proxyAddress: string
//     let hederaTokenManager: HederaTokenManager
//     // Accounts
//     let operator: SignerWithAddress

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
//         ;[operator] = await ethers.getSigners()

//         // Deploy Full Infrastructure
//         const deployCommand = await DeployFullInfrastructureCommand.newInstance({
//             signer: operator,
//             useDeployed: false,
//             tokenInformation: {
//                 name: TOKEN_NAME,
//                 symbol: TOKEN_SYMBOL,
//                 decimals: 1,
//                 initialSupply: INIT_SUPPLY_ONE_DECIMALS.toString(),
//                 maxSupply: MAX_SUPPLY_ONE_DECIMALS.toString(),
//                 memo: TOKEN_MEMO,
//                 freeze: false,
//             },
//             initialAmountDataFeed: INIT_RESERVE_100.toString(),
//         })
//         const deployResult = await deployFullInfrastructure(deployCommand)

//         proxyAddress = deployResult.stableCoinDeployment.proxyAddress
//         hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
//     })

//     it('Can Mint less tokens than reserve', async function () {
//         const AmountToMint = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)

//         // Get the initial reserve amount
//         const initialReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin tokens to previously associated account
//         const mintResponse = await hederaTokenManager.mint(operator.address, AmountToMint, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

//         // Check the reserve account : success
//         await delay({ time: 1, unit: 'sec' })
//         const finalReserve = (
//             await hederaTokenManager.getReserveAmount({
//                 gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//             })
//         ).sub(AmountToMint)
//         const expectedTotalReserve = initialReserve.sub(AmountToMint)
//         expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
//     })

//     it('Can not mint more tokens than reserve', async function () {
//         // Retrieve current reserve amount
//         const totalReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin more tokens than reserve amount: fail
//         const mintResponse = await hederaTokenManager.mint(operator.address, totalReserve.add(1), {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)
//     })
// })

// describe('Reserve Tests with reserve decimals lower than token decimals', function () {
//     // Contracts
//     let proxyAddress: string
//     let hederaTokenManager: HederaTokenManager
//     // Accounts
//     let operator: SignerWithAddress

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
//         ;[operator] = await ethers.getSigners()

//         // Deploy Full Infrastructure
//         const deployCommand = await DeployFullInfrastructureCommand.newInstance({
//             signer: operator,
//             useDeployed: false,
//             tokenInformation: {
//                 name: TOKEN_NAME,
//                 symbol: TOKEN_SYMBOL,
//                 decimals: 3,
//                 initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
//                 maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
//                 memo: TOKEN_MEMO,
//                 freeze: false,
//             },
//             initialAmountDataFeed: INIT_RESERVE_1000.toString(),
//         })
//         const deployResult = await deployFullInfrastructure(deployCommand)

//         proxyAddress = deployResult.stableCoinDeployment.proxyAddress
//         hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
//     })

//     it('Can Mint less tokens than reserve', async function () {
//         const AmountToMint = BigNumber.from(10).mul(THREE_TOKEN_FACTOR)

//         // Get the initial reserve amount
//         const initialReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin tokens to previously associated account
//         const mintResponse = await hederaTokenManager.mint(operator.address, AmountToMint, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

//         // Check the reserve account : success
//         await delay({ time: 1, unit: 'sec' })
//         const finalReserve = (
//             await hederaTokenManager.getReserveAmount({
//                 gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//             })
//         ).sub(AmountToMint)
//         const expectedTotalReserve = initialReserve.sub(AmountToMint)
//         expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
//     })

//     it('Can not mint more tokens than reserve', async function () {
//         // Retrieve current reserve amount
//         const totalReserve = await hederaTokenManager.getReserveAmount({
//             gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
//         })

//         // Cashin more tokens than reserve amount: fail
//         const mintResponse = await hederaTokenManager.mint(operator.address, totalReserve.add(1), {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)
//     })
// })
