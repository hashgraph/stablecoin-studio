import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { NetworkChainId, NetworkName, NetworkNameByChainId } from '@configuration'
import {
    HederaReserve__factory,
    HederaTokenManager,
    HederaTokenManager__factory,
    StableCoinFactory,
    StableCoinFactory__factory,
} from '@typechain'
import {
    ADDRESS_ZERO,
    delay,
    deployContractWithFactory,
    DeployContractWithFactoryCommand,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    ValidateTxResponseCommand,
} from '@scripts'
import {
    deployFullInfrastructureInTests,
    GAS_LIMIT,
    INIT_SUPPLY,
    MAX_SUPPLY,
    TOKEN_DECIMALS,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from '@test/shared'
import { configuration } from '@hardhat-configuration'
import { BigNumber } from 'ethers'

const toReserve = (amount: BigNumber) => {
    return amount.div(10)
}

describe('StableCoinFactory Tests', function () {
    // Contracts
    let factoryProxyAddress: string
    let factoryProxyAdminAddress: string
    let factoryAddress: string
    let factory: StableCoinFactory
    let hederaTokenManager: HederaTokenManager
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress
    before(async function () {
        // Disable | Mock console.log()
        console.log = () => {} // eslint-disable-line
        // * Deploy StableCoin Token
        console.info('  🏗️ Deploying full infrastructure...')
        ;[operator, nonOperator] = await ethers.getSigners()
        // Use deployed factory or deploy a new one
        const chainId = (await ethers.provider.getNetwork()).chainId as NetworkChainId
        const networkName = NetworkNameByChainId[chainId]
        if (configuration.contracts.StableCoinFactory.addresses?.[networkName]?.proxyAddress) {
            factoryProxyAddress = configuration.contracts.StableCoinFactory.addresses[networkName].proxyAddress!
        } else {
            // eslint-disable-next-line
            ;({ factoryAddress, factoryProxyAddress, factoryProxyAdminAddress } = await deployFullInfrastructureInTests(
                {
                    signer: operator,
                    network: network.name as NetworkName,
                }
            ))
        }
        factory = StableCoinFactory__factory.connect(factoryProxyAddress, operator)
        // Set Configuration contract
        configuration.setContractAddressList({
            contractName: 'StableCoinFactory',
            network: networkName,
            addresses: {
                proxyAddress: factoryProxyAddress,
                proxyAdminAddress: factoryProxyAdminAddress,
                address: factoryAddress,
            },
        })
    })

    it('Create StableCoin setting all token keys to the Proxy', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: true,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from('100000')).toString(),
        })
        await deployFullInfrastructure(command)
    })

    it('Create StableCoin setting all token keys to the Account', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: true,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from('100000')).toString(),
        })
        await deployFullInfrastructure(command)
    })

    it('Create StableCoin setting all token keys to the Account, with a very close reserve number', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: true,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from('1')).toString(),
        })
        await deployFullInfrastructure(command)
    })

    it('Create StableCoin setting all token keys to the Account, with no reserve', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from(1)).toString(),
            createReserve: false,
        })
        const deploymentResult = await deployFullInfrastructure(command)

        hederaTokenManager = HederaTokenManager__factory.connect(
            deploymentResult.stableCoinDeployment.proxyAddress,
            operator
        )

        const reserveAddress = hederaTokenManager.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        const reserveAmount = hederaTokenManager.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        expect(await reserveAddress).to.equal(ADDRESS_ZERO)
        expect(await reserveAmount).to.equal(BigNumber.from(0))

        expect(deploymentResult.stableCoinDeployment.reserveProxyAddress).to.equal(ADDRESS_ZERO)
        expect(deploymentResult.stableCoinDeployment.reserveProxyAdminAddress).to.equal(ADDRESS_ZERO)
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).toString(),
        })
        const deploymentResult = await deployFullInfrastructure(command)

        hederaTokenManager = HederaTokenManager__factory.connect(
            deploymentResult.stableCoinDeployment.proxyAddress,
            operator
        )

        const reserveAddress = hederaTokenManager.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        const reserveAmount = hederaTokenManager.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        expect(await reserveAddress).not.to.equal(ADDRESS_ZERO)
        expect((await reserveAmount).toString()).to.equal(toReserve(INIT_SUPPLY).toString())
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve, expect it to fail', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).sub(1).toString(),
        })
        await expect(deployFullInfrastructure(command)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, expect it to fail', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: BigNumber.from(1).toString(),
        })
        await expect(deployFullInfrastructure(command)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, expect it to fail with a very close number', async function () {
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).sub(1).toString(),
        })
        await expect(deployFullInfrastructure(command)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, when the reserve is provided and not deployed, expect it to fail', async function () {
        // first deploy Hedera Reserve
        const { contract: newHederaReserve } = await deployContractWithFactory(
            new DeployContractWithFactoryCommand({
                signer: operator,
                factory: new HederaReserve__factory(),
                withProxy: true,
            })
        )
        const DataFeedAddress = newHederaReserve.address

        const reserveAmount = BigNumber.from(1)
        // Deploy Token using Client
        const initSupplyAmount = reserveAmount.add(1)
        const maxSupplyAmount = initSupplyAmount.add(1)
        // Deploy Token using Client
        const command = await DeployFullInfrastructureCommand.newInstance({
            signer: operator,
            useDeployed: false,
            tokenInformation: {
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                decimals: TOKEN_DECIMALS,
                initialSupply: initSupplyAmount.toString(),
                maxSupply: maxSupplyAmount.toString(),
                memo: TOKEN_MEMO,
                freeze: false,
            },
            allToContract: false,
            reserveAddress: String(DataFeedAddress),
            createReserve: false,
        })
        await expect(deployFullInfrastructure(command)).to.be.rejectedWith(Error)
    })

    it('Get hederaTokenManager addresses', async function () {
        const addressList = await factory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })
        expect(addressList.length).to.greaterThan(0)
    })

    it('Get admin addresses', async function () {
        const adminAddress = await factory.getAdmin({
            gasLimit: GAS_LIMIT.stableCoinFactory.getAdmin,
        })

        expect(adminAddress.toUpperCase()).to.equals(operator.address.toUpperCase())
    })

    it('Add new hederaTokenManager address', async function () {
        const { address: newHederaTokenManagerAddress } = await deployContractWithFactory(
            new DeployContractWithFactoryCommand({
                factory: new HederaTokenManager__factory(),
                signer: operator,
                withProxy: false,
                deployedContract: undefined,
                overrides: {
                    gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
                },
            })
        )
        const addResponse = await factory.addHederaTokenManagerVersion(newHederaTokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.addHederaTokenManagerVersion,
        })
        await new ValidateTxResponseCommand({ txResponse: addResponse }).execute()

        const addressList: Array<string> = await factory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })

        expect(addressList[addressList.length - 1].toUpperCase()).to.equal(newHederaTokenManagerAddress.toUpperCase())
    })

    it('Add new hederaTokenManager address, throw error address is zero', async function () {
        const addResponse = await factory.addHederaTokenManagerVersion(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.stableCoinFactory.addHederaTokenManagerVersion,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: addResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Add new hederaTokenManager address throw error client no isAdmin', async function () {
        const { address: newHederaTokenManagerAddress } = await deployContractWithFactory(
            new DeployContractWithFactoryCommand({
                factory: new HederaTokenManager__factory(),
                signer: operator,
                withProxy: false,
                deployedContract: undefined,
                overrides: {
                    gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
                },
            })
        )
        const addResponse = await factory
            .connect(nonOperator)
            .addHederaTokenManagerVersion(newHederaTokenManagerAddress, {
                gasLimit: GAS_LIMIT.stableCoinFactory.addHederaTokenManagerVersion,
            })
        expect(new ValidateTxResponseCommand({ txResponse: addResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Edit hederaTokenManager address', async function () {
        const { address: newHederaTokenManagerAddress } = await deployContractWithFactory(
            new DeployContractWithFactoryCommand({
                factory: new HederaTokenManager__factory(),
                signer: operator,
                withProxy: false,
                deployedContract: undefined,
                overrides: {
                    gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
                },
            })
        )

        const index = 0
        const editResponse = await factory.editHederaTokenManagerAddress(index, newHederaTokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.editHederaTokenManagerAddress,
        })
        await new ValidateTxResponseCommand({ txResponse: editResponse }).execute()

        const addressList: Array<string> = await factory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })

        expect(addressList[index].toUpperCase()).to.equal(newHederaTokenManagerAddress.toUpperCase())
    })

    it('Edit hederaTokenManager address, throw error address is zero', async function () {
        const editResponse = await factory.editHederaTokenManagerAddress(0, ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.stableCoinFactory.editHederaTokenManagerAddress,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: editResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Edit hederaTokenManager address throw error client no isAdmin', async function () {
        const { address: newHederaTokenManagerAddress } = await deployContractWithFactory(
            new DeployContractWithFactoryCommand({
                factory: new HederaTokenManager__factory(),
                signer: operator,
                withProxy: false,
                deployedContract: undefined,
                overrides: {
                    gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
                },
            })
        )

        const editResponse = await factory
            .connect(nonOperator)
            .editHederaTokenManagerAddress(0, newHederaTokenManagerAddress, {
                gasLimit: GAS_LIMIT.stableCoinFactory.editHederaTokenManagerAddress,
            })
        await expect(new ValidateTxResponseCommand({ txResponse: editResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Change admin stablecoinFactory', async function () {
        const changeAdminResponse = await factory.changeAdmin(nonOperator.address, {
            gasLimit: GAS_LIMIT.stableCoinFactory.changeAdmin,
        })
        await new ValidateTxResponseCommand({ txResponse: changeAdminResponse }).execute()

        const adminAddress = await factory.getAdmin({
            gasLimit: GAS_LIMIT.stableCoinFactory.getAdmin,
        })
        expect(adminAddress.toUpperCase()).to.equals(nonOperator.address.toUpperCase())

        // Reset state
        const resetResponse = await factory.changeAdmin(operator.address, {
            gasLimit: GAS_LIMIT.stableCoinFactory.changeAdmin,
        })
        await new ValidateTxResponseCommand({ txResponse: resetResponse }).execute()

        const adminAddressReset = await factory.getAdmin({
            gasLimit: GAS_LIMIT.stableCoinFactory.getAdmin,
        })

        expect(adminAddressReset.toUpperCase()).to.equals(operator.address.toUpperCase())
    })

    it('Change admin, throw error address is zero', async function () {
        const changeAdminResponse = await factory.changeAdmin(ADDRESS_ZERO, {
            gasLimit: GAS_LIMIT.stableCoinFactory.changeAdmin,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: changeAdminResponse }).execute()).to.be.rejectedWith(
            Error
        )
    })

    it('Change admin, throw error client no isAdmin', async function () {
        const changeAdminResponse = await factory.connect(nonOperator).changeAdmin(nonOperator.address, {
            gasLimit: GAS_LIMIT.stableCoinFactory.changeAdmin,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: changeAdminResponse }).execute()).to.be.rejectedWith(
            Error
        )
    })

    it('Remove hederaTokenManager address', async function () {
        const index = 0
        const removeResponse = await factory.removeHederaTokenManagerAddress(index, {
            gasLimit: GAS_LIMIT.stableCoinFactory.removeHederaTokenManagerAddress,
        })

        const addressList = await factory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })
        await delay({ time: 1, unit: 'sec' })
        expect(addressList[index].toUpperCase()).to.be.equal(ADDRESS_ZERO.toUpperCase())
    })

    it('Remove hederaTokenManager address, throw error index no exists', async function () {
        const removeResponse = await factory.removeHederaTokenManagerAddress(10, {
            gasLimit: GAS_LIMIT.stableCoinFactory.removeHederaTokenManagerAddress,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: removeResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Remove hederaTokenManager address throw error client no isAdmin', async function () {
        const removeResponse = await factory.connect(nonOperator).removeHederaTokenManagerAddress(0, {
            gasLimit: GAS_LIMIT.stableCoinFactory.removeHederaTokenManagerAddress,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: removeResponse }).execute()).to.be.rejectedWith(Error)
    })
})

// TODO: refactor this for RPC compatibility after upgrade review
describe.skip('StableCoinFactoryProxy and StableCoinFactoryProxyAdmin Tests', function () {
    // before(async function () {
    //     // Deploy Token using Client
    //     clientSdk = getClient()
    //     clientSdk.setOperator(operatorAccount, toHashgraphKey(operatorPriKey, operatorIsE25519))
    //     const hederaTokenManager = await deployHederaTokenManager(clientSdk, operatorPriKey)
    //     const initializeFactory = {
    //         admin: await toEvmAddress(operatorAccount, operatorIsE25519),
    //         tokenManager: (await getContractInfo(hederaTokenManager.toString())).evm_address,
    //     }
    //     const result = await deployFactory(initializeFactory, clientSdk, operatorPriKey, operatorIsE25519)
    //     proxyAddress = result[0]
    //     proxyAdminAddress = result[1]
    //     factoryAddress = result[2]
    // })
    // it('Retrieve admin and implementation addresses for the Proxy', async function () {
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const implementation = await getProxyImplementation_SCF(
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     const admin = await getProxyAdmin_SCF(
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     // We check their values : success
    //     expect(implementation.toUpperCase()).to.equals(
    //         (await getContractInfo(factoryAddress.toString())).evm_address.toUpperCase()
    //     )
    //     expect(admin.toUpperCase()).to.equals(
    //         (await getContractInfo(proxyAdminAddress.toString())).evm_address.toUpperCase()
    //     )
    // })
    // it('Retrieve proxy admin owner', async function () {
    //     // We retreive the HederaTokenManagerProxy admin and implementation
    //     const ownerAccount = await owner_SCF(proxyAdminAddress, operatorClient)
    //     // We check their values : success
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase()
    //     )
    // })
    // it('Upgrade Proxy implementation without the proxy admin', async function () {
    //     // Deploy a new contract
    //     const hederaTokenManager = await deployHederaTokenManager(clientSdk, operatorPriKey)
    //     const initializeFactory = {
    //         admin: await toEvmAddress(operatorAccount, operatorIsE25519),
    //         tokenManager: (await getContractInfo(hederaTokenManager.toString())).evm_address,
    //     }
    //     const result = await deployFactory(initializeFactory, clientSdk, operatorPriKey, operatorIsE25519)
    //     const newImplementationContract = result[2]
    //     // Non Admin upgrades implementation : fail
    //     await expect(
    //         upgradeTo_SCF(
    //             proxyAddress,
    //             operatorClient,
    //             (await getContractInfo(newImplementationContract.toString())).evm_address
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Change Proxy admin without the proxy admin', async function () {
    //     // Non Admin changes admin : fail
    //     await expect(
    //         changeAdmin_SCF(
    //             proxyAddress,
    //             nonOperatorClient,
    //             await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
    //     const hederaTokenManager = await deployHederaTokenManager(clientSdk, operatorPriKey)
    //     const initializeFactory = {
    //         admin: await toEvmAddress(operatorAccount, operatorIsE25519),
    //         tokenManager: (await getContractInfo(hederaTokenManager.toString())).evm_address,
    //     }
    //     // Deploy a new contract
    //     const result = await deployFactory(initializeFactory, clientSdk, operatorPriKey, operatorIsE25519)
    //     const newImplementationContract = result[2]
    //     // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
    //     await expect(
    //         upgrade_SCF(
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
    //         changeProxyAdmin_SCF(
    //             proxyAdminAddress,
    //             nonOperatorClient,
    //             nonOperatorAccount,
    //             proxyAddress,
    //             nonOperatorIsE25519
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Upgrade Proxy implementation with the proxy admin and the owner account', async function () {
    //     const hederaTokenManager = await deployHederaTokenManager(clientSdk, operatorPriKey)
    //     const initializeFactory = {
    //         admin: await toEvmAddress(operatorAccount, operatorIsE25519),
    //         tokenManager: (await getContractInfo(hederaTokenManager.toString())).evm_address,
    //     }
    //     // Deploy a new contract
    //     const result = await deployFactory(initializeFactory, clientSdk, operatorPriKey, operatorIsE25519)
    //     const newImplementationContract = result[2]
    //     // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
    //     await upgrade_SCF(
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(newImplementationContract.toString())).evm_address,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     // Check new implementation address
    //     const implementation = await getProxyImplementation_SCF(
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    //     expect(implementation.toUpperCase()).to.equals(
    //         (await getContractInfo(newImplementationContract.toString())).evm_address.toUpperCase()
    //     )
    //     // reset
    //     await upgrade_SCF(
    //         proxyAdminAddress,
    //         operatorClient,
    //         (await getContractInfo(factoryAddress.toString())).evm_address,
    //         (await getContractInfo(proxyAddress.toString())).evm_address
    //     )
    // })
    // it('Change Proxy admin with the proxy admin and the owner account', async function () {
    //     // Owner changes admin : success
    //     await changeProxyAdmin_SCF(proxyAdminAddress, operatorClient, operatorAccount, proxyAddress, operatorIsE25519)
    //     // Now we cannot get the admin using the Proxy admin contract.
    //     await expect(
    //         getProxyAdmin_SCF(
    //             proxyAdminAddress,
    //             operatorClient,
    //             (await getContractInfo(proxyAddress.toString())).evm_address
    //         )
    //     ).to.eventually.be.rejectedWith(Error)
    //     // Check that proxy admin has been changed
    //     const _admin = await admin_SCF(proxyAddress, operatorClient)
    //     expect(_admin.toUpperCase()).to.equals((await toEvmAddress(operatorAccount, operatorIsE25519)).toUpperCase())
    //     // reset
    //     await changeAdmin_SCF(proxyAddress, operatorClient, await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519))
    //     await changeAdmin_SCF(
    //         proxyAddress,
    //         nonOperatorClient,
    //         (await getContractInfo(proxyAdminAddress.toString())).evm_address
    //     )
    // })
    // it('Transfers Proxy admin owner without the owner account', async function () {
    //     // Non Owner transfers owner : fail
    //     await expect(
    //         transferOwnership_SCF(proxyAdminAddress, nonOperatorClient, nonOperatorAccount, nonOperatorIsE25519)
    //     ).to.eventually.be.rejectedWith(Error)
    // })
    // it('Transfers Proxy admin owner with the owner account', async function () {
    //     // Owner transfers owner : success
    //     await transferOwnership_SCF(proxyAdminAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519)
    //     // Check
    //     const pendingOwnerAccount = await pendingOwner_SCF(proxyAdminAddress, operatorClient)
    //     expect(pendingOwnerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)).toUpperCase()
    //     )
    //     // Accept owner change
    //     await acceptOwnership_SCF(proxyAdminAddress, nonOperatorClient)
    //     // Check
    //     const ownerAccount = await owner_SCF(proxyAdminAddress, operatorClient)
    //     expect(ownerAccount.toUpperCase()).to.equals(
    //         (await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)).toUpperCase()
    //     )
    //     // reset
    //     await transferOwnership_SCF(proxyAdminAddress, nonOperatorClient, operatorAccount, operatorIsE25519)
    //     await acceptOwnership_SCF(proxyAdminAddress, operatorClient)
    // })
})
