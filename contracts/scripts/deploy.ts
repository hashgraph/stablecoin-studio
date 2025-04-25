import { ethers } from 'hardhat'
import { Contract, ContractFactory, ContractReceipt, Overrides } from 'ethers'
import { configuration } from 'hardhat.config'
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
    RescuableFacet__factory,
    ReserveFacet__factory,
    RoleManagementFacet__factory,
    RolesFacet__factory,
    SupplierAdminFacet__factory,
    TokenOwnerFacet__factory,
    WipeableFacet__factory,
} from '@typechain'
import {
    MESSAGES,
    GAS_LIMIT,
    DeployContractCommand,
    DeployContractResult,
    DeployContractWithFactoryCommand,
    DeployContractWithFactoryResult,
    DeployFullInfrastructureCommand,
    ValidateTxResponseCommand,
    validateTxResponse,
    VALUE,
    TransactionReceiptError,
    DeployFullInfrastructureResult,
    DeployScsContractListCommand,
    DeployScsContractListResult,
} from '@scripts'

export async function deployFullInfrastructure({
    wallet,
    network,
    tokenStruct,
    useDeployed,
    grantKYCToOriginalSender,
}: DeployFullInfrastructureCommand): Promise<DeployFullInfrastructureResult> {
    console.log(MESSAGES.deploy.info.deployFullInfrastructure)
    // * Deploy HederaTokenManager or get deployed HederaTokenManager
    const { contract: hederaTokenManager } = await deployContractWithFactory(
        new DeployContractWithFactoryCommand({
            factory: new HederaTokenManager__factory(),
            signer: wallet,
            withProxy: false,
            deployedContract: useDeployed ? configuration.contracts.HederaTokenManager.addresses?.[network] : undefined,
            // deployedContract: undefined,
            overrides: {
                gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
            },
        })
    )
    console.log(MESSAGES.hederaTokenManager.success.deploy)

    // * Deploy Factory or get deployed Factory
    const deployStableCoinFactoryCommand = new DeployContractWithFactoryCommand({
        factory: new StableCoinFactory__factory(),
        signer: wallet,
        withProxy: true,
        deployedContract: useDeployed ? configuration.contracts.StableCoinFactory.addresses?.[network] : undefined,
        overrides: {
            gasLimit: GAS_LIMIT.stableCoinFactory.deploy,
        },
    })
    const {
        contract: stableCoinFactory,
        proxyAddress: sCFactoryProxyAddress,
        proxyAdminAddress: sCFactoryProxyAdminAddress,
    } = await deployContractWithFactory(deployStableCoinFactoryCommand)

    if (!sCFactoryProxyAddress || !sCFactoryProxyAdminAddress) {
        throw new Error(MESSAGES.stableCoinFactory.error.deploy)
    }
    console.log(MESSAGES.stableCoinFactory.success.deploy)
    if (!useDeployed || !configuration.contracts.StableCoinFactory.addresses?.[network]) {
        const initResponse = await stableCoinFactory.initialize(wallet.address, hederaTokenManager.address, {
            gasLimit: GAS_LIMIT.stableCoinFactory.initialize,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: initResponse,
                errorMessage: MESSAGES.stableCoinFactory.error.initialize,
            })
        )
        console.log(MESSAGES.stableCoinFactory.success.initialize)
    }

    // * Deploy new StableCoin using the Factory
    console.log(MESSAGES.stableCoinFactory.info.deployStableCoin)
    const deployScResponse = await stableCoinFactory.deployStableCoin(tokenStruct, hederaTokenManager.address, {
        gasLimit: GAS_LIMIT.stableCoinFactory.deployStableCoin,
        value: VALUE.stableCoinFactory.deployStableCoin,
    })
    const { confirmationEvent } = await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: deployScResponse,
            errorMessage: MESSAGES.stableCoinFactory.error.deployStableCoin,
            confirmationEvent: 'Deployed',
        })
    )
    if (!confirmationEvent || !confirmationEvent.args) {
        // Should never happen because is checked in validateTxResponse
        throw new TransactionReceiptError({
            txHash: deployScResponse.hash,
            errorMessage: MESSAGES.stableCoinFactory.error.deployStableCoin,
        })
    }
    const deployedScEventData = confirmationEvent.args
        .deployedStableCoin as IStableCoinFactory.DeployedStableCoinStructOutput
    console.log(MESSAGES.deploy.success.deployFullInfrastructure)

    // * Associate token
    console.log(MESSAGES.hederaTokenManager.info.associate)
    const associateResponse = await IHRC__factory.connect(deployedScEventData.tokenAddress, wallet).associate({
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
        const grantKYCResponse = await hederaTokenManager
            .attach(deployedScEventData.stableCoinProxy)
            .grantKyc(wallet.address, { gasLimit: GAS_LIMIT.hederaTokenManager.grantKyc })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: grantKYCResponse,
                errorMessage: MESSAGES.hederaTokenManager.error.grantKyc,
            })
        )
    }
    console.log(MESSAGES.hederaTokenManager.success.grantKyc)

    return new DeployFullInfrastructureResult({
        hederaTokenManagerAddress: hederaTokenManager.address,
        stableCoinFactoryDeployment: {
            address: stableCoinFactory.address,
            proxyAddress: sCFactoryProxyAddress,
            proxyAdminAddress: sCFactoryProxyAdminAddress,
        },
        stableCoinDeployment: {
            tokenAddress: deployedScEventData.tokenAddress,
            address: deployedScEventData.stableCoinContractAddress,
            proxyAddress: deployedScEventData.stableCoinProxy,
            proxyAdminAddress: deployedScEventData.stableCoinProxyAdmin,
            reserveProxyAddress: deployedScEventData.reserveProxy,
            reserveProxyAdminAddress: deployedScEventData.reserveProxyAdmin,
        },
        stableCoinCreator: wallet.address,
        KycGranted: grantKYCToOriginalSender,
    })
}

export async function deployScsContractList({
    signer,
    network,
    useDeployed,
}: DeployScsContractListCommand): Promise<DeployScsContractListResult> {
    const overrides: Overrides = { gasLimit: GAS_LIMIT.high } // If you want to override the default parameters
    const commands = {
        businessLogicResolver: new DeployContractWithFactoryCommand({
            factory: new BusinessLogicResolver__factory(),
            signer,
            withProxy: true,
            deployedContract: useDeployed
                ? configuration.contracts.BusinessLogicResolver.addresses?.[network]
                : undefined,
            overrides,
        }),
        diamondFacet: new DeployContractWithFactoryCommand({
            factory: new DiamondFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.DiamondFacet.addresses?.[network] : undefined,
            overrides,
        }),
        hederaTokenManagerFacet: new DeployContractWithFactoryCommand({
            factory: new HederaTokenManagerFacet__factory(),
            signer,
            withProxy: true,
            deployedContract: useDeployed
                ? configuration.contracts.HederaTokenManagerFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        hederaReserveFacet: new DeployContractWithFactoryCommand({
            factory: new HederaReserveFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.HederaReserveFacet.addresses?.[network] : undefined,
            overrides,
        }),
        burnableFacet: new DeployContractWithFactoryCommand({
            factory: new BurnableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.BurnableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        cashInFacet: new DeployContractWithFactoryCommand({
            factory: new CashInFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.CashInFacet.addresses?.[network] : undefined,
            overrides,
        }),
        customFeesFacet: new DeployContractWithFactoryCommand({
            factory: new CustomFeesFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.CustomFeesFacet.addresses?.[network] : undefined,
            overrides,
        }),
        deletableFacet: new DeployContractWithFactoryCommand({
            factory: new DeletableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.DeletableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        freezableFacet: new DeployContractWithFactoryCommand({
            factory: new FreezableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.FreezableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        holdManagementFacet: new DeployContractWithFactoryCommand({
            factory: new HoldManagementFacet__factory(),
            signer,
            deployedContract: useDeployed
                ? configuration.contracts.HoldManagementFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        kycFacet: new DeployContractWithFactoryCommand({
            factory: new KYCFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.KYCFacet.addresses?.[network] : undefined,
            overrides,
        }),
        pausableFacet: new DeployContractWithFactoryCommand({
            factory: new PausableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.PausableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        rescuableFacet: new DeployContractWithFactoryCommand({
            factory: new RescuableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.RescuableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        reserveFacet: new DeployContractWithFactoryCommand({
            factory: new ReserveFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.ReserveFacet.addresses?.[network] : undefined,
            overrides,
        }),
        roleManagementFacet: new DeployContractWithFactoryCommand({
            factory: new RoleManagementFacet__factory(),
            signer,
            deployedContract: useDeployed
                ? configuration.contracts.RoleManagementFacet.addresses?.[network]
                : undefined,
            overrides,
        }),
        rolesFacet: new DeployContractWithFactoryCommand({
            factory: new RolesFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.RolesFacet.addresses?.[network] : undefined,
            overrides,
        }),
        supplierAdminFacet: new DeployContractWithFactoryCommand({
            factory: new SupplierAdminFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.SupplierAdminFacet.addresses?.[network] : undefined,
            overrides,
        }),
        tokenOwnerFacet: new DeployContractWithFactoryCommand({
            factory: new TokenOwnerFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.TokenOwnerFacet.addresses?.[network] : undefined,
            overrides,
        }),
        wipeableFacet: new DeployContractWithFactoryCommand({
            factory: new WipeableFacet__factory(),
            signer,
            deployedContract: useDeployed ? configuration.contracts.WipeableFacet.addresses?.[network] : undefined,
            overrides,
        }),
        // * Add other SCS contracts here following the pattern
        // Example:
        // cashToken: new DeployContractWithFactoryCommand({
        //     factory: new CashToken__factory(),
        //     signer,
        //     deployedContract: useDeployed ? configuration.contracts.CashToken.addresses?.[network] : undefined,
        //     overrides,
        // }),
    }

    // Deploy contracts sequentially
    const deployedContracts: DeployScsContractListResult = new DeployScsContractListResult({
        businessLogicResolver: await deployContractWithFactory(commands.businessLogicResolver).then((result) => {
            console.log('BusinessLogicResolver has been deployed successfully')
            return result
        }),
        diamondFacet: await deployContractWithFactory(commands.diamondFacet).then((result) => {
            console.log('DiamondFacet has been deployed successfully')
            return result
        }),
        hederaTokenManagerFacet: await deployContractWithFactory(commands.hederaTokenManagerFacet).then((result) => {
            console.log('HederaTokenManager has been deployed successfully')
            return result
        }),
        hederaReserveFacet: await deployContractWithFactory(commands.hederaReserveFacet).then((result) => {
            console.log('HederaReserveFacet has been deployed successfully')
            return result
        }),
        burnableFacet: await deployContractWithFactory(commands.burnableFacet).then((result) => {
            console.log('BurnableFacet has been deployed successfully')
            return result
        }),
        cashInFacet: await deployContractWithFactory(commands.cashInFacet).then((result) => {
            console.log('CashInFacet has been deployed successfully')
            return result
        }),
        customFeesFacet: await deployContractWithFactory(commands.customFeesFacet).then((result) => {
            console.log('CustomFeesFacet has been deployed successfully')
            return result
        }),
        deletableFacet: await deployContractWithFactory(commands.deletableFacet).then((result) => {
            console.log('DeletableFacet has been deployed successfully')
            return result
        }),
        freezableFacet: await deployContractWithFactory(commands.freezableFacet).then((result) => {
            console.log('FreezableFacet has been deployed successfully')
            return result
        }),
        holdManagementFacet: await deployContractWithFactory(commands.holdManagementFacet).then((result) => {
            console.log('HoldManagementFacet has been deployed successfully')
            return result
        }),
        kycFacet: await deployContractWithFactory(commands.kycFacet).then((result) => {
            console.log('KYCFacet has been deployed successfully')
            return result
        }),
        pausableFacet: await deployContractWithFactory(commands.pausableFacet).then((result) => {
            console.log('PausableFacet has been deployed successfully')
            return result
        }),
        rescuableFacet: await deployContractWithFactory(commands.rescuableFacet).then((result) => {
            console.log('RescuableFacet has been deployed successfully')
            return result
        }),
        reserveFacet: await deployContractWithFactory(commands.reserveFacet).then((result) => {
            console.log('ReserveFacet has been deployed successfully')
            return result
        }),
        roleManagementFacet: await deployContractWithFactory(commands.roleManagementFacet).then((result) => {
            console.log('RoleManagementFacet has been deployed successfully')
            return result
        }),
        rolesFacet: await deployContractWithFactory(commands.rolesFacet).then((result) => {
            console.log('RolesFacet has been deployed successfully')
            return result
        }),
        supplierAdminFacet: await deployContractWithFactory(commands.supplierAdminFacet).then((result) => {
            console.log('SupplierAdminFacet has been deployed successfully')
            return result
        }),
        tokenOwnerFacet: await deployContractWithFactory(commands.tokenOwnerFacet).then((result) => {
            console.log('TokenOwnerFacet has been deployed successfully')
            return result
        }),
        wipeableFacet: await deployContractWithFactory(commands.wipeableFacet).then((result) => {
            console.log('WipeableFacet has been deployed successfully')
            return result
        }),
        // * Add results for other deployed SCS contracts here
        // Example:
        // cashToken: await deployContractWithFactory(commands.cashToken).then((result) => {
        //     console.log('CashToken has been deployed successfully')
        //     return result
        // }),
        deployer: signer,
    })

    // Note: The original code had many contracts listed (Cap, ControlList, Kyc, etc.)
    // which seem related to ATS/Security Tokens rather than the core StableCoin Studio (SCS) contracts.
    // I've kept BusinessLogicResolver and BurnableFacet as examples.
    // You should add the specific SCS contracts required for your setup.
    // The original code also had a DeployAtsContractsResult type which was renamed to DeployScsContractListResult.
    // Ensure the DeployScsContractListResult type definition matches the structure returned here.

    return deployedContracts
}

export async function deployContractWithFactory<
    F extends ContractFactory,
    C extends Contract = ReturnType<F['attach']>,
>({
    factory,
    signer,
    args,
    overrides,
    withProxy,
    deployedContract,
}: DeployContractWithFactoryCommand<F>): Promise<DeployContractWithFactoryResult<C>> {
    let implementationContract: C
    let proxyAddress: string | undefined
    let proxyAdminAddress: string | undefined
    let implementationReceipt: ContractReceipt | undefined

    if (deployedContract?.address) {
        implementationContract = factory.attach(deployedContract.address) as C
    } else {
        implementationContract = (await factory.connect(signer).deploy(...args, overrides)) as C
        ;({ txReceipt: implementationReceipt } = await new ValidateTxResponseCommand({
            txResponse: implementationContract.deployTransaction,
            errorMessage: MESSAGES.deploy.error.deploy,
        }).execute())
        implementationReceipt = await implementationContract.deployTransaction.wait()
    }

    if (!withProxy) {
        return new DeployContractWithFactoryResult({
            address: implementationContract.address,
            contract: implementationContract,
            receipt: implementationReceipt,
        })
    }

    if (deployedContract?.proxyAdminAddress) {
        proxyAdminAddress = deployedContract.proxyAdminAddress
    } else {
        const proxyAdmin = await new ProxyAdmin__factory(signer).deploy(overrides)
        await new ValidateTxResponseCommand({
            txResponse: proxyAdmin.deployTransaction,
            errorMessage: MESSAGES.deploy.error.deploy,
        }).execute()
        proxyAdminAddress = proxyAdmin.address
    }

    if (deployedContract?.proxyAddress) {
        proxyAddress = deployedContract.proxyAddress
    } else {
        const proxy = await new TransparentUpgradeableProxy__factory(signer).deploy(
            implementationContract.address,
            proxyAdminAddress,
            '0x',
            overrides
        )
        await new ValidateTxResponseCommand({
            txResponse: proxy.deployTransaction,
            errorMessage: MESSAGES.deploy.error.deploy,
        }).execute()
        proxyAddress = proxy.address
    }

    return new DeployContractWithFactoryResult({
        address: implementationContract.address,
        contract: factory.connect(signer).attach(proxyAddress) as C,
        proxyAddress: proxyAddress,
        proxyAdminAddress: proxyAdminAddress,
        receipt: implementationReceipt,
    })
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
export async function deployContract({ name, signer, args }: DeployContractCommand): Promise<DeployContractResult> {
    console.log(`Deploying ${name}. please wait...`)

    const contractFactory = await ethers.getContractFactory(name, signer)
    const contract = await contractFactory.deploy(...args)
    const receipt = contract.deployTransaction.wait()

    console.log(`${name} deployed at ${contract.address}`)

    // if no proxy, return the contract (BREAK)
    if (configuration.contracts[name].deployType !== 'proxy') {
        return new DeployContractResult({
            name,
            contract,
            address: contract.address,
            receipt: await receipt,
        })
    }

    console.log(`Deploying ${name} Proxy Admin. please wait...`)

    const { address: proxyAdminAddress } = await deployContract(
        new DeployContractCommand({
            name: 'ProxyAdmin',
            signer,
            args: [],
        })
    )

    console.log(`${name} Proxy Admin deployed at ${proxyAdminAddress}`)

    console.log(`Deploying ${name} Proxy. please wait...`)

    const { address: proxyAddress } = await deployContract(
        new DeployContractCommand({
            name: 'TransparentUpgradeableProxy',
            signer,
            args: [contract.address, proxyAdminAddress, '0x'],
        })
    )

    console.log(`${name} Proxy deployed at ${proxyAddress}`)

    return new DeployContractResult({
        name,
        address: contract.address,
        contract,
        proxyAddress,
        proxyAdminAddress,
        receipt: await receipt,
    })
}
