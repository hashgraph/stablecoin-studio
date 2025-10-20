import { task, types } from 'hardhat/config'
import { NetworkName } from '@configuration'
import { TransactionStatus, WithSignerCommand } from '@tasks'

/**
 * npx hardhat migrateBLRToV3 --blrproxyadminaddress 0xF641FdEFC9847Acd55cb34e7edB29DeC1a98Bf80 --blrproxyaddress 0x3cff38d8ef14279cea40bb517e2b1dba56c0d035
 */

task('migrateBLRToV3', 'Migrate a v2 business logic resolver to v3')
    .addParam('blrproxyadminaddress', 'The address of the business logic resolver proxy admin', undefined, types.string)
    .addParam('blrproxyaddress', 'The address of the business logic resolver proxy', undefined, types.string)
    .setAction(async (args, hre) => {
        const { ProxyAdmin__factory } = await import('@contracts/index')
        const {
            GAS_LIMIT,
            TransactionReceiptError,
            deployScsContractList,
            DeployScsContractListCommand,
            RegisterDeployedContractBusinessLogicsCommand,
            registerDeployedContractBusinessLogics,
            CreateConfigurationsForDeployedContractsCommand,
            createConfigurationsForDeployedContracts,
        } = await import('@scripts')

        const { blrproxyadminaddress, blrproxyaddress } = args

        const network = hre.network.name as NetworkName

        const signer = (await WithSignerCommand.newInstance({ hre })).signer
        const signerAddress = await signer.getAddress()

        console.log(`Deploy new SCs implementation on ${network} ...`)

        const deployCommand = await DeployScsContractListCommand.newInstance({
            signer,
            useDeployed: false,
        })

        const { deployer, ...deployedContractList } = await deployScsContractList(deployCommand)

        const businessLogicResolverAddress = deployedContractList.businessLogicResolver!.address

        const BLRProxyAdmin = await ProxyAdmin__factory.connect(blrproxyadminaddress, signer)

        const currentAdmin = await BLRProxyAdmin.owner()

        if (currentAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
            throw new Error(
                `Proxy Admin mismatch: Current Admin is ${currentAdmin}, signer is ${signerAddress}. Please use the correct signer to perform the upgrade.`
            )
        }

        const previous_impl = await BLRProxyAdmin.getProxyImplementation(blrproxyaddress)

        console.log(`Upgrade BLR proxy implementation on ${network} ...`)

        const upgradeTx = await BLRProxyAdmin.upgrade(blrproxyaddress, businessLogicResolverAddress, {
            gasLimit: GAS_LIMIT.tup.upgrade,
        })

        const receipt = await upgradeTx.wait()

        const new_impl = await BLRProxyAdmin.getProxyImplementation(blrproxyaddress)

        if (!receipt) {
            throw new TransactionReceiptError({
                errorMessage: `BLR upgrade Transaction ${upgradeTx.hash} was not mined`,
                txHash: upgradeTx.hash,
            })
        }
        if (receipt.status !== TransactionStatus.SUCCESS) {
            console.error('❌ BLR Upgrade transaction failed')
            throw new Error('BLR Upgrade transaction reverted or failed')
        }

        console.log('✓ BLR implementation upgraded')
        console.log(`   --> Transaction Hash: ${receipt.hash}`)

        console.log(`Register facets in BLR ${network} ...`)

        deployedContractList.businessLogicResolver.proxyAddress = blrproxyaddress
        deployedContractList.businessLogicResolver.proxyAdminAddress = blrproxyadminaddress

        const registerCommand = new RegisterDeployedContractBusinessLogicsCommand({
            deployedContractList,
            signer,
        })

        console.log('Registering deployed contract business logics to BLR...')

        await registerDeployedContractBusinessLogics(registerCommand)

        console.log(`Deploy configurations in BLR ${network} ...`)

        const createCommand = new CreateConfigurationsForDeployedContractsCommand({
            deployedContractList,
            signer,
        })

        console.log('Creating configurations for deployed contract business logics in BLR...')

        await createConfigurationsForDeployedContracts(false, createCommand)

        console.log(`\n BLR Previous implementation : ${previous_impl}`)
        console.log(`\n BLR New implementation : ${new_impl}`)
    })

/**
 * npx hardhat upgradeSCversion --scaddress 0xef4522693eefa17114220b82e4716238afbf509c
 */

task('upgradeSCversion', 'Upgrade a SC version')
    .addParam('scaddress', 'The address of the stablecoin', undefined, types.string)
    .setAction(async (args, hre) => {
        const { IDiamondCut__factory, IDiamondCutManager__factory } = await import('@contracts/index')
        const { GAS_LIMIT } = await import('@scripts')

        const { scaddress } = args

        const network = hre.network.name as NetworkName

        const signer = (await WithSignerCommand.newInstance({ hre })).signer

        console.log(`Retrieving stablecoin configuration on ${network} ...`)

        const scProxy = IDiamondCut__factory.connect(scaddress, signer)

        const [resolverAddress, configId, previousVersion] = await scProxy.getConfigInfo()

        console.log(`Current stablecoin resolver: ${resolverAddress}`)
        console.log(`Current stablecoin configuration id: ${configId}`)
        console.log(`Current stablecoin version: ${previousVersion}`)

        console.log(`Retrieving latest version for configuration ${configId} on ${network} ...`)

        const latestVersion = await IDiamondCutManager__factory.connect(
            resolverAddress,
            hre.ethers.provider
        ).getLatestVersionByConfiguration(configId)

        console.log(`Upgrading stablecoin configuration to ${latestVersion} on ${network} ...`)

        await scProxy.updateConfigVersion(latestVersion, {
            gasLimit: GAS_LIMIT.resolverProxy.upgrade,
        })

        const [newResolverAddress, newConfigId, newVersion] = await scProxy.getConfigInfo()

        console.log(`New stablecoin resolver: ${newResolverAddress}`)
        console.log(`New stablecoin configuration id: ${newConfigId}`)
        console.log(`New stablecoin version: ${newVersion}`)
    })
