/* eslint-disable @typescript-eslint/no-unused-vars */
import { BigNumber } from 'ethers'
import {
    allTokenKeystoKey,
    deployContractsWithSDK,
    tokenKeystoContract,
    tokenKeystoKey,
} from '../scripts/deploy'
import {
    acceptOwnership_SCF,
    admin,
    changeAdmin,
    changeProxyAdmin,
    decimals,
    getMetadata,
    getProxyAdmin,
    getProxyImplementation,
    getRoles,
    getTokenAddress,
    getTotalSupply,
    initialize,
    isUnlimitedSupplierAllowance,
    Mint,
    name,
    owner,
    symbol,
    transferOwnership,
    updateToken,
    upgrade,
    upgradeTo,
} from '../scripts/contractsMethods'
import {
    getContractInfo,
    oneYearLaterInSeconds,
    sleep,
    toEvmAddress,
} from '../scripts/utils'
import { ContractId } from '@hashgraph/sdk'
import {
    ITransparentUpgradeableProxy__factory,
    ProxyAdmin__factory,
} from '../typechain-types'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    ADDRESS_ZERO,
    BURN_ROLE,
    CASHIN_ROLE,
    DEFAULT_ADMIN_ROLE,
    DELETE_ROLE,
    FREEZE_ROLE,
    KYC_ROLE,
    PAUSE_ROLE,
    RESCUE_ROLE,
    RolesId,
    WIPE_ROLE,
    WITHOUT_ROLE,
} from '../scripts/constants'
import {
    IContractIdMap,
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
    regularFactory,
    TOKEN_DECIMALS,
    TOKEN_FACTOR,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let stableCoinAddress: ContractId
const abiProxyAdmin = ProxyAdmin__factory.abi

export const hederaTokenManager = (deployedContracts: IContractIdMap) => {
    describe('HederaTokenManager Tests', function () {
        before(async function () {
            // Deploy Token using Client
            proxyAddress = deployedContracts[regularFactory][0]
        })

        it('Cannot Update token if not Admin', async function () {
            const keys = tokenKeystoKey(operatorPubKey, operatorIsE25519)
            await expect(
                updateToken(
                    proxyAddress,
                    'newName',
                    'newSymbol',
                    keys,
                    oneYearLaterInSeconds(),
                    7890000,
                    TOKEN_MEMO,
                    nonOperatorClient
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Admin cannot update token if metadata more than 100 chars', async function () {
            const keysToKey = tokenKeystoKey(
                operatorPubKey,
                operatorIsE25519,
                false
            )
            await expect(
                updateToken(
                    proxyAddress,
                    'newName',
                    'newSymbol',
                    keysToKey,
                    oneYearLaterInSeconds(),
                    7890000,
                    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    operatorClient
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Admin can update token', async function () {
            const keysToKey = tokenKeystoKey(
                operatorPubKey,
                operatorIsE25519,
                false
            )
            await updateToken(
                proxyAddress,
                'newName',
                'newSymbol',
                keysToKey,
                oneYearLaterInSeconds(),
                7890000,
                TOKEN_MEMO,
                operatorClient
            )

            const newMetadata = await getMetadata(proxyAddress, operatorClient)

            expect(newMetadata).to.equal(TOKEN_MEMO)

            const keysToContract = tokenKeystoContract(false)
            await updateToken(
                proxyAddress,
                TOKEN_NAME,
                TOKEN_SYMBOL,
                keysToContract,
                0,
                7776000,
                '',
                operatorClient
            )
        })

        it('Admin and supply token keys cannot be updated', async function () {
            const keysToKey = allTokenKeystoKey(
                operatorPubKey,
                operatorIsE25519,
                false
            )
            await expect(
                updateToken(
                    proxyAddress,
                    'newName',
                    'newSymbol',
                    keysToKey,
                    oneYearLaterInSeconds(),
                    7890000,
                    TOKEN_MEMO,
                    operatorClient
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('deploy SC with roles associated to another account', async function () {
            // Deploy Token using Client
            const creation = await deployContractsWithSDK({
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
                allRolesToCreator: false,
                RolesToAccount: nonOperatorAccount,
                isRolesToAccountE25519: nonOperatorIsE25519,
            })

            const newProxyAddress = creation[0]

            // Checking roles
            const resultNonOperatorAccount = await getRoles(
                newProxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
            const isUnlimitedNonOperator = await isUnlimitedSupplierAllowance(
                newProxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            const resultOperatorAccount = await getRoles(
                newProxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
            const isUnlimitedOperator = await isUnlimitedSupplierAllowance(
                newProxyAddress,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            expect(isUnlimitedOperator).to.eq(false)
            expect(isUnlimitedNonOperator).to.eq(true)

            for (let i = 0; i < resultOperatorAccount.length; i++) {
                if (i == RolesId.Cashin)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Burn)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Delete)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Freeze)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Wipe)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Rescue)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Pause)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Kyc)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Admin)
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        DEFAULT_ADMIN_ROLE.toUpperCase()
                    )
                else
                    expect(resultOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
            }

            for (let i = 0; i < resultNonOperatorAccount.length; i++) {
                if (i == RolesId.Cashin)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        CASHIN_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Burn)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        BURN_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Delete)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        DELETE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Freeze)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        FREEZE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Wipe)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        WIPE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Rescue)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        RESCUE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Pause)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        PAUSE_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Kyc)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        KYC_ROLE.toUpperCase()
                    )
                else if (i == RolesId.Admin)
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
                else
                    expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(
                        WITHOUT_ROLE.toUpperCase()
                    )
            }
        })

        it('input parmeters check', async function () {
            // We retreive the Token basic params
            const retrievedTokenName = await name(proxyAddress, operatorClient)
            const retrievedTokenSymbol = await symbol(
                proxyAddress,
                operatorClient
            )
            const retrievedTokenDecimals = await decimals(
                proxyAddress,
                operatorClient
            )
            const retrievedTokenTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            // We check their values : success
            expect(retrievedTokenName).to.equals(TOKEN_NAME)
            expect(retrievedTokenSymbol).to.equals(TOKEN_SYMBOL)
            expect(retrievedTokenDecimals).to.equals(TOKEN_DECIMALS)
            expect(retrievedTokenTotalSupply.toString()).to.equals(
                INIT_SUPPLY.toString()
            )
        })

        it('Check initialize can only be run once', async function () {
            // Retrieve current Token address
            const TokenAddress = await getTokenAddress(
                proxyAddress,
                operatorClient
            )

            // Initiliaze : fail
            await expect(
                initialize(proxyAddress, operatorClient, TokenAddress)
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Mint token throw error format number incorrrect', async () => {
            const initialTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            await expect(
                Mint(
                    proxyAddress,
                    BigNumber.from(1),
                    operatorClient,
                    operatorAccount,
                    operatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)

            const afterErrorTotalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            expect(initialTotalSupply).to.equal(afterErrorTotalSupply)

            await Mint(
                proxyAddress,
                BigNumber.from(1).mul(TOKEN_FACTOR),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )

            const totalSupply = await getTotalSupply(
                proxyAddress,
                operatorClient
            )

            expect(totalSupply).to.equal(
                initialTotalSupply.add(BigNumber.from(1).mul(TOKEN_FACTOR))
            )
        })
    })

    describe('HederaTokenManagerProxy and HederaTokenManagerProxyAdmin Tests', function () {
        before(async function () {
            // Deploy Token using Client
            proxyAddress = deployedContracts[regularFactory][0]
            proxyAdminAddress = deployedContracts[regularFactory][1]
            stableCoinAddress = deployedContracts[regularFactory][2]
        })

        it('Can deploy a stablecoin where proxy admin owner is the deploying account', async function () {
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
                proxyAdminOwnerAccount: ADDRESS_ZERO,
            })

            // We retreive the HederaTokenManagerProxy admin and implementation
            const ownerAccount = await owner(
                abiProxyAdmin,
                result[1],
                operatorClient
            )

            // We check their values : success
            expect(ownerAccount.toUpperCase()).to.equals(
                (
                    await toEvmAddress(operatorAccount, operatorIsE25519)
                ).toUpperCase()
            )
        })

        it('Can deploy a stablecoin where proxy admin owner is not the deploying account', async function () {
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
                proxyAdminOwnerAccount: await toEvmAddress(
                    nonOperatorAccount,
                    nonOperatorIsE25519
                ),
            })

            // We retreive the HederaTokenManagerProxy admin and implementation
            const ownerAccount = await owner(
                abiProxyAdmin,
                result[1],
                operatorClient
            )

            // We check their values : success
            expect(ownerAccount.toUpperCase()).to.equals(
                (
                    await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
                ).toUpperCase()
            )
        })

        it('Retrieve admin and implementation addresses for the Proxy', async function () {
            // We retreive the HederaTokenManagerProxy admin and implementation
            const implementation = await getProxyImplementation(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
            const admin = await getProxyAdmin(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )

            // We check their values : success
            expect(implementation.toUpperCase()).to.equals(
                (
                    await getContractInfo(stableCoinAddress.toString())
                ).evm_address.toUpperCase()
            )
            expect(admin.toUpperCase()).to.equals(
                (
                    await getContractInfo(proxyAdminAddress.toString())
                ).evm_address.toUpperCase()
            )
        })

        it('Retrieve proxy admin owner', async function () {
            // We retreive the HederaTokenManagerProxy admin and implementation
            const ownerAccount = await owner(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient
            )

            // We check their values : success
            expect(ownerAccount.toUpperCase()).to.equals(
                (
                    await toEvmAddress(operatorAccount, operatorIsE25519)
                ).toUpperCase()
            )
        })

        it('Upgrade Proxy implementation without the proxy admin', async function () {
            // Deploy a new contract
            const result = deployedContracts[regularFactory]

            const newImplementationContract = result[2]

            // Non Admin upgrades implementation : fail
            await expect(
                upgradeTo(
                    abiProxyAdmin,
                    proxyAddress,
                    operatorClient,
                    (
                        await getContractInfo(
                            newImplementationContract.toString()
                        )
                    ).evm_address
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Change Proxy admin without the proxy admin', async function () {
            // Non Admin changes admin : fail
            await expect(
                changeAdmin(
                    abiProxyAdmin,
                    proxyAddress,
                    operatorClient,
                    await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
            // Deploy a new contract
            const result = deployedContracts[regularFactory]

            const newImplementationContract = result[2]

            // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
            await expect(
                upgrade(
                    abiProxyAdmin,
                    proxyAdminAddress,
                    nonOperatorClient,
                    (
                        await getContractInfo(
                            newImplementationContract.toString()
                        )
                    ).evm_address,
                    (
                        await getContractInfo(proxyAddress.toString())
                    ).evm_address
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Change Proxy admin with the proxy admin but without the owner account', async function () {
            // Non Owner changes admin : fail
            await expect(
                changeProxyAdmin(
                    abiProxyAdmin,
                    proxyAdminAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    proxyAddress,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Upgrade Proxy implementation with the proxy admin and the owner account', async function () {
            // Deploy a new contract
            const result = deployedContracts[regularFactory]

            const newImplementationContract = result[2]

            // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
            await upgrade(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(newImplementationContract.toString())
                ).evm_address,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )

            // Check new implementation address
            const implementation = await getProxyImplementation(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
            expect(implementation.toUpperCase()).to.equals(
                (
                    await getContractInfo(newImplementationContract.toString())
                ).evm_address.toUpperCase()
            )

            // reset
            await upgrade(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(stableCoinAddress.toString())
                ).evm_address,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
        })

        it('Change Proxy admin with the proxy admin and the owner account', async function () {
            // Owner changes admin : success
            await changeProxyAdmin(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                operatorAccount,
                proxyAddress,
                operatorIsE25519
            )

            // Now we cannot get the admin using the Proxy admin contract.
            await expect(
                getProxyAdmin(
                    abiProxyAdmin,
                    proxyAdminAddress,
                    operatorClient,
                    (
                        await getContractInfo(proxyAddress.toString())
                    ).evm_address
                )
            ).to.eventually.be.rejectedWith(Error)

            // Check that proxy admin has been changed
            const _admin = await admin(
                ITransparentUpgradeableProxy__factory.abi,
                proxyAddress,
                operatorClient
            )
            expect(_admin.toUpperCase()).to.equals(
                (
                    await toEvmAddress(operatorAccount, operatorIsE25519)
                ).toUpperCase()
            )

            // reset
            await changeAdmin(
                ITransparentUpgradeableProxy__factory.abi,
                proxyAddress,
                operatorClient,
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            )
            await changeAdmin(
                ITransparentUpgradeableProxy__factory.abi,
                proxyAddress,
                nonOperatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
        })

        it('Transfers Proxy admin owner without the owner account', async function () {
            // Non Owner transfers owner : fail
            await expect(
                transferOwnership(
                    abiProxyAdmin,
                    proxyAdminAddress,
                    nonOperatorClient,
                    nonOperatorAccount,
                    nonOperatorIsE25519
                )
            ).to.eventually.be.rejectedWith(Error)
        })

        it('Transfers Proxy admin owner with the owner account', async function () {
            // Owner transfers owner : success
            await transferOwnership(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )

            await sleep(5000)
            await acceptOwnership_SCF(proxyAdminAddress, nonOperatorClient)

            // Check
            const ownerAccount = await owner(
                abiProxyAdmin,
                proxyAdminAddress,
                operatorClient
            )
            expect(ownerAccount.toUpperCase()).to.equals(
                (
                    await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
                ).toUpperCase()
            )

            // reset
            await transferOwnership(
                abiProxyAdmin,
                proxyAdminAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        })
    })
}
