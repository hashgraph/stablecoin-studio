import { ethers } from 'hardhat'
import { Contract, ContractFactory, ContractTransaction } from 'ethers'
import { configuration } from 'hardhat.config'
import {
    HederaTokenManager__factory,
    IHRC__factory,
    IStableCoinFactory,
    ProxyAdmin__factory,
    StableCoinFactory__factory,
    TransparentUpgradeableProxy__factory,
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
    validateTxResponseList,
    validateTxResponse,
    VALUE,
    TransactionReceiptError,
    DeployFullInfrastructureResult,
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
            deployedContract: useDeployed ? configuration.contracts.HedetaTokenManager.addresses?.[network] : undefined,
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
        },
        stableCoinCreator: wallet.address,
        KycGranted: grantKYCToOriginalSender,
    })
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
    const txResponseList: ContractTransaction[] = []

    if (deployedContract?.address) {
        implementationContract = factory.attach(deployedContract.address) as C
    } else {
        implementationContract = (await factory.connect(signer).deploy(...args, overrides)) as C
        txResponseList.push(implementationContract.deployTransaction)
    }

    if (!withProxy) {
        await validateTxResponseList(
            txResponseList.map(
                (txResponse) =>
                    new ValidateTxResponseCommand({
                        txResponse,
                        errorMessage: MESSAGES.deploy.error.deploy,
                    })
            )
        )
        return new DeployContractWithFactoryResult({
            address: implementationContract.address,
            contract: implementationContract,
            receipt: await txResponseList[0].wait(),
        })
    }

    if (deployedContract?.proxyAdminAddress) {
        proxyAdminAddress = deployedContract.proxyAdminAddress
    } else {
        const proxyAdmin = await new ProxyAdmin__factory(signer).deploy(overrides)
        txResponseList.push(proxyAdmin.deployTransaction)
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
        txResponseList.push(proxy.deployTransaction)
        proxyAddress = proxy.address
    }

    await validateTxResponseList(
        txResponseList.map(
            (txResponse) =>
                new ValidateTxResponseCommand({
                    txResponse,
                    errorMessage: MESSAGES.deploy.error.deploy,
                })
        )
    )

    return new DeployContractWithFactoryResult({
        address: implementationContract.address,
        contract: factory.connect(signer).attach(proxyAddress) as C,
        proxyAddress: proxyAddress,
        proxyAdminAddress: proxyAdminAddress,
        receipt: await txResponseList[0].wait(),
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
