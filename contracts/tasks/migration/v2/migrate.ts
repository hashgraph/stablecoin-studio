import { task, types } from 'hardhat/config'
import { NetworkName } from '@configuration'
import { MigrationProxy__factory, ProxyAdmin__factory } from '../../../typechain-types/index'
import { WithSignerCommand } from '@tasks'
import { ethers } from 'ethers'

/**
 * npx hardhat migrateStableCoinToV2 --stablecoinconfigurationidkey 0x0000000000000000000000000000000000000000000000000000000000000001 --stablecoinconfigurationidversion 0 --businesslogicresolverproxyaddress 0x000000000000000000000000000000000000002a --stablecoinaddress 0xfbe524f1b2fd32a8021cbf880bab06aa4edc7af7 --stablecoinproxyadminaddress 0xffb5d6f958109a8f22e7480d59f4653935d9b292
 */

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

        const migrationProxyDeployCommand = await DeployContractCommand.newInstance({
            factory: new MigrationProxy__factory(),
            signer,
            deployType: 'direct',
            deployedContract: undefined,
            overrides: { gasLimit: GAS_LIMIT.migrationProxy.deploy },
        })

        const migrationProxy = await deployContract(migrationProxyDeployCommand)
            .then((result) => {
                console.log('✓ Migration Proxy has been deployed successfully')
                console.log(`   --> Transaction Hash: ${result.receipt?.transactionHash}`)
                console.log(`   --> Contract Address: ${result.address}`)
                return result
            })
            .catch((e) => {
                throw e
            })

        // Upgrading Stablecoin proxy implementation
        const proxyAdmin = await ProxyAdmin__factory.connect(stablecoinproxyadminaddress, signer)

        const iface = new ethers.utils.Interface([
            'function initializeV2Migration(address _resolver, bytes32 _resolverProxyConfigurationId, uint256 _version, tuple(bytes32 role, address account)[] _roles)',
        ])

        const inputData = iface.encodeFunctionData('initializeV2Migration', [
            businesslogicresolverproxyaddress,
            stablecoinconfigurationidkey,
            stablecoinconfigurationidversion,
            [],
        ])

        const previous_impl = await proxyAdmin.getProxyImplementation(stablecoinaddress)

        const upgradeTx = await proxyAdmin.upgradeAndCall(stablecoinaddress, migrationProxy.address, inputData, {
            gasLimit: GAS_LIMIT.migrationProxy.upgrade,
        })

        const receipt = await upgradeTx.wait()

        const new_impl = await proxyAdmin.getProxyImplementation(stablecoinaddress)

        if (receipt.status !== 1) {
            console.error('❌ Upgrade transaction failed')
            throw new Error('UpgradeAndCall transaction reverted or failed')
        }

        console.log('✓ StableCoin Proxy implementation upgraded')
        console.log(`   --> Transaction Hash: ${receipt.transactionHash}`)

        // Display migration results
        console.log('\n 🟢 Stable Coin migrated successfully')
        console.log(`\n Previous implementation : ${previous_impl}`)
        console.log(`\n New implementation : ${new_impl}`)
    })
