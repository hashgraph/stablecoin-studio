import { task, types } from 'hardhat/config'
import { CONTRACT_NAMES, ContractName, NetworkName } from '@configuration'
import {
    ITransparentUpgradeableProxy__factory,
    MigrationImplementationProxy__factory,
    ProxyAdmin__factory,
} from '../../../typechain-types/index'
import { WithSignerCommand } from '@tasks'

task('migrateStableCoinToV2', 'Migrate a v1 stable coin to v2')
    .addParam('stablecoinconfigurationidkey', 'The stable coin configuration ID key', undefined, types.string)
    .addParam('stablecoinconfigurationidversion', 'The stable coin configuration ID version', undefined, types.int)
    .addParam(
        'businesslogicresolverproxyaddress',
        'The address of the business logic resolver proxy',
        undefined,
        types.string
    )
    .addParam('stablecoinaddress', 'The address of current stablecoin proxy', undefined, types.string)
    .addParam('stablecoinproxyadminaddress', 'The address of current stablecoin proxy admin', undefined, types.string)
    .setAction(async (args, hre) => {
        // Inlined to avoid circular dependency
        const { deployContract, DeployContractCommand, GAS_LIMIT } = await import('@scripts')

        const {
            stablecoinconfigurationidkey,
            stablecoinconfigurationidversion,
            businesslogicresolverproxyaddress,
            stablecoinaddress,
            stablecoinproxyadminaddress,
        } = args

        const network = hre.network.name as NetworkName

        console.log(`Migrating StableCoin on ${network} ...`)

        const signer = (await WithSignerCommand.newInstance({ hre })).signer

        // Deploying the migration implementation proxy

        const migrationImplementationProxyDeployCommand = await DeployContractCommand.newInstance({
            factory: new MigrationImplementationProxy__factory(),
            signer,
            deployType: 'direct',
            deployedContract: undefined,
            overrides: { gasLimit: GAS_LIMIT.migrationImplementationProxy.deploy },
        })

        const migrationImplementationProxy = await deployContract(migrationImplementationProxyDeployCommand).then(
            (result) => {
                console.log('✓ Migration Implementation Proxy has been deployed successfully')
                console.log(`   --> Transaction Hash: ${result.receipt?.transactionHash}`)
                console.log(`   --> Contract Address: ${result.address}`)
                return result
            }
        )

        // Upgrading Stablecoin proxy implementation
        const proxyAdmin = await ProxyAdmin__factory.connect(stablecoinproxyadminaddress, signer)

        proxyAdmin.upgradeAndCall(stablecoinaddress, migrationImplementationProxy.address, '').then((result) => {
            console.log('✓ StableCoin Proxy implementation upgraded')
            console.log(`   --> Transaction Hash: ${result.hash}`)
            return result
        })

        // Display migration results
        console.log('\n 🟢 Stable Coin migrated successfully: ')
    })
