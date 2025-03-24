import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import { NetworkName } from '@configuration'
import { HederaTokenManager, HederaTokenManager__factory, IHederaTokenManager } from '@typechain'
import {
    allTokenKeysToKey,
    AllTokenKeysToKeyCommand,
    delay,
    DeployFullInfrastructureCommand,
    getFullWalletFromSigner,
    getOneMonthFromNowInSeconds,
    MESSAGES,
    ROLES,
    tokenKeysToKey,
    TokenKeysToKeyCommand,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import {
    DEFAULT_UPDATE_TOKEN_STRUCT,
    deployFullInfrastructureInTests,
    GAS_LIMIT,
    INIT_SUPPLY,
    ONE_TOKEN,
    OTHER_AUTO_RENEW_PERIOD,
    TOKEN_DECIMALS,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from '@test/shared'
import { BigNumber, Wallet } from 'ethers'

describe('➡️ HederaTokenManager Tests', function () {
    // Contracts
    let proxyAddress: string
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: Wallet // ! usign Wallet instead of SignerWithAddress because need public key
    let nonOperator: Wallet

    before(async function () {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        const [operatorSigner, nonOperatorSigner] = await ethers.getSigners()
        operator = await getFullWalletFromSigner(operatorSigner)
        nonOperator = await getFullWalletFromSigner(nonOperatorSigner)
        // * Deploy contracts
        ;({ proxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
            initialAmountDataFeed: INIT_SUPPLY.toString(),
            addFeeSchedule: true,
        }))
        hederaTokenManager = HederaTokenManager__factory.connect(proxyAddress, operator)
    })

    it('Cannot Update token if not Admin', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: TOKEN_MEMO,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManager
            .connect(nonOperator)
            .updateToken(updateTokenStruct, { gasLimit: GAS_LIMIT.hederaTokenManager.updateToken })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Admin cannot update token if metadata exceeds 100 characters', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const longMetadata = 'X'.repeat(101)

        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: longMetadata,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManager.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    // TODO: review this test
    it.skip('Admin can update token', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: TOKEN_MEMO,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManager.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenUpdated' })
        )

        const newMetadata = await hederaTokenManager.getMetadata({ gasLimit: GAS_LIMIT.hederaTokenManager.getMetadata })
        expect(newMetadata).to.equal(TOKEN_MEMO)

        // Update back to initial values
        const defaultResponse = await hederaTokenManager.updateToken(DEFAULT_UPDATE_TOKEN_STRUCT, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: defaultResponse, confirmationEvent: 'TokenUpdated' })
        )
    })

    it('Admin and supply token keys cannot be updated', async function () {
        const keys = allTokenKeysToKey(new AllTokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: TOKEN_MEMO,
        } as IHederaTokenManager.UpdateTokenStructStructOutput
        const response = await hederaTokenManager.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('deploy SC with roles associated to another account', async function () {
        // Deploy New Token
        const { proxyAddress: newProxyAddress } = await deployFullInfrastructureInTests({
            signer: operator,
            network: network.name as NetworkName,
            initialAmountDataFeed: INIT_SUPPLY.toString(),
            allRolesToCreator: false,
            RolesToAccount: nonOperator.address,
            addFeeSchedule: true,
        })
        const newHederaTokenManager = HederaTokenManager__factory.connect(newProxyAddress, operator)

        // Checking roles
        const [resultOperatorAccount, resultNonOperatorAccount, isUnlimitedOperator, isUnlimitedNonOperator] =
            await Promise.all([
                newHederaTokenManager.getRoles(operator.address, { gasLimit: GAS_LIMIT.hederaTokenManager.getRoles }),
                newHederaTokenManager.getRoles(nonOperator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
                }),
                newHederaTokenManager.isUnlimitedSupplierAllowance(operator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
                }),
                newHederaTokenManager.isUnlimitedSupplierAllowance(nonOperator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
                }),
            ])

        expect(isUnlimitedOperator).to.eq(false)
        expect(isUnlimitedNonOperator).to.eq(true)

        for (let i = 0; i < resultOperatorAccount.length; i++) {
            if (i == ROLES.cashin.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.burn.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.delete.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.freeze.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.wipe.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.rescue.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.pause.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.kyc.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.customFees.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.defaultAdmin.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.defaultAdmin.hash.toUpperCase())
            else expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }

        for (let i = 0; i < resultNonOperatorAccount.length; i++) {
            if (i == ROLES.cashin.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.cashin.hash.toUpperCase())
            else if (i == ROLES.burn.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.burn.hash.toUpperCase())
            else if (i == ROLES.delete.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.delete.hash.toUpperCase())
            else if (i == ROLES.freeze.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.freeze.hash.toUpperCase())
            else if (i == ROLES.wipe.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.wipe.hash.toUpperCase())
            else if (i == ROLES.rescue.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.rescue.hash.toUpperCase())
            else if (i == ROLES.pause.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.pause.hash.toUpperCase())
            else if (i == ROLES.kyc.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.kyc.hash.toUpperCase())
            else if (i == ROLES.customFees.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.customFees.hash.toUpperCase())
            else if (i == ROLES.defaultAdmin.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }
    })

    it('input parmeters check', async function () {
        // We retreive the Token basic params
        const [retrievedTokenName, retrievedTokenSymbol, retrievedTokenDecimals, retrievedTokenTotalSupply] =
            await Promise.all([
                hederaTokenManager.name({ gasLimit: GAS_LIMIT.hederaTokenManager.name }),
                hederaTokenManager.symbol({ gasLimit: GAS_LIMIT.hederaTokenManager.symbol }),
                hederaTokenManager.decimals({ gasLimit: GAS_LIMIT.hederaTokenManager.decimals }),
                hederaTokenManager.totalSupply({ gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply }),
            ])

        // We check their values : success
        expect(retrievedTokenName).to.equals(TOKEN_NAME)
        expect(retrievedTokenSymbol).to.equals(TOKEN_SYMBOL)
        expect(retrievedTokenDecimals).to.equals(TOKEN_DECIMALS)
        expect(retrievedTokenTotalSupply.toString()).to.equals(INIT_SUPPLY.toString())
    })

    // TODO: init test before only pass the tokenAddress, this was never tested
    it.skip('Check initialize can only be run once', async function () {
        // Retrieve current Token address
        const tokenAddress = await hederaTokenManager.getTokenAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getTokenAddress,
        })

        const deployCommand = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: INIT_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        const initStruct = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token: tokenAddress as any, //! imposible to test...
            initialTotalSupply: deployCommand.tokenStruct.tokenInitialSupply,
            tokenDecimals: deployCommand.tokenStruct.tokenDecimals,
            originalSender: operator.address,
            reserveAddress: deployCommand.tokenStruct.reserveAddress,
            roles: deployCommand.tokenStruct.roles,
            cashinRole: deployCommand.tokenStruct.cashinRole,
            tokenMetadataURI: deployCommand.tokenStruct.metadata,
        }

        // Initiliaze : fail
        const result = await hederaTokenManager.initialize(initStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.initialize,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })

    it('Mint token throw error format number incorrrect', async () => {
        const initialTotalSupply = await hederaTokenManager.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        const badMintResponse = await hederaTokenManager.mint(operator.address, BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: badMintResponse }))
        ).to.be.rejectedWith(Error)

        const afterErrorTotalSupply = await hederaTokenManager.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        expect(initialTotalSupply).to.equal(afterErrorTotalSupply)

        const goodMintResponse = await hederaTokenManager.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: goodMintResponse, confirmationEvent: 'TokensMinted' })
        )

        await delay({ time: 500, unit: 'ms' })
        const totalSupply = await hederaTokenManager.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        expect(totalSupply).to.equal(initialTotalSupply.add(ONE_TOKEN))
    })
})

describe.skip('HederaTokenManagerProxy and HederaTokenManagerProxyAdmin Tests', function () {
    // before(async function () {
    //     // Deploy Token using Client
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //     })
    //     proxyAddress = result[0]
    //     proxyAdminAddress = result[1]
    //     stableCoinAddress = result[2]
    // })
    // it('Can deploy a stablecoin where proxy admin owner is the deploying account', async function () {
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //         proxyAdminOwnerAccount: ADDRESS_ZERO,
    //     })
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const ownerAccount = await owner(abiProxyAdmin, result[1], operatorClient)
    //     // We check their values : success
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase()
    //     )
    // })
    // it('Can deploy a stablecoin where proxy admin owner is not the deploying account', async function () {
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //         proxyAdminOwnerAccount: await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519),
    //     })
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const ownerAccount = await owner(abiProxyAdmin, result[1], operatorClient)
    //     // We check their values : success
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)).toUpperCase()
    //     )
    // })
    // it('Retrieve admin and implementation addresses for the Proxy', async function () {
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const implementation = await getProxyImplementation(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     const admin = await getProxyAdmin(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     // We check their values : success
    //     expect(implementation.toUpperCase()).to.equals(
    //         (await getContractInfo(stableCoinAddress.toString())).evm_address.toUpperCase()
    //     )
    //     expect(admin.toUpperCase()).to.equals(
    //         (await getContractInfo(proxyAdminAddress.toString())).evm_address.toUpperCase()
    //     )
    // })
    // it('Retrieve proxy admin owner', async function () {
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const ownerAccount = await owner(abiProxyAdmin, proxyAdminAddress, operatorClient)
    //     // We check their values : success
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase()
    //     )
    // })
    // it('Upgrade Proxy implementation without the proxy admin', async function () {
    //     // Deploy a new contract
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //     })
    //     const newImplementationContract = result[2]
    //     // Non Admin upgrades implementation : fail
    //     await expect(
    //         upgradeTo(
    //             abiProxyAdmin,
    //             proxyAddress,
    //             operatorClient,
    //             (await getContractInfo(newImplementationContract.toString())).evm_address
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Change Proxy admin without the proxy admin', async function () {
    //     // Non Admin changes admin : fail
    //     await expect(
    //         changeAdmin(
    //             abiProxyAdmin,
    //             proxyAddress,
    //             operatorClient,
    //             await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
    //     // Deploy a new contract
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //     })
    //     const newImplementationContract = result[2]
    //     // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
    //     await expect(
    //         upgrade(
    //             abiProxyAdmin,
    //             proxyAdminAddress,
    //             nonOperatorClient,
    //             (await getContractInfo(newImplementationContract.toString())).evm_address,
    //             (await getContractInfo(proxyAddress.toString())).evm_address
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Change Proxy admin with the proxy admin but without the owner account', async function () {
    //     // Non Owner changes admin : fail
    //     await expect(
    //         changeProxyAdmin(
    //             abiProxyAdmin,
    //             proxyAdminAddress,
    //             nonOperatorClient,
    //             nonOperatorAccount,
    //             proxyAddress,
    //             nonOperatorIsE25519
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Upgrade Proxy implementation with the proxy admin and the owner account', async function () {
    //     // Deploy a new contract
    //     const result = await deployContractsWithSDK({
    //         name: TOKEN_NAME,
    //         symbol: TOKEN_SYMBOL,
    //         decimals: TOKEN_DECIMALS,
    //         initialSupply: INIT_SUPPLY.toString(),
    //         maxSupply: MAX_SUPPLY.toString(),
    //         memo: TOKEN_MEMO,
    //         account: operatorAccount,
    //         privateKey: operatorPriKey,
    //         publicKey: operatorPubKey,
    //         isED25519Type: operatorIsE25519,
    //         initialAmountDataFeed: INIT_SUPPLY.toString(),
    //     })
    //     const newImplementationContract = result[2]
    //     // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
    //     await upgrade(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(newImplementationContract.toString())).evm_address,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     // Check new implementation address
    //     const implementation = await getProxyImplementation(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     expect(implementation.toUpperCase()).to.equals(
    //         (await getContractInfo(newImplementationContract.toString())).evm_address.toUpperCase()
    //     )
    //     // reset
    //     await upgrade(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(stableCoinAddress.toString())).evm_address,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    // })
    // it('Change Proxy admin with the proxy admin and the owner account', async function () {
    //     // Owner changes admin : success
    //     await changeProxyAdmin(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         operatorAccount,
    //         proxyAddress,
    //         operatorIsE25519
    //     )
    //     // Now we cannot get the admin using the Proxy admin contract.
    //     await expect(
    //         getProxyAdmin(
    //             abiProxyAdmin,
    //             proxyAdminAddress,
    //             operatorClient,
    //             (await getContractInfo(proxyAddress.toString())).evm_address
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    //     // Check that proxy admin has been changed
    //     const _admin = await admin(ITransparentUpgradeableProxy__factory.abi, proxyAddress, operatorClient)
    //     expect(_admin.toUpperCase()).to.equals((await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase())
    //     // reset
    //     await changeAdmin(
    //         ITransparentUpgradeableProxy__factory.abi,
    //         proxyAddress,
    //         operatorClient,
    //         await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
    //     )
    //     await changeAdmin(
    //         ITransparentUpgradeableProxy__factory.abi,
    //         proxyAddress,
    //         nonOperatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    // })
    // it('Transfers Proxy admin owner without the owner account', async function () {
    //     // Non Owner transfers owner : fail
    //     await expect(
    //         transferOwnership(
    //             abiProxyAdmin,
    //             proxyAdminAddress,
    //             nonOperatorClient,
    //             nonOperatorAccount,
    //             nonOperatorIsE25519
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Transfers Proxy admin owner with the owner account', async function () {
    //     // Owner transfers owner : success
    //     await transferOwnership(
    //         abiProxyAdmin,
    //         proxyAdminAddress,
    //         operatorClient,
    //         nonOperatorAccount,
    //         nonOperatorIsE25519
    //     )
    //     await sleep(5000)
    //     await acceptOwnership_SCF(proxyAdminAddress, nonOperatorClient)
    //     // Check
    //     const ownerAccount = await owner(abiProxyAdmin, proxyAdminAddress, operatorClient)
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)).toUpperCase()
    //     )
    //     // reset
    //     await transferOwnership(abiProxyAdmin, proxyAdminAddress, nonOperatorClient, operatorAccount, operatorIsE25519)
    // })
})
