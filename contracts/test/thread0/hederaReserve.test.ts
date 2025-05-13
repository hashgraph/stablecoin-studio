// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { expect } from 'chai'
// import { BigNumber } from 'ethers'
// import { TOKEN_FACTOR } from '@test/shared'
// import { HederaReserve, HederaReserve__factory } from '@typechain-types'
// import {
//     delay,
//     deployContractWithFactory,
//     DeployContractWithFactoryCommand,
//     GAS_LIMIT,
//     MESSAGES,
//     ValidateTxResponseCommand,
// } from '@scripts'
// import { ethers } from 'hardhat'

// describe.skip('HederaReserve Tests', function () {
//     // Contracts
//     let hederaReserve: HederaReserve
//     // Accounts
//     let operator: SignerWithAddress
//     let nonOperator: SignerWithAddress

//     const reserve = BigNumber.from('100').mul(TOKEN_FACTOR)

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
//         ;[operator, nonOperator] = await ethers.getSigners()

//         // Deploy HederaReserve
//         const { contract } = await deployContractWithFactory(
//             new DeployContractWithFactoryCommand({
//                 signer: operator,
//                 factory: new HederaReserve__factory(),
//                 withProxy: true,
//             })
//         )

//         hederaReserve = contract

//         const initResponse = await hederaReserve.initialize(reserve, operator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.initialize,
//         })
//         await new ValidateTxResponseCommand({ txResponse: initResponse }).execute()
//     })

//     it('Check initialize can only be run once', async function () {
//         const initResponse = await hederaReserve.initialize(reserve, operator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.initialize,
//         })
//         await expect(new ValidateTxResponseCommand({ txResponse: initResponse }).execute()).to.be.rejectedWith(Error)
//     })

//     it('Update admin address', async function () {
//         const ONE = BigNumber.from(1)

//         // Set admin to nonOperator
//         const setAdminResponse = await hederaReserve.setAdmin(nonOperator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
//         })
//         await new ValidateTxResponseCommand({ txResponse: setAdminResponse }).execute()
//         // Set amount to 1
//         const setAmountResponse = await hederaReserve.setAmount(ONE, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAmount,
//         })
//         await new ValidateTxResponseCommand({ txResponse: setAmountResponse }).execute()

//         await delay({ time: 1, unit: 'sec' })
//         const amount = await hederaReserve.connect(nonOperator).latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         expect(amount).to.equals(ONE.toString())

//         // Reset to original state
//         const resetAdminResponse = await hederaReserve.setAdmin(operator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
//         })
//         await new ValidateTxResponseCommand({ txResponse: resetAdminResponse }).execute()
//         const resetAmountResponse = await hederaReserve.setAmount(reserve, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAmount,
//         })
//         await new ValidateTxResponseCommand({ txResponse: resetAmountResponse }).execute()

//         await delay({ time: 1, unit: 'sec' })
//         const resetAmount = await hederaReserve.latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         expect(resetAmount).to.equals(reserve.toString())
//     })

//     it('Update admin address throw error client no isAdmin', async function () {
//         const txResponse = await hederaReserve.connect(nonOperator).setAdmin(nonOperator.address, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
//         })
//         await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
//     })

//     it('Update reserve throw error client no isAdmin', async function () {
//         const txResponse = await hederaReserve.connect(nonOperator).setAmount(BigNumber.from(1), {
//             gasLimit: GAS_LIMIT.hederaReserve.setAmount,
//         })
//         await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
//     })

//     it('Update reserve', async function () {
//         const beforeUpdateAmount = await hederaReserve.latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         const setAmountResponse = await hederaReserve.setAmount(BigNumber.from(1), {
//             gasLimit: GAS_LIMIT.hederaReserve.setAmount,
//         })
//         await new ValidateTxResponseCommand({ txResponse: setAmountResponse }).execute()

//         await delay({ time: 1, unit: 'sec' })
//         const afterUpdateAmount = await hederaReserve.latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         expect(beforeUpdateAmount).not.to.equals(afterUpdateAmount)
//         expect(afterUpdateAmount).to.equals(BigNumber.from(1).toString())

//         // Reset to original state
//         const resetAmountResponse = await hederaReserve.setAmount(reserve, {
//             gasLimit: GAS_LIMIT.hederaReserve.setAmount,
//         })
//         await new ValidateTxResponseCommand({ txResponse: resetAmountResponse }).execute()

//         await delay({ time: 1, unit: 'sec' })
//         const amountReset = await hederaReserve.latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         expect(amountReset).to.equals(reserve.toString())
//     })

//     it('Get decimals', async function () {
//         const decimals = await hederaReserve.decimals({
//             gasLimit: GAS_LIMIT.hederaReserve.decimals,
//         })
//         expect(decimals).to.equals(2)
//     })

//     it('Get description', async function () {
//         const description = await hederaReserve.description({
//             gasLimit: GAS_LIMIT.hederaReserve.description,
//         })
//         expect(description).to.equals('Example Hedera Reserve for ChainLink')
//     })

//     it('Get version', async function () {
//         const version = await hederaReserve.version({
//             gasLimit: GAS_LIMIT.hederaReserve.version,
//         })
//         expect(version).to.equals(1)
//     })

//     it('Get latestRoundData', async function () {
//         const amountReset = await hederaReserve.latestRoundData({
//             gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
//         })
//         expect(amountReset).to.equals(reserve.toString())
//     })
// })

// // ! We dont need to test the Proxy and ProxyAdmin contracts or upgrade functionality
// // ! as it does not improve coverage and is already tested in the OpenZeppelin tests
// // describe.skip('HederaReserveProxy and HederaReserveProxyAdmin Tests', function () {
// //     before(async function () {
// //         const result = await deployHederaReserve(
// //             reserve,
// //             operatorAccount,
// //             operatorIsE25519,
// //             operatorClient,
// //             operatorPriKey
// //         )
// //         proxyAddress = result[0]
// //         proxyAdminAddress = result[1]
// //         hederaReserveAddress = result[2]
// //     })

// //     it('Retrieve admin and implementation addresses for the Proxy', async function () {
// //         // We retreive the HederaReserveProxy admin and implementation
// //         const implementation = await getProxyImplementation(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             (await getContractInfo(proxyAddress.toString())).evm_address
// //         )
// //         const admin = await getProxyAdmin(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             (await getContractInfo(proxyAddress.toString())).evm_address
// //         )

// //         // We check their values : success
// //         expect(implementation.toUpperCase()).to.equals(
// //             (await getContractInfo(hederaReserveAddress.toString())).evm_address.toUpperCase()
// //         )
// //         expect(admin.toUpperCase()).to.equals(
// //             (await getContractInfo(proxyAdminAddress.toString())).evm_address.toUpperCase()
// //         )
// //     })

// //     it('Retrieve proxy admin owner', async function () {
// //         // We retreive the HederaReserveProxy admin and implementation
// //         const ownerAccount = await owner(proxyAdminAbi, proxyAdminAddress, operatorClient)

// //         // We check their values : success
// //         expect(ownerAccount.toUpperCase()).to.equals(
// //             (await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase()
// //         )
// //     })

// //     it('Upgrade Proxy implementation without the proxy admin', async function () {
// //         // Deploy a new contract
// //         const result = await deployHederaReserve(
// //             reserve,
// //             operatorAccount,
// //             operatorIsE25519,
// //             operatorClient,
// //             operatorPriKey
// //         )

// //         const newImplementationContract = result[2]

// //         // Non Admin upgrades implementation : fail
// //         await expect(
// //             upgradeTo(
// //                 proxyAdminAbi,
// //                 proxyAddress,
// //                 operatorClient,
// //                 (await getContractInfo(newImplementationContract.toString())).evm_address
// //             )
// //         ).to.eventually.be.rejectedWith(Error)
// //     })

// //     it('Change Proxy admin without the proxy admin', async function () {
// //         // Non Admin changes admin : fail
// //         await expect(
// //             changeAdmin(
// //                 proxyAdminAbi,
// //                 proxyAddress,
// //                 operatorClient,
// //                 await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
// //             )
// //         ).to.eventually.be.rejectedWith(Error)
// //     })

// //     it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
// //         // Deploy a new contract
// //         const result = await deployHederaReserve(
// //             reserve,
// //             operatorAccount,
// //             operatorIsE25519,
// //             operatorClient,
// //             operatorPriKey
// //         )
// //         const newImplementationContract = result[2]

// //         // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
// //         await expect(
// //             upgrade(
// //                 proxyAdminAbi,
// //                 proxyAdminAddress,
// //                 nonOperatorClient,
// //                 (await getContractInfo(newImplementationContract.toString())).evm_address,
// //                 (await getContractInfo(proxyAddress.toString())).evm_address
// //             )
// //         ).to.eventually.be.rejectedWith(Error)
// //     })

// //     it('Change Proxy admin with the proxy admin but without the owner account', async function () {
// //         // Non Owner changes admin : fail
// //         await expect(
// //             changeProxyAdmin(
// //                 proxyAdminAbi,
// //                 proxyAdminAddress,
// //                 nonOperatorClient,
// //                 nonOperatorAccount,
// //                 proxyAddress,
// //                 nonOperatorIsE25519
// //             )
// //         ).to.eventually.be.rejectedWith(Error)
// //     })

// //     it('Upgrade Proxy implementation with the proxy admin and the owner account', async function () {
// //         // Deploy a new contract
// //         const result = await deployHederaReserve(
// //             reserve,
// //             operatorAccount,
// //             operatorIsE25519,
// //             operatorClient,
// //             operatorPriKey
// //         )

// //         const newImplementationContract = result[2]

// //         // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
// //         await upgrade(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             (await getContractInfo(newImplementationContract.toString())).evm_address,
// //             (await getContractInfo(proxyAddress.toString())).evm_address
// //         )

// //         // Check new implementation address
// //         const implementation = await getProxyImplementation(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             (await getContractInfo(proxyAddress.toString())).evm_address
// //         )
// //         expect(implementation.toUpperCase()).to.equals(
// //             (await getContractInfo(newImplementationContract.toString())).evm_address.toUpperCase()
// //         )

// //         // reset
// //         await upgrade(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             (await getContractInfo(hederaReserveAddress.toString())).evm_address,
// //             (await getContractInfo(proxyAddress.toString())).evm_address
// //         )
// //     })

// //     it('Change Proxy admin with the proxy admin and the owner account', async function () {
// //         // Owner changes admin : success
// //         await changeProxyAdmin(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             operatorAccount,
// //             proxyAddress,
// //             operatorIsE25519
// //         )

// //         // Now we cannot get the admin using the Proxy admin contract.
// //         await expect(
// //             getProxyAdmin(
// //                 proxyAdminAbi,
// //                 proxyAdminAddress,
// //                 operatorClient,
// //                 (await getContractInfo(proxyAddress.toString())).evm_address
// //             )
// //         ).to.eventually.be.rejectedWith(Error)

// //         // Check that proxy admin has been changed
// //         const _admin = await admin(ITransparentUpgradeableProxy__factory.abi, proxyAddress, operatorClient)
// //         expect(_admin.toUpperCase()).to.equals((await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase())

// //         // reset
// //         await changeAdmin(
// //             ITransparentUpgradeableProxy__factory.abi,
// //             proxyAddress,
// //             operatorClient,
// //             await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
// //         )
// //         await changeAdmin(
// //             ITransparentUpgradeableProxy__factory.abi,
// //             proxyAddress,
// //             nonOperatorClient,
// //             (await getContractInfo(proxyAdminAddress.toString())).evm_address
// //         )
// //     })

// //     it('Transfers Proxy admin owner without the owner account', async function () {
// //         // Non Owner transfers owner : fail
// //         await expect(
// //             transferOwnership(
// //                 proxyAdminAbi,
// //                 proxyAdminAddress,
// //                 nonOperatorClient,
// //                 nonOperatorAccount,
// //                 nonOperatorIsE25519
// //             )
// //         ).to.eventually.be.rejectedWith(Error)
// //     })

// //     it('Transfers Proxy admin owner with the owner account', async function () {
// //         // Owner transfers owner : success
// //         await transferOwnership(
// //             proxyAdminAbi,
// //             proxyAdminAddress,
// //             operatorClient,
// //             nonOperatorAccount,
// //             nonOperatorIsE25519
// //         )

// //         // Check
// //         const ownerAccount = await owner(proxyAdminAbi, proxyAdminAddress, operatorClient)
// //         expect(ownerAccount.toUpperCase()).to.equals(
// //             (await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)).toUpperCase()
// //         )

// //         // reset
// //         await transferOwnership(proxyAdminAbi, proxyAdminAddress, nonOperatorClient, operatorAccount, operatorIsE25519)
// //     })
// // })
