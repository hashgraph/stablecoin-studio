import { upgrades } from 'hardhat'
import { ContractFactory } from 'ethers'
import { ContractFactory as HContractFactory } from '@hashgraph/hethers'

export async function validateUpgrade(
    oldImplFactory: HContractFactory,
    newImplFactory: HContractFactory
): Promise<void> {
    console.log('Checking upgrade validity')

    await upgrades.validateUpgrade(
        cast_HContractFactory_To_ContractFactory(oldImplFactory),
        cast_HContractFactory_To_ContractFactory(newImplFactory)
    )

    console.log('upgrade valid')
}

function cast_HContractFactory_To_ContractFactory(
    Hfactory: HContractFactory
): ContractFactory {
    return new ContractFactory(Hfactory.interface, Hfactory.bytecode)
}
