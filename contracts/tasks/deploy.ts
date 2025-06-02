import { task, types } from 'hardhat/config'
import { CONTRACT_NAMES, ContractName, NetworkName } from '@configuration'
import { DeployAllCommand, DeployCommand, DeployStableCoinCommand, NotInContractNameListError } from '@tasks'
import { writeFileSync } from 'fs'

task('deployStableCoin', 'Deploy new stable coin')
    .addOptionalParam('tokenName', 'The name of the token to deploy', undefined, types.string)
    .addOptionalParam('tokenSymbol', 'The symbol of the token to deploy', undefined, types.string)
    .addOptionalParam('tokenDecimals', 'The decimals of the token to deploy', undefined, types.int)
    .addOptionalParam('tokenInitialSupply', 'The initial supply of the token to deploy', undefined, types.bigint)
    .addOptionalParam('tokenMaxSupply', 'The max supply of the token to deploy', undefined, types.bigint)
    .addOptionalParam('tokenMemo', 'The memo of the token to deploy', undefined, types.string)
    .addOptionalParam('tokenFreeze', 'The freeze status of the token to deploy', undefined, types.boolean)
    .addOptionalParam(
        'initialAmountDataFeed',
        'The initial amount data feed of the token to deploy',
        undefined,
        types.string
    )
    .addOptionalParam('initialMetadata', 'The initial metadata of the token to deploy', '', types.string)
    .addOptionalParam('createReserve', 'Create reserve', true, types.boolean)
    .addOptionalParam('reserveAddress', 'The reserve address', undefined, types.string)
    .addOptionalParam('allRolesToCreator', 'All roles to creator', true, types.boolean)
    .addOptionalParam('rolesToAccount', 'Roles to account', undefined, types.string)
    .addOptionalParam('addFeeSchedule', 'Add fee schedule', false, types.boolean)
    .addOptionalParam('addKyc', 'Add KYC', false, types.boolean)
    .addOptionalParam('stableCoinConfigurationIdKey', 'The stable coin configuration ID key', undefined, types.string)
    .addOptionalParam(
        'stableCoinConfigurationIdVersion',
        'The stable coin configuration ID version',
        undefined,
        types.int
    )
    .addOptionalParam('reserveConfigurationIdKey', 'The reserve configuration ID key', undefined, types.string)
    .addOptionalParam('reserveConfigurationIdVersion', 'The reserve configuration ID version', undefined, types.int)
    .addParam(
        'businessLogicResolverProxyAddress',
        'The address of the business logic resolver proxy',
        undefined,
        types.string
    )
    .addParam(
        'stableCoinFactoryProxyAddress',
        'The address of the stable coin factory ResolverProxy',
        undefined,
        types.string
    )
    .addOptionalParam('grantKYCToOriginalSender', 'Grant KYC to original sender', false, types.boolean)
    .addOptionalParam('useEnvironment', 'Use environment', false, types.boolean)
    // Signer related parameters ⬇️
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: DeployStableCoinCommand, hre) => {
        // Inlined to avoid circular dependency
        const {
            DEFAULT_TOKEN,
            deployStableCoin,
            DeployStableCoinCommand: DeployScCommandScripts,
            addressToHederaId,
        } = await import('@scripts')
        const network = hre.network.name as NetworkName
        const {
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenInitialSupply,
            tokenMaxSupply,
            tokenMemo,
            tokenFreeze,
            initialAmountDataFeed,
            createReserve,
            reserveAddress,
            allRolesToCreator,
            rolesToAccount,
            initialMetadata,
            addFeeSchedule,
            addKyc,
            stableCoinConfigurationIdKey,
            stableCoinConfigurationIdVersion,
            reserveConfigurationIdKey,
            reserveConfigurationIdVersion,
            businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress,
            grantKYCToOriginalSender,
            useEnvironment,
            signer,
        } = await DeployStableCoinCommand.newInstance({ ...args, hre })
        console.log(`Executing deployStableCoin on ${network} ...`)

        const deployScCommand = await DeployScCommandScripts.newInstance({
            signer,
            businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress,
            grantKYCToOriginalSender,
            tokenInformation: {
                name: tokenName ?? DEFAULT_TOKEN.name,
                symbol: tokenSymbol ?? DEFAULT_TOKEN.symbol,
                decimals: tokenDecimals ?? DEFAULT_TOKEN.decimals,
                initialSupply: tokenInitialSupply ?? DEFAULT_TOKEN.initialSupply,
                maxSupply: tokenMaxSupply ?? DEFAULT_TOKEN.maxSupply,
                memo: tokenMemo ?? DEFAULT_TOKEN.memo,
                freeze: tokenFreeze ?? DEFAULT_TOKEN.freeze,
            },
            allToContract: true,
            initialAmountDataFeed,
            reserveAddress,
            createReserve,
            addKyc,
            addFeeSchedule,
            allRolesToCreator,
            rolesToAccount,
            initialMetadata,
            useEnvironment,
            stableCoinConfigurationId: stableCoinConfigurationIdKey
                ? {
                      key: stableCoinConfigurationIdKey,
                      version: stableCoinConfigurationIdVersion ?? 0,
                  }
                : undefined,
            reserveConfigurationId: reserveConfigurationIdKey
                ? {
                      key: reserveConfigurationIdKey,
                      version: reserveConfigurationIdVersion ?? 0,
                  }
                : undefined,
        })

        // * Deploy the stable coin
        const result = await deployStableCoin(deployScCommand)

        // Prepare contract ID list with resolved Hedera IDs
        const contractIdList = {
            stableCoinProxyAddress: await addressToHederaId({
                address: result.stableCoinProxyAddress,
                network,
            }),
            tokenAddress: await addressToHederaId({
                address: result.tokenAddress,
                network,
            }),
            reserveProxyAddress: result.reserveProxyAddress
                ? await addressToHederaId({
                      address: result.reserveProxyAddress,
                      network,
                  })
                : undefined,
        }

        // Display deployment results
        console.log('\n 🟢 Stable Coin deployed successfully: ')
        console.log(
            `   --> Stable Coin Proxy Address: ${result.stableCoinProxyAddress} (${contractIdList.stableCoinProxyAddress})`
        )
        console.log(`   --> Stable Coin Token Address: ${result.tokenAddress} (${contractIdList.tokenAddress})`)
        if (result.reserveProxyAddress) {
            console.log(
                `   --> Stable Coin Reserve Proxy Address: ${result.reserveProxyAddress} (${contractIdList.reserveProxyAddress})`
            )
        }
        if (result.receipt?.transactionHash) {
            console.log(`   --> Transaction Hash: ${result.receipt.transactionHash}`)
        }
    })

task(
    'deployAll',
    'Deploy new factory, new facet implementation, new resolver and initialize it with the new facet implementations'
)
    .addOptionalParam('useDeployed', 'Use already deployed contracts', true, types.boolean)
    .addOptionalParam('partialBatchDeploy', 'Use partial batch deploy', false, types.boolean)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: DeployAllCommand, hre) => {
        // Inlined to avoid circular dependency
        const {
            deployFullInfrastructure,
            DeployFullInfrastructureCommand,
            addressToHederaId: addresstoHederaId,
        } = await import('@scripts')
        const network = hre.network.name as NetworkName
        const { useDeployed, partialBatchDeploy, signer } = await DeployAllCommand.newInstance({
            ...args,
            hre,
        })
        console.log(`Executing deployAll on ${network} ...`)

        // * Deploy the full infrastructure
        const result = await deployFullInfrastructure(
            new DeployFullInfrastructureCommand({
                signer: signer,
                network: network,
                useDeployed: useDeployed,
                useEnvironment: false,
                partialBatchDeploy: partialBatchDeploy,
            })
        )

        // * Display the deployed addresses
        const addressList = {
            'Business Logic Resolver': result.businessLogicResolver.address,
            '*** Business Logic Resolver Proxy': result.businessLogicResolver.proxyAddress, // * Important for Interactions
            'Business Logic Resolver Proxy Admin': result.businessLogicResolver.proxyAdminAddress,
            'Stable Coin Factory Facet': result.stableCoinFactoryFacet.address,
            '*** Stable Coin Factory Facet Proxy': result.stableCoinFactoryFacet.proxyAddress, // * Important for Interactions (deployed in deployStableCoin)
            'Hedera Token Manager Facet': result.hederaTokenManagerFacet.address,
            'Diamond Facet': result.diamondFacet.address,
            'Reserve Facet': result.reserveFacet.address,
            'Burnable Facet': result.burnableFacet.address,
            'Cash In Facet': result.cashInFacet.address,
            'Custom Fees Facet': result.customFeesFacet.address,
            'Deletable Facet': result.deletableFacet.address,
            'Freezable Facet': result.freezableFacet.address,
            'Hedera Reserve Facet': result.hederaReserveFacet.address,
            'KYC Facet': result.kycFacet.address,
            'Hold Management Facet': result.holdManagementFacet.address,
            'Pausable Facet': result.pausableFacet.address,
            'Rescuable Facet': result.rescuableFacet.address,
            'Role Management Facet': result.roleManagementFacet.address,
            'Roles Facet': result.rolesFacet.address,
            'Supplier Admin Facet': result.supplierAdminFacet.address,
            'Token Owner Facet': result.tokenOwnerFacet.address,
            'Wipeable Facet': result.wipeableFacet.address,
        }

        console.log('\n 🟢 StableCoin Studio Smart Contracts deployed successfully:')
        let contractAddresses = '🟢 StableCoin Studio Smart Contracts deployed successfully:\n'
        for (const [key, address] of Object.entries(addressList)) {
            if (!address) {
                continue
            }
            const contractId = await addresstoHederaId({
                address,
                network,
            })
            console.log(`   --> ${key}: ${address} (${contractId})`)
            contractAddresses = contractAddresses + `   --> ${key}: ${address} (${contractId})\n`
        }

        writeFileSync('contractAddresses_v2.txt', contractAddresses)
    })

// TODO: add all features. Now only deploys basic contracts without proxy, no args etc...
task('deploy', 'Deploy new contract')
    .addOptionalParam('contractName', 'The name of the contract to deploy', undefined, types.string)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: DeployCommand, hre) => {
        // Inlined to avoid circular dependency
        const { deployContract, DeployContractCommand, addressListToHederaIdList } = await import('@scripts')
        const network = hre.network.name as NetworkName
        console.log(`Executing deploy on ${network} ...`)
        if (!CONTRACT_NAMES.includes(args.contractName as ContractName)) {
            throw new NotInContractNameListError(args.contractName)
        }
        const { contractName, signer } = await DeployCommand.newInstance({ ...args, hre })
        // * Deploy the contract
        const deployCommand = await DeployContractCommand.newInstance({
            name: contractName,
            deployType: 'direct',
            signer,
        })
        console.log(deployCommand)
        const { proxyAdminAddress, proxyAddress, address } = await deployContract(deployCommand)

        const [contractId, proxyContractId, proxyAdminContractId] = await addressListToHederaIdList({
            addressList: [address, proxyAddress, proxyAdminAddress].filter((addr): addr is string => !!addr),
            network,
        })

        console.log('\n 🟢 Deployed Contract:')
        if (proxyAdminAddress) {
            console.log(`Proxy Admin: ${proxyAdminAddress} (${proxyAdminContractId})`)
        }
        if (proxyAddress) {
            console.log(`Proxy: ${proxyAddress} (${proxyContractId})`)
        }
        console.log(`Implementation: ${address} (${contractId}) for ${contractName}`)
    })
