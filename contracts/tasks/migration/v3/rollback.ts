import { task, types } from 'hardhat/config'
import { NetworkName } from '@configuration'
import { TransactionStatus, WithSignerCommand } from '@tasks'

/**
 * npx hardhat rollbackBLRToV2 --blrproxyadminaddress 0xF641FdEFC9847Acd55cb34e7edB29DeC1a98Bf80 --blrproxyaddress 0x3cff38d8ef14279cea40bb517e2b1dba56c0d035 --blrv2implementationaddress 0x3Ae6D8296c81E8CaF55CafD0CE23FB7504Ff4375
 */

task('rollbackBLRToV2', 'Rollback V3 Migrattion to v2')
    .addParam('blrproxyadminaddress', 'The address of the business logic resolver proxy admin', undefined, types.string)
    .addParam('blrproxyaddress', 'The address of the business logic resolver proxy', undefined, types.string)
    .addParam(
        'blrv2implementationaddress',
        'The address of the V2 business logic resolver implementation',
        undefined,
        types.string
    )
    .setAction(async (args, hre) => {
        const { ProxyAdmin__factory } = await import('@contracts/index')
        const { GAS_LIMIT, TransactionReceiptError } = await import('@scripts')

        const { blrproxyadminaddress, blrproxyaddress, blrv2implementationaddress } = args

        const network = hre.network.name as NetworkName

        const signer = (await WithSignerCommand.newInstance({ hre })).signer
        const signerAddress = await signer.getAddress()

        const BLRProxyAdmin = await ProxyAdmin__factory.connect(blrproxyadminaddress, signer)

        const currentAdmin = await BLRProxyAdmin.owner()

        if (currentAdmin.toLowerCase() !== signerAddress.toLowerCase()) {
            throw new Error(
                `Proxy Admin mismatch: Current Admin is ${currentAdmin}, signer is ${signerAddress}. Please use the correct signer to perform the upgrade.`
            )
        }

        const previous_impl = await BLRProxyAdmin.getProxyImplementation(blrproxyaddress)

        console.log(`Upgrade BLR proxy implementation on ${network} ...`)

        const upgradeTx = await BLRProxyAdmin.upgrade(blrproxyaddress, blrv2implementationaddress, {
            gasLimit: GAS_LIMIT.resolverProxy.upgrade,
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

        console.log(`\n BLR Previous implementation : ${previous_impl}`)
        console.log(`\n BLR New implementation : ${new_impl}`)
    })

/**
 * npx hardhat rollbackResolverProxyToVersion --resolverproxyaddress 0xef4522693eefa17114220b82e4716238afbf509c --configversion 1
 */

task('rollbackResolverProxyToVersion', 'Upgrade a SC version')
    .addParam('resolverproxyaddress', 'The address of the resolver proxy', undefined, types.string)
    .addParam('configversion', 'The version to rollback the resolver proxy to', undefined, types.string)
    .setAction(async (args, hre) => {
        const { IDiamondCut__factory, IDiamondCutManager__factory } = await import('@contracts/index')
        const { GAS_LIMIT } = await import('@scripts')

        const { resolverproxyaddress, configversion } = args

        const network = hre.network.name as NetworkName

        const signer = (await WithSignerCommand.newInstance({ hre })).signer

        console.log(`Retrieving resolver proxy configuration on ${network} ...`)

        const scProxy = IDiamondCut__factory.connect(resolverproxyaddress, signer)

        const [resolverAddress, configId, previousVersion] = await scProxy.getConfigInfo()

        console.log(`Current resolver proxy resolver: ${resolverAddress}`)
        console.log(`Current resolver proxy configuration id: ${configId}`)
        console.log(`Current resolver proxy previous version: ${previousVersion}`)

        if (previousVersion.toString() === configversion) {
            console.log(`resolver proxy is already at version ${configversion}, no rollback needed.`)
            return
        }

        console.log(`Retrieving latest version for configuration ${configId} on ${network} ...`)

        const latestVersion = await IDiamondCutManager__factory.connect(
            resolverAddress,
            hre.ethers.provider
        ).getLatestVersionByConfiguration(configId)

        if (parseInt(latestVersion.toString()) < parseInt(configversion)) {
            console.log(
                `Cannot rollback to version ${configversion} as it is higher than the latest version ${latestVersion}.`
            )
            return
        }

        console.log(`Upgrading resolver proxy configuration to ${configversion} on ${network} ...`)

        await scProxy.updateConfigVersion(configversion, {
            gasLimit: GAS_LIMIT.resolverProxy.upgrade,
        })

        const [newResolverAddress, newConfigId, newVersion] = await scProxy.getConfigInfo()

        console.log(`New resolver proxy resolver: ${newResolverAddress}`)
        console.log(`New resolver proxy configuration id: ${newConfigId}`)
        console.log(`New resolver proxy version: ${newVersion}`)
    })
