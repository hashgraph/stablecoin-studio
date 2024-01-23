import { burnable } from './burnable'
import { freezable } from './freezable'
import { deletable } from './deletable'
import {
    buildDeployedContracts,
    deployRegularFactoryPlus100000,
    IContractIdMap,
    regularfactoryplus100000,
} from './shared/utils'
import { rescuable } from './rescuable'
import { wipeable } from './wipeable'
import { roleManagement } from './roleManagement'

const deployedContracts: IContractIdMap = buildDeployedContracts()

describe('Burnable, Freezable, Rescuable, Wipeable, Deletable & Role Management', () => {
    before(async () => {
        // Deploy Token using Client
        await deployRegularFactoryPlus100000(deployedContracts)
    })

    burnable(deployedContracts[regularfactoryplus100000])
    freezable(deployedContracts[regularfactoryplus100000])
    rescuable(deployedContracts[regularfactoryplus100000])
    wipeable(deployedContracts[regularfactoryplus100000])
    deletable(deployedContracts[regularfactoryplus100000])
    roleManagement(deployedContracts[regularfactoryplus100000])
})
