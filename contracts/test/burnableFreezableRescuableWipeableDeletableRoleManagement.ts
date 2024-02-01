import { burnable } from './burnable'
import { freezable } from './freezable'
import { deletable } from './deletable'
import {
    buildDeployedContracts,
    deployRegularFactoryPlus100000,
    IContractIdMap,
    regularFactoryPlus100000,
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

    burnable(deployedContracts[regularFactoryPlus100000])
    freezable(deployedContracts[regularFactoryPlus100000])
    rescuable(deployedContracts[regularFactoryPlus100000])
    wipeable(deployedContracts[regularFactoryPlus100000])
    deletable(deployedContracts[regularFactoryPlus100000])
    roleManagement(deployedContracts[regularFactoryPlus100000])
})
