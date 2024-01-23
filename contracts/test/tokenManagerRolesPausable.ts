import {
    buildDeployedContracts,
    deployRegularFactory,
    IContractIdMap,
    regularfactory,
} from './shared/utils'
import { pausable } from './pausable'
import { hederaTokenManager } from './hederaTokenManager'
import { roles } from './roles'

const deployedContracts: IContractIdMap = buildDeployedContracts()
describe('HederaTokenManager, Roles & Pausable', () => {
    before(async () => {
        // Deploy Token using Client
        await deployRegularFactory(deployedContracts)
    })

    hederaTokenManager(deployedContracts)
    roles(deployedContracts[regularfactory])
    pausable(deployedContracts[regularfactory])
})
