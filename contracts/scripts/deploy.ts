import { BaseContract, ContractFactory, Overrides } from 'ethers'
import { ethers } from 'hardhat'
import { configuration } from '@hardhat-configuration'
import {
    BurnableFacet__factory,
    BusinessLogicResolver__factory,
    CashInFacet__factory,
    CustomFeesFacet__factory,
    DeletableFacet__factory,
    DiamondFacet__factory,
    FreezableFacet__factory,
    HederaReserveFacet__factory,
    HederaTokenManagerFacet__factory,
    HoldManagementFacet__factory,
    KYCFacet__factory,
    PausableFacet__factory,
    ProxyAdmin__factory,
    RescuableFacet__factory,
    ReserveFacet__factory,
    RoleManagementFacet__factory,
    RolesFacet__factory,
    StableCoinFactoryFacet__factory,
    SupplierAdminFacet__factory,
    TokenOwnerFacet__factory,
    TransparentUpgradeableProxy__factory,
    WipeableFacet__factory,
    IHRC__factory,
    ResolverProxy__factory,
} from '@contracts'
import {
    MESSAGES,
    GAS_LIMIT,
    DeployContractResult,
    DeployFullInfrastructureCommand,
    ValidateTxResponseCommand,
    validateTxResponse,
    VALUE,
    TransactionReceiptError,
    DeployFullInfrastructureResult,
    DeployScsContractListCommand,
    DeployScsContractListResult,
    BusinessLogicResolverNotFound,
    CreateConfigurationsForDeployedContractsResult,
    RegisterDeployedContractBusinessLogicsCommand,
    registerDeployedContractBusinessLogics,
    CreateConfigurationsForDeployedContractsCommand,
    createConfigurationsForDeployedContracts,
    DeployStableCoinCommand,
    DeployStableCoinResult,
    CONFIG_ID,
    ROLES,
    DeployContractDirectCommand,
    DeployContractWithTupCommand,
    DeployContractWithResolverProxyCommand,
    DEFAULT_CONFIG_VERSION,
    DeployContractCommand,
    decodeEvent,
} from '@scripts'
import Environment from '@environment'

export let environment = Environment.empty()

export async function deployStableCoin({
    wallet,
    tokenStruct,
    businessLogicResolverProxyAddress,
    stableCoinFactoryProxyAddress,
    grantKYCToOriginalSender,
    useEnvironment,
}: DeployStableCoinCommand) {
    const stableCoinFactory = StableCoinFactoryFacet__factory.connect(stableCoinFactoryProxyAddress, wallet)
    // * Deploy new StableCoin using the Factory
    console.log(MESSAGES.stableCoinFactory.info.deployStableCoin)
    const deployScResponse = await stableCoinFactory.deployStableCoin(tokenStruct, {
        gasLimit: GAS_LIMIT.stableCoinFactory.deployStableCoin,
        value: VALUE.stableCoinFactory.deployStableCoin,
    })
    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: deployScResponse,
            errorMessage: MESSAGES.stableCoinFactory.error.deployStableCoin,
            confirmationEvent: 'Deployed',
        })
    )
    const deployScReceipt = await deployScResponse.wait()
    const deployedScEventData = await decodeEvent(stableCoinFactory, 'Deployed', deployScReceipt)
    if (!deployedScEventData) {
        // Should never happen because is checked in validateTxResponse
        throw new TransactionReceiptError({
            txHash: deployScResponse.hash,
            errorMessage: MESSAGES.stableCoinFactory.error.deployStableCoin,
        })
    }

    // * Associate token to deployer directly
    console.log(MESSAGES.hederaTokenManager.info.associate)
    const associateResponse = await IHRC__factory.connect(
        deployedScEventData.deployedStableCoin.tokenAddress,
        wallet
    ).associate({
        gasLimit: GAS_LIMIT.hederaTokenManager.associate,
    })
    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: associateResponse,
            errorMessage: MESSAGES.hederaTokenManager.error.associate,
        })
    )
    console.log(MESSAGES.hederaTokenManager.success.associate)

    // * Grant KYC to original sender
    console.log(MESSAGES.hederaTokenManager.info.grantKyc)
    if (grantKYCToOriginalSender) {
        const grantKYCResponse = await (
            await ethers.getContractAt('KYCFacet', deployedScEventData.deployedStableCoin.stableCoinProxy, wallet)
        ).grantKyc(wallet.address, { gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: grantKYCResponse,
                errorMessage: MESSAGES.hederaTokenManager.error.grantKyc,
            })
        )
    }
    console.log(MESSAGES.hederaTokenManager.success.grantKyc)

    if (useEnvironment) {
        const { stableCoinProxy, reserveProxy, tokenAddress } = deployedScEventData.deployedStableCoin
        if (!environment.initialized) {
            environment = new Environment({
                businessLogicResolver: BusinessLogicResolver__factory.connect(
                    businessLogicResolverProxyAddress,
                    wallet
                ),
                stableCoinProxyAddress: stableCoinProxy,
                tokenAddress: tokenAddress,
                reserveProxyAddress: reserveProxy,
            })
        } else {
            Object.assign(environment, {
                stableCoinProxyAddress: stableCoinProxy,
                tokenAddress: tokenAddress,
                reserveProxyAddress: reserveProxy,
            })
        }
    }
    console.log(MESSAGES.stableCoinFactory.success.deployStableCoin)
    return new DeployStableCoinResult({
        stableCoinProxyAddress: deployedScEventData.deployedStableCoin.stableCoinProxy,
        tokenAddress: deployedScEventData.deployedStableCoin.tokenAddress,
        reserveProxyAddress: deployedScEventData.deployedStableCoin.reserveProxy,
        receipt: deployScReceipt!,
    })
}

export async function deployFullInfrastructure({
    signer,
    network,
    useDeployed,
    useEnvironment,
    partialBatchDeploy,
}: DeployFullInfrastructureCommand): Promise<DeployFullInfrastructureResult> {
    console.log(MESSAGES.deploy.info.deployFullInfrastructure)
    if (useEnvironment && environment.initialized) {
        return environment.toDeployScsFullInfrastructureResult()
    }
    const usingDeployed = useDeployed && configuration.contracts.BusinessLogicResolver.addresses?.[network]

    // * Deploy all contracts
    const deployCommand = await DeployScsContractListCommand.newInstance({
        signer,
        useDeployed,
    })
    const { deployer, ...deployedContractList } = await deployScsContractList(deployCommand)

    // * Check if BusinessLogicResolver is deployed correctly
    const businessLogicResolver = deployedContractList.businessLogicResolver
    if (
        !businessLogicResolver.address ||
        !businessLogicResolver.proxyAddress ||
        !businessLogicResolver.proxyAdminAddress
    ) {
        throw new BusinessLogicResolverNotFound()
    }

    let facetLists = CreateConfigurationsForDeployedContractsResult.empty()
    if (!usingDeployed) {
        // * Initialize BusinessLogicResolver
        console.log(MESSAGES.businessLogicResolver.info.initialize)
        const initResponse = await businessLogicResolver.contract.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: initResponse,
                errorMessage: MESSAGES.businessLogicResolver.error.initialize,
            })
        )
        console.log(MESSAGES.businessLogicResolver.success.initialize)
        // * Register business logic contracts
        console.log(MESSAGES.businessLogicResolver.info.register)

        const registerCommand = new RegisterDeployedContractBusinessLogicsCommand({
            deployedContractList,
            signer,
        })
        await registerDeployedContractBusinessLogics(registerCommand)
        console.log(MESSAGES.businessLogicResolver.success.register)
        // * Create configurations for all Securities (EquityUSA, BondUSA)
        console.log(MESSAGES.businessLogicResolver.info.createConfigurations)
        const createCommand = new CreateConfigurationsForDeployedContractsCommand({
            deployedContractList,
            signer,
        })
        facetLists = await createConfigurationsForDeployedContracts(partialBatchDeploy, createCommand)
    }
    console.log(MESSAGES.businessLogicResolver.success.createConfigurations)
    console.log(MESSAGES.stableCoinFactory.info.deployFactoryResolverProxy)
    // * Deploy ResolverProxy for StableCoinFactory
    const resolverProxyDeployCommand = await DeployContractCommand.newInstance({
        factory: new ResolverProxy__factory(),
        signer,
        deployType: 'direct',
        deployedContract: useDeployed ? configuration.contracts.StableCoinFactoryFacet.addresses?.[network] : undefined,
        args: [
            businessLogicResolver.proxyAddress,
            CONFIG_ID.stableCoinFactory,
            DEFAULT_CONFIG_VERSION,
            [
                {
                    role: ROLES.defaultAdmin.hash,
                    account: await signer.getAddress(),
                },
            ],
        ],
        overrides: {
            gasLimit: GAS_LIMIT.resolverProxy.deploy,
        },
    })
    const stableCoinFactoryResolverProxy = await deployContract(resolverProxyDeployCommand)
    console.log(MESSAGES.stableCoinFactory.success.deployFactoryResolverProxy)
    // Store the proxy address in the deployed contract list
    deployedContractList.stableCoinFactoryFacet.proxyAddress = stableCoinFactoryResolverProxy.address

    console.log(MESSAGES.deploy.success.deployFullInfrastructure)

    // * Update Environment
    if (useEnvironment) {
        environment = new Environment({
            stableCoinFactoryFacetIdList: facetLists.stableCoinFactoryFacetIdList,
            stableCoinFactoryFacetVersionList: facetLists.stableCoinFactoryFacetVersionList,
            stableCoinFacetIdList: facetLists.stableCoinFacetIdList,
            stableCoinFacetVersionList: facetLists.stableCoinFacetVersionList,
            reserveFacetIdList: facetLists.reserveFacetIdList,
            reserveFacetVersionList: facetLists.reserveFacetVersionList,
            businessLogicResolver: businessLogicResolver.contract,
            stableCoinFactoryProxyAddress: stableCoinFactoryResolverProxy.address,
            deployedContracts: { deployer, ...deployedContractList },
        })
    }

    return new DeployFullInfrastructureResult({
        ...deployedContractList,
        deployer,
        facetLists,
    })
}

export async function deployScsContractList({
    signer,
    network,
    useDeployed,
}: DeployScsContractListCommand): Promise<DeployScsContractListResult> {
    const overrides: Overrides = { gasLimit: GAS_LIMIT.high } // If you want to override the default parameters
    const deployCommands = {
        businessLogicResolver: await DeployContractCommand.newInstance({
            factory: new BusinessLogicResolver__factory(),
            signer,
            deployType: 'tup',
            deployedContract: useDeployed
                ? configuration.contracts.BusinessLogicResolver.addresses?.[network]
                : undefined,
            overrides: { gasLimit: GAS_LIMIT.businessLogicResolver.deploy },
        }),
        diamondFacet: await DeployContractCommand.newInstance({
            factory: new DiamondFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.DiamondFacet.addresses?.[network] : undefined,
            overrides,
        }),
        stableCoinFactoryFacet: await DeployContractCommand.newInstance({
            factory: new StableCoinFactoryFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed
                ? configuration.contracts.StableCoinFactoryFacet.addresses?.[network]
                : undefined,
            overrides: {
                gasLimit: GAS_LIMIT.stableCoinFactory.deploy,
            },
        }),
        hederaTokenManagerFacet: await DeployContractCommand.newInstance({
            factory: new HederaTokenManagerFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed
                ? configuration.contracts.HederaTokenManagerFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        hederaReserveFacet: await DeployContractCommand.newInstance({
            factory: new HederaReserveFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.HederaReserveFacet.addresses?.[network] : undefined,
            overrides,
        }),
        burnableFacet: await DeployContractCommand.newInstance({
            factory: new BurnableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.BurnableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        cashInFacet: await DeployContractCommand.newInstance({
            factory: new CashInFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.CashInFacet.addresses?.[network] : undefined,
            overrides,
        }),
        customFeesFacet: await DeployContractCommand.newInstance({
            factory: new CustomFeesFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.CustomFeesFacet.addresses?.[network] : undefined,
            overrides,
        }),
        deletableFacet: await DeployContractCommand.newInstance({
            factory: new DeletableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.DeletableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        freezableFacet: await DeployContractCommand.newInstance({
            factory: new FreezableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.FreezableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        holdManagementFacet: await DeployContractCommand.newInstance({
            factory: new HoldManagementFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed
                ? configuration.contracts.HoldManagementFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        kycFacet: await DeployContractCommand.newInstance({
            factory: new KYCFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.KYCFacet.addresses?.[network] : undefined,
            overrides,
        }),
        pausableFacet: await DeployContractCommand.newInstance({
            factory: new PausableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.PausableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        rescuableFacet: await DeployContractCommand.newInstance({
            factory: new RescuableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.RescuableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        reserveFacet: await DeployContractCommand.newInstance({
            factory: new ReserveFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.ReserveFacet.addresses?.[network] : undefined,
            overrides,
        }),
        roleManagementFacet: await DeployContractCommand.newInstance({
            factory: new RoleManagementFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed
                ? configuration.contracts.RoleManagementFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        rolesFacet: await DeployContractCommand.newInstance({
            factory: new RolesFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.RolesFacet.addresses?.[network] : undefined,
            overrides,
        }),
        supplierAdminFacet: await DeployContractCommand.newInstance({
            factory: new SupplierAdminFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.SupplierAdminFacet.addresses?.[network] : undefined,
            overrides,
        }),
        tokenOwnerFacet: await DeployContractCommand.newInstance({
            factory: new TokenOwnerFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.TokenOwnerFacet.addresses?.[network] : undefined,
            overrides,
        }),
        wipeableFacet: await DeployContractCommand.newInstance({
            factory: new WipeableFacet__factory(),
            signer,
            deployType: 'direct',
            deployedContract: useDeployed ? configuration.contracts.WipeableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        // * Add other SCS contracts here following the pattern
        // Example:
        // cashToken: new deployContractCommand({
        //     factory: new CashToken__factory(),
        //     signer,
        //     deployType: 'direct',
        //     deployedContract: useDeployed ? configuration.contracts.CashToken.addresses?.[network] : undefined,
        //     overrides,
        // }),
    }

    // Deploy contracts sequentially

    const deployedContracts: DeployScsContractListResult = new DeployScsContractListResult({
        businessLogicResolver: await deployContract(deployCommands.businessLogicResolver).then((result) => {
            console.log('✓ BusinessLogicResolver has been deployed successfully', result.address)
            return result
        }),
        stableCoinFactoryFacet: await deployContract(deployCommands.stableCoinFactoryFacet).then((result) => {
            console.log('✓ StableCoinFactoryFacet has been deployed successfully', result.address)
            return result
        }),
        diamondFacet: await deployContract(deployCommands.diamondFacet).then((result) => {
            console.log('✓ DiamondFacet has been deployed successfully', result.address)
            return result
        }),
        hederaTokenManagerFacet: await deployContract(deployCommands.hederaTokenManagerFacet).then((result) => {
            console.log('✓ HederaTokenManager has been deployed successfully', result.address)
            return result
        }),
        hederaReserveFacet: await deployContract(deployCommands.hederaReserveFacet).then((result) => {
            console.log('✓ HederaReserveFacet has been deployed successfully', result.address)
            return result
        }),
        burnableFacet: await deployContract(deployCommands.burnableFacet).then((result) => {
            console.log('✓ BurnableFacet has been deployed successfully', result.address)
            return result
        }),
        cashInFacet: await deployContract(deployCommands.cashInFacet).then((result) => {
            console.log('✓ CashInFacet has been deployed successfully', result.address)
            return result
        }),
        customFeesFacet: await deployContract(deployCommands.customFeesFacet).then((result) => {
            console.log('✓ CustomFeesFacet has been deployed successfully', result.address)
            return result
        }),
        deletableFacet: await deployContract(deployCommands.deletableFacet).then((result) => {
            console.log('✓ DeletableFacet has been deployed successfully', result.address)
            return result
        }),
        freezableFacet: await deployContract(deployCommands.freezableFacet).then((result) => {
            console.log('✓ FreezableFacet has been deployed successfully', result.address)
            return result
        }),
        holdManagementFacet: await deployContract(deployCommands.holdManagementFacet).then((result) => {
            console.log('✓ HoldManagementFacet has been deployed successfully', result.address)
            return result
        }),
        kycFacet: await deployContract(deployCommands.kycFacet).then((result) => {
            console.log('✓ KYCFacet has been deployed successfully', result.address)
            return result
        }),
        pausableFacet: await deployContract(deployCommands.pausableFacet).then((result) => {
            console.log('✓ PausableFacet has been deployed successfully', result.address)
            return result
        }),
        rescuableFacet: await deployContract(deployCommands.rescuableFacet).then((result) => {
            console.log('✓ RescuableFacet has been deployed successfully', result.address)
            return result
        }),
        reserveFacet: await deployContract(deployCommands.reserveFacet).then((result) => {
            console.log('✓ ReserveFacet has been deployed successfully', result.address)
            return result
        }),
        roleManagementFacet: await deployContract(deployCommands.roleManagementFacet).then((result) => {
            console.log('✓ RoleManagementFacet has been deployed successfully', result.address)
            return result
        }),
        rolesFacet: await deployContract(deployCommands.rolesFacet).then((result) => {
            console.log('✓ RolesFacet has been deployed successfully', result.address)
            return result
        }),
        supplierAdminFacet: await deployContract(deployCommands.supplierAdminFacet).then((result) => {
            console.log('✓ SupplierAdminFacet has been deployed successfully', result.address)
            return result
        }),
        tokenOwnerFacet: await deployContract(deployCommands.tokenOwnerFacet).then((result) => {
            console.log('✓ TokenOwnerFacet has been deployed successfully', result.address)
            return result
        }),
        wipeableFacet: await deployContract(deployCommands.wipeableFacet).then((result) => {
            console.log('✓ WipeableFacet has been deployed successfully', result.address)
            return result
        }),
        // * Add results for other deployed SCS contracts here
        // Example:
        // cashToken: await deployContract(deployCommands.cashToken).then((result) => {
        //     console.log('CashToken has been deployed successfully',result.address)
        //     return result
        // }),
        deployer: signer,
    })

    return deployedContracts
}

/**
 * Deploys a smart contract and optionally its proxy and proxy admin.
 *
 * @param {DeployContractCommand} params - The deployment parameters.
 * @param {ContractName} params.name - The name of the contract to deploy.
 * @param {Signer} params.signer - The signer to use for the deployment.
 * @param {Array<any>} params.args - The arguments to pass to the contract constructor.
 * @returns {Promise<DeployContractResult>} A promise that resolves to the deployment result.
 *
 * @example
 * const result = await deployContract({
 *   name: 'MyContract',
 *   signer: mySigner,
 *   args: [arg1, arg2],
 * });
 */
export async function deployContract<
    F extends ContractFactory,
    C extends BaseContract = Awaited<ReturnType<F['deploy']>>,
>({
    name,
    factory,
    signer,
    args,
    deployType,
    deployedContract,
    overrides,
    ...withResolverProxyParams
}: DeployContractCommand<F>): Promise<DeployContractResult<C>> {
    if (deployedContract) {
        const contract = factory.attach(
            deployedContract.proxyAddress ? deployedContract.proxyAddress : deployedContract.address
        ) as C
        return new DeployContractResult<C>({
            name,
            contract,
            address: deployedContract.address,
            proxyAddress: deployedContract.proxyAddress,
            proxyAdminAddress: deployedContract.proxyAdminAddress,
            receipt: undefined,
        })
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
    if (deployType === 'direct') {
        const deployCommand = await DeployContractDirectCommand.newInstance({
            name,
            factory,
            signer,
            args,
            overrides,
        })
        return _deployContractDirect(deployCommand)
    }
    if (deployType === 'tup') {
        const deployCommand = await DeployContractWithTupCommand.newInstance({
            name,
            factory,
            signer,
            args,
            overrides,
        })
        return _deployContractWithTup(deployCommand)
    }
    if (deployType === 'resolverProxy') {
        const deployCommand = await DeployContractWithResolverProxyCommand.newInstance({
            name,
            factory,
            signer,
            args,
            overrides,
            ...withResolverProxyParams,
        })
        return _deployContractWithResolverProxy(deployCommand)
    }
    throw new Error(`Unknown deployType for contract ${name}: ${deployType}`)
}

async function _deployContractDirect<
    F extends ContractFactory,
    C extends BaseContract = Awaited<ReturnType<F['deploy']>>,
>({ name, factory, args, overrides }: DeployContractDirectCommand<F>): Promise<DeployContractResult<C>> {
    const contract = (await factory.deploy(...args, overrides)) as C
    await contract.waitForDeployment()
    const receipt = contract.deploymentTransaction()
    if (!receipt) {
        throw new Error('Deployment transaction not available')
    }
    return new DeployContractResult<C>({
        name,
        contract,
        address: await contract.getAddress(),
        receipt,
        proxyAddress: undefined,
        proxyAdminAddress: undefined,
    })
}

async function _deployContractWithTup<
    F extends ContractFactory,
    C extends BaseContract = Awaited<ReturnType<F['deploy']>>,
>({ name, factory, signer, args, overrides }: DeployContractWithTupCommand<F>): Promise<DeployContractResult<C>> {
    const contract = (await factory.connect(signer).deploy(...args, overrides)) as C
    await contract.waitForDeployment()
    const receipt = contract.deploymentTransaction()
    if (!receipt) {
        throw new Error('Deployment transaction not available')
    }

    const deployPaCommand = await DeployContractDirectCommand.newInstance({
        name: 'ProxyAdmin',
        factory: new ProxyAdmin__factory(),
        signer,
        args: undefined,
        overrides: {
            gasLimit: GAS_LIMIT.proxyAdmin.deploy,
        },
    })
    const { address: proxyAdminAddress } = await _deployContractDirect(deployPaCommand)

    const deployProxyCommand = await DeployContractDirectCommand.newInstance<TransparentUpgradeableProxy__factory>({
        name: 'TransparentUpgradeableProxy',
        factory: new TransparentUpgradeableProxy__factory(),
        signer,
        args: [await contract.getAddress(), proxyAdminAddress, '0x'],
        overrides: {
            gasLimit: GAS_LIMIT.tup.deploy,
        },
    })
    const { address: proxyAddress } = await _deployContractDirect(deployProxyCommand)

    return new DeployContractResult({
        name,
        address: await contract.getAddress(),
        contract: factory.attach(proxyAddress) as C,
        proxyAddress,
        proxyAdminAddress,
        receipt: await receipt,
    })
}

async function _deployContractWithResolverProxy<
    F extends ContractFactory,
    C extends BaseContract = Awaited<ReturnType<F['deploy']>>,
>({
    name,
    factory,
    signer,
    args,
    overrides,
    businessLogicResolverAddress,
    configurationId,
    configurationVersion,
    rolesStruct,
}: DeployContractWithResolverProxyCommand<F>): Promise<DeployContractResult<C>> {
    const contract = await factory.connect(signer).deploy(...args, overrides)
    await contract.waitForDeployment()
    const receipt = contract.deploymentTransaction()
    if (!receipt) {
        throw new Error('Deployment transaction not available')
    }

    const deployProxyCommand = await DeployContractDirectCommand.newInstance({
        name: 'ResolverProxy',
        factory: new ResolverProxy__factory(),
        signer,
        args: [businessLogicResolverAddress, configurationId, configurationVersion, rolesStruct],
        overrides: {
            gasLimit: GAS_LIMIT.resolverProxy.deploy,
        },
    })
    const { address: resolverProxyAddress } = await _deployContractDirect(deployProxyCommand)

    return new DeployContractResult({
        name,
        address: await contract.getAddress(),
        proxyAddress: resolverProxyAddress,
        contract: factory.attach(resolverProxyAddress) as C,
        receipt: await receipt,
    })
}
