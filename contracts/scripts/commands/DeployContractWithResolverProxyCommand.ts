import {
    BusinessLogicResolverAddressRequiredError,
    ConfigurationIdRequiredError,
    ConfigurationVersionRequiredError,
    DeployContractDirectCommand,
    DeployContractDirectCommandNewParams,
    DeployContractDirectCommandParams,
    RolesStructRequiredError,
} from '@scripts'
import { RolesStructStruct as RolesStruct } from '../../typechain-types/contracts/HederaTokenManagerFacet'
import { ContractFactory } from 'ethers'

// Constrictor parameters
export interface DeployContractWithResolverProxyCommandParams<F extends ContractFactory>
    extends DeployContractDirectCommandParams<F> {
    businessLogicResolverAddress: string
    configurationId: string
    configurationVersion: number
    rolesStruct: RolesStruct[]
}
// New instance parameters
export interface DeployContractWithResolverProxyCommandNewParams<F extends ContractFactory>
    extends DeployContractDirectCommandNewParams<F> {
    businessLogicResolverAddress?: string
    configurationId?: string
    configurationVersion?: number
    rolesStruct?: RolesStruct[]
}

export default class DeployContractWithResolverProxyCommand<
    F extends ContractFactory,
> extends DeployContractDirectCommand<F> {
    public readonly businessLogicResolverAddress: string
    public readonly configurationId: string
    public readonly configurationVersion: number
    public readonly rolesStruct: RolesStruct[]

    constructor({
        businessLogicResolverAddress,
        configurationId,
        configurationVersion,
        rolesStruct,
        ...parentParams
    }: DeployContractWithResolverProxyCommandParams<F>) {
        super(parentParams)
        this.businessLogicResolverAddress = businessLogicResolverAddress
        this.configurationId = configurationId
        this.configurationVersion = configurationVersion
        this.rolesStruct = rolesStruct
    }
    public static override async newInstance<F extends ContractFactory>({
        businessLogicResolverAddress,
        configurationId,
        configurationVersion,
        rolesStruct,
        ...parentParams
    }: DeployContractWithResolverProxyCommandNewParams<F>): Promise<DeployContractWithResolverProxyCommand<F>> {
        if (!businessLogicResolverAddress) {
            throw new BusinessLogicResolverAddressRequiredError()
        }
        if (!configurationId) {
            throw new ConfigurationIdRequiredError()
        }
        if (!configurationVersion) {
            throw new ConfigurationVersionRequiredError()
        }
        if (!rolesStruct) {
            throw new RolesStructRequiredError()
        }
        const { name, factory, signer, args = [], overrides } = await super.newInstance(parentParams)
        return new DeployContractWithResolverProxyCommand<F>({
            name,
            factory,
            signer,
            args,
            overrides,
            businessLogicResolverAddress,
            configurationId,
            configurationVersion,
            rolesStruct,
        })
    }
}
