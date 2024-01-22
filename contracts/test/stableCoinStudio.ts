import { burnable } from './burnable'
import { freezable } from './freezable'
import { deletable } from './deletable'
import {
    buildDeployedContracts,
    deployRegularFactory,
    deployRegularFactoryPlus100000,
    IContractIdMap,
    regularfactory,
    regularfactoryplus100000,
} from './shared/utils'
import { pausable } from './pausable'
import { hederaTokenManager } from './hederaTokenManager'
import { deployAFactory } from './deployFactory'
import { kyc } from './kyc'
import { rescuable } from './rescuable'
import { wipeable } from './wipeable'
import { reserve } from './reserve'
import { supplierAdmin } from './supplieradmin'
import { hederaReserve } from './hederaReserve'

const deployedContracts: IContractIdMap = buildDeployedContracts()
describe('Stable Coin Studio test suite', () => {
    deployAFactory()
    kyc()
    reserve()
    hederaReserve()
    supplierAdmin()

    describe('Burnable & Freezable', () => {
        before(async () => {
            // Deploy Token using Client
            await deployRegularFactoryPlus100000(deployedContracts)
        })

        burnable(deployedContracts[regularfactoryplus100000])
        freezable(deployedContracts[regularfactoryplus100000])
        rescuable(deployedContracts[regularfactoryplus100000])
        wipeable(deployedContracts[regularfactoryplus100000])
        deletable(deployedContracts[regularfactoryplus100000])
    })

    describe('HederaTokenManager', () => {
        before(async () => {
            // Deploy Token using Client
            await deployRegularFactory(deployedContracts)
        })

        hederaTokenManager(deployedContracts)
        pausable(deployedContracts[regularfactory])
    })
})
