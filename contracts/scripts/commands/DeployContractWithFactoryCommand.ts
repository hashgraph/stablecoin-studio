import { type ContractFactory, Overrides, Signer } from 'ethers'
import { DeployedContract } from '@configuration'

export default class DeployContractWithFactoryCommand<F extends ContractFactory> {
    public readonly factory: F
    public readonly signer: Signer
    public readonly args: any[]
    public readonly overrides?: Overrides
    public readonly withProxy: boolean
    public readonly deployedContract?: DeployedContract

    constructor({
        factory,
        signer,
        args = [],
        overrides,
        withProxy = false,
        deployedContract,
    }: {
        factory: F
        signer: Signer
        args?: any[]
        overrides?: any
        withProxy?: boolean
        deployedContract?: DeployedContract
    }) {
        this.factory = factory
        this.signer = signer
        this.args = args
        this.overrides = overrides
        this.withProxy = withProxy
        this.deployedContract = deployedContract
    }
}
