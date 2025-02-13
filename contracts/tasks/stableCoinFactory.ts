import { task, types } from 'hardhat/config'
import {
    AddHederaTokenManagerVersionCommand,
    DeployStableCoinFactoryCommand,
    EditHederaTokenManagerAddressCommand,
    GetStableCoinFactoryAdminQuery,
    GetTokenManagerQuery,
    RemoveHederaTokenManagerAddressCommand,
} from '@tasks'

task('addHederaTokenManagerVersion', 'Add a new version TokenManager in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .addParam('tokenManagerAddress', 'The token manager address', undefined, types.string, false)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<AddHederaTokenManagerVersionCommand, keyof typeof hre>, hre) => {
        // Inlined to avoid circular dependency
        const { StableCoinFactory__factory } = await import('@typechain')
        const { GAS_LIMIT, MESSAGES, validateTxResponse, ValidateTxResponseCommand } = await import('@scripts')
        const { factoryProxyAddress, tokenManagerAddress, signer } =
            await AddHederaTokenManagerVersionCommand.newInstance({
                hre,
                ...args,
            })
        console.log(`Adding new version TokenManager in factory ${args.factoryProxyAddress}...`)

        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, signer)
        const txResponse = await sCFactory.addHederaTokenManagerVersion(tokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.addHederaTokenManagerVersion,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse,
                confirmationEvent: 'HederaTokenManagerAddressAdded',
                errorMessage: MESSAGES.stableCoinFactory.error.addHederaTokenManagerVersion,
            })
        )

        console.log('TokenManager successfully added to proxy.')
    })

task('editHederaTokenManagerAddress', 'Edit TokenManager address in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .addParam('tokenManagerAddress', 'The token manager address', undefined, types.string, false)
    .addParam('index', 'The index of the TokenManager to edit', undefined, types.int, false)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<EditHederaTokenManagerAddressCommand, keyof typeof hre>, hre) => {
        // Inlined to avoid circular dependency
        const { StableCoinFactory__factory } = await import('@typechain')
        const { GAS_LIMIT, MESSAGES, validateTxResponse, ValidateTxResponseCommand } = await import('@scripts')
        const { factoryProxyAddress, tokenManagerAddress, index, signer } =
            await EditHederaTokenManagerAddressCommand.newInstance({
                hre,
                ...args,
            })

        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, signer)
        const txResponse = await sCFactory.editHederaTokenManagerAddress(index, tokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.editHederaTokenManagerAddress,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse,
                confirmationEvent: 'HederaTokenManagerAddressEdited',
                errorMessage: MESSAGES.stableCoinFactory.error.editHederaTokenManagerAddress,
            })
        )
        console.log(MESSAGES.stableCoinFactory.success.editHederaTokenManagerAddress)
    })

task('removeHederaTokenManagerAddress', 'Remove TokenManager address in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .addParam('index', 'The index of the TokenManager to remove', undefined, types.int, false)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<RemoveHederaTokenManagerAddressCommand, keyof typeof hre>, hre) => {
        // Inlined to avoid circular dependency
        const { StableCoinFactory__factory } = await import('@typechain')
        const { GAS_LIMIT, MESSAGES, validateTxResponse, ValidateTxResponseCommand } = await import('@scripts')
        const { factoryProxyAddress, index, signer } = await RemoveHederaTokenManagerAddressCommand.newInstance({
            hre,
            ...args,
        })

        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, signer)
        const txResponse = await sCFactory.removeHederaTokenManagerAddress(index, {
            gasLimit: GAS_LIMIT.stableCoinFactory.removeHederaTokenManagerAddress,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse,
                confirmationEvent: 'HederaTokenManagerAddressRemoved',
                errorMessage: MESSAGES.stableCoinFactory.error.removeHederaTokenManagerAddress,
            })
        )
        console.log(MESSAGES.stableCoinFactory.success.removeHederaTokenManagerAddress)
    })

task('deploy-stablecoin-factory', 'Deploy a new StableCoinFactory')
    .addOptionalParam('tokenManagerAddress', 'The address of the HederaTokenManager contract', undefined, types.string)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<DeployStableCoinFactoryCommand, keyof typeof hre>, hre) => {
        console.log(`Executing deploy-stablecoin-factory in ${hre.network.name} network...`)
        // Inlined to avoid circular dependency
        const { HederaTokenManager__factory, StableCoinFactory__factory } = await import('@typechain')
        const {
            GAS_LIMIT,
            MESSAGES,
            deployContractWithFactory,
            DeployContractWithFactoryCommand,
            validateTxResponse,
            ValidateTxResponseCommand,
        } = await import('@scripts')
        const deployStableCoinFactoryTaskCommand = await DeployStableCoinFactoryCommand.newInstance({
            hre,
            ...args,
        })
        let tokenManagerAddress = deployStableCoinFactoryTaskCommand.tokenManagerAddress
        const signer = deployStableCoinFactoryTaskCommand.signer

        console.log(MESSAGES.hederaTokenManager.info.deploy)
        if (!tokenManagerAddress) {
            const deployTokenManagerCommand = new DeployContractWithFactoryCommand({
                factory: new HederaTokenManager__factory(),
                signer,
                withProxy: false,
                overrides: {
                    gasLimit: GAS_LIMIT.hederaTokenManager.deploy,
                },
            })
            const { address } = await deployContractWithFactory(deployTokenManagerCommand)
            tokenManagerAddress = address
        }
        console.log(MESSAGES.hederaTokenManager.success.deploy)

        console.log(MESSAGES.stableCoinFactory.info.deploy)
        const deployStableCoinFactoryCommand = new DeployContractWithFactoryCommand({
            factory: new StableCoinFactory__factory(),
            signer,
            withProxy: true,
            overrides: {
                gasLimit: GAS_LIMIT.stableCoinFactory.deploy,
            },
        })
        const {
            contract: stableCoinFactory,
            proxyAddress: sCFactoryProxyAddress,
            proxyAdminAddress: sCFactoryProxyAdminAddress,
        } = await deployContractWithFactory(deployStableCoinFactoryCommand)
        console.log(MESSAGES.stableCoinFactory.success.deploy)

        if (!sCFactoryProxyAddress || !sCFactoryProxyAdminAddress) {
            throw new Error(MESSAGES.stableCoinFactory.error.deploy)
        }
        console.log(MESSAGES.stableCoinFactory.info.initialize)
        const initResponse = await stableCoinFactory.initialize(await signer.getAddress(), tokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.initialize,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse: initResponse,
                errorMessage: MESSAGES.stableCoinFactory.error.initialize,
            })
        )
        console.log(MESSAGES.stableCoinFactory.success.initialize)
        console.log(`\n✅ Successfully deployed StableCoinFactory:`)
        console.log(`HederaTokenManager: ${tokenManagerAddress}`)
        console.log(`StableCoinFactory Implementation: ${stableCoinFactory.address}`)
        console.log(`StableCoinFactory Proxy: ${sCFactoryProxyAddress}`)
        console.log(`StableCoinFactory Proxy Admin: ${sCFactoryProxyAdminAddress}`)
    })

task('get-hedera-token-manager', 'Get TokenManager list in factory')
    .addPositionalParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .setAction(async ({ factoryProxyAddress }: GetTokenManagerQuery, hre) => {
        console.log(`Getting TokenManager list in factory ${factoryProxyAddress}...`)
        // Inlined to avoid circular dependency
        const { StableCoinFactory__factory } = await import('@typechain')
        const { GAS_LIMIT } = await import('@scripts')
        const stableCoinFactory = StableCoinFactory__factory.connect(factoryProxyAddress, hre.ethers.provider)
        const tokenManagerAddressList: string[] = await stableCoinFactory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })
        console.log(
            `TokenManager list in factory ${factoryProxyAddress}:\n${tokenManagerAddressList
                .map((address, index) => `${index + 1}. ${address}`)
                .join('\n')}`
        )
    })

task(
    'get-stablecoin-factory-admin',
    'Get the Factory admin account, the one with the right to add and remove tokenManagers'
)
    .addPositionalParam('factoryProxyAddress', 'The proxy admin address')
    .setAction(async ({ factoryProxyAddress }: GetStableCoinFactoryAdminQuery, hre) => {
        console.log(`Getting StableCoinFactory admin account for ${factoryProxyAddress}...`)
        // Inlined to avoid circular dependency
        const { StableCoinFactory__factory } = await import('@typechain')
        const { GAS_LIMIT } = await import('@scripts')
        const stableCoinFactory = StableCoinFactory__factory.connect(factoryProxyAddress, hre.ethers.provider)
        const factoryAdmin = await stableCoinFactory.getAdmin({
            gasLimit: GAS_LIMIT.stableCoinFactory.getAdmin,
        })
        console.log(`StableCoinFactory admin account: ${factoryAdmin}`)
    })
