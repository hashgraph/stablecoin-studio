import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { deployFullInfrastructureInTests, deployStableCoinInTests } from '@test/shared'
import { MigrationProxy, MigrationProxy__factory } from '@contracts'
import {
  deployContract,
  DeployContractCommand,
  DeployFullInfrastructureCommand,
  GAS_LIMIT,
  ADDRESS_ZERO
} from '@scripts'
import { ethers } from 'hardhat'

describe('MigrationProxy tests', function () {
    const NO_CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const STABLECOIN_CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000002'

    // Accounts
    let operator: SignerWithAddress
    let migrationProxy: MigrationProxy

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        ;[operator] = await ethers.getSigners()
    })

    it('GIVEN a deployed migration proxy WHEN initializing the proxy THEN ...', async function () {
        const {...deployedContracts} = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )

        const migrationProxyContract = await deployContract(
            await DeployContractCommand.newInstance({
                factory: new MigrationProxy__factory(),
                signer: operator,
                deployType: 'tup',
                deployedContract: undefined,
                overrides: { gasLimit: GAS_LIMIT.migrationProxy.deploy },
            })
        )

        migrationProxy = MigrationProxy__factory.connect(
          migrationProxyContract.proxyAddress!, operator
        )

        await expect (migrationProxy.initializeV2Migration(
          deployedContracts.businessLogicResolver.proxyAddress!, STABLECOIN_CONFIG_ID, 0, [],
          { gasLimit: GAS_LIMIT.migrationProxy.initialize }
        )).to.not.be.reverted;
    })

    it('GIVEN an already initialized migration proxy WHEN trying to initialize again THEN transaction fails with AlreadyInitialized', async function () {
        await expect(migrationProxy.initializeV2Migration(
          ADDRESS_ZERO, NO_CONFIG_ID, 0, [],
          { gasLimit: GAS_LIMIT.migrationProxy.initialize }
        )).to.be.revertedWithCustomError(migrationProxy, 'ContractIsAlreadyInitialized')
    })
})