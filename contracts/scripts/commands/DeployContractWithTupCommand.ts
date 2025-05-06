import { DeployContractDirectCommand, DeployContractDirectCommandParams } from '@scripts'
import { ContractFactory } from 'ethers'

interface DeployContractWithTupCommandParams<F extends ContractFactory> extends DeployContractDirectCommandParams<F> {}

export default class DeployContractWithTupCommand<F extends ContractFactory> extends DeployContractDirectCommand<F> {
    constructor(parentParams: DeployContractWithTupCommandParams<F>) {
        super(parentParams)
    }
}
