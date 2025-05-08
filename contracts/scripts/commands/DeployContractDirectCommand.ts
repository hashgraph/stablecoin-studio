import { ethers } from 'hardhat'
import { ContractFactory, Overrides, Signer } from 'ethers'
import { ContractName } from '@configuration'
import { NameOrFactoryRequiredError } from '@scripts'

interface CommonParams {
    signer: Signer
    args?: Array<any>
    overrides?: Overrides
}

export interface DeployContractDirectCommandParams<F extends ContractFactory> extends CommonParams {
    name: ContractName
    factory: F
}

export interface DeployContractDirectCommandNewParams<F extends ContractFactory> extends CommonParams {
    name?: ContractName
    factory?: F
}

export default class DeployContractDirectCommand<F extends ContractFactory> {
    public readonly name: ContractName
    public readonly factory: F
    public readonly signer: Signer
    public readonly args: Array<any>
    public readonly overrides: Overrides

    constructor({ name, factory, signer, args = [], overrides = {} }: DeployContractDirectCommandParams<F>) {
        this.name = name
        this.factory = factory
        this.signer = signer
        this.args = args
        this.overrides = overrides
    }

    public static async newInstance<F extends ContractFactory>({
        name,
        factory,
        signer,
        args,
        overrides,
    }: DeployContractDirectCommandNewParams<F>): Promise<DeployContractDirectCommand<F>> {
        if (!name && !factory) {
            throw new NameOrFactoryRequiredError()
        }

        let resolvedFactory = factory
        let resolvedName = name

        if (factory) {
            resolvedFactory = factory.connect(signer) as F
            if (!name) {
                // Try to infer contract name from factory class name
                const factoryName = (factory as any).constructor?.name
                if (factoryName && factoryName.endsWith('__factory')) {
                    resolvedName = factoryName.replace(/__factory$/i, '') as ContractName
                }
            }
        } else if (name) {
            resolvedFactory = (await ethers.getContractFactory(name, signer)) as F
        }

        if (!resolvedName || !resolvedFactory) {
            throw new NameOrFactoryRequiredError()
        }

        return new DeployContractDirectCommand<F>({
            name: resolvedName,
            factory: resolvedFactory,
            signer,
            args,
            overrides,
        })
    }
}
