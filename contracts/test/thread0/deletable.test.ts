// import { expect } from 'chai'
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { ethers, network } from 'hardhat'
// import { NetworkName } from '@configuration'
// import { HederaTokenManager, HederaTokenManager__factory } from '@typechain-types'
// import { MESSAGES, ROLES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
// import { deployStableCoinInTests, GAS_LIMIT, INIT_SUPPLY, ONE_TOKEN } from '@test/shared'

// describe('➡️ Delete Tests', function () {
//     // Contracts
//     let proxyAddress: string
//     let hederaTokenManager: HederaTokenManager
//     // Accounts
//     let operator: SignerWithAddress
//     let nonOperator: SignerWithAddress

//     before(async function () {
//         // Disable | Mock console.log()
//         console.log = () => {} // eslint-disable-line
//         // * Deploy StableCoin Token
//         console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
//         ;[operator, nonOperator] = await ethers.getSigners()
//         // if ((network.name as NetworkName) === NETWORK_LIST.name[0]) {
//         //     await deployPrecompiledHederaTokenServiceMock(hre, signer)
//         // }
//         ;({ proxyAddress } = await deployStableCoinInTests({
//             signer: operator,
//             network: network.name as NetworkName,
//             initialAmountDataFeed: INIT_SUPPLY.toString(),
//             addFeeSchedule: true,
//         }))
//         hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
//     })

//     it("Account without DELETE role can't delete a token", async function () {
//         const response = await hederaTokenManager.connect(nonOperator).deleteToken({
//             gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
//         })
//         await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
//             Error
//         )
//     })

//     it('Account with DELETE role can delete a token', async function () {
//         // We first grant delete role to account
//         const grantRoleResponse = await hederaTokenManager.grantRole(ROLES.delete.hash, nonOperator.address, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
//         })
//         await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
//         // We check that the token exists by minting 1
//         const mintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))
//         // Delete the token
//         const deleteResponse = await hederaTokenManager.connect(nonOperator).deleteToken({
//             gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
//         })
//         await validateTxResponse(new ValidateTxResponseCommand({ txResponse: deleteResponse }))
//         // We check that the token does not exist by unsucessfully trying to mint 1
//         const mintResponse2 = await hederaTokenManager.mint(nonOperator.address, ONE_TOKEN, {
//             gasLimit: GAS_LIMIT.hederaTokenManager.mint,
//         })
//         await expect(
//             validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse2 }))
//         ).to.be.rejectedWith(Error)

//         //! The status CANNOT BE reverted since we deleted the token
//     })
// })
