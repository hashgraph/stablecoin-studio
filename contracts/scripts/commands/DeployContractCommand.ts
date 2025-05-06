import { ContractFactory } from 'ethers'
import { DeployedContract, DeployType } from '@configuration'
import { configuration } from '@hardhat-configuration'
import { RolesStructStruct as RolesStruct } from '../../typechain-types/contracts/HederaTokenManagerFacet'
import {
    BusinessLogicResolverAddressRequiredError,
    ConfigurationIdRequiredError,
    ConfigurationVersionRequiredError,
    DeployContractDirectCommand,
    DeployContractDirectCommandParams,
    DeployContractWithResolverProxyCommandNewParams,
    RolesStructRequiredError,
} from '@scripts'

interface DeployContractCommandParams<F extends ContractFactory> extends DeployContractDirectCommandParams<F> {
    deployType?: DeployType
    deployedContract?: DeployedContract
    businessLogicResolverAddress?: string
    configurationId?: string
    configurationVersion?: number
    rolesStruct?: RolesStruct[]
}

interface DeployContractCommandNewParams<F extends ContractFactory>
    extends DeployContractWithResolverProxyCommandNewParams<F> {
    deployType?: DeployType
    deployedContract?: DeployedContract
}

export default class DeployContractCommand<F extends ContractFactory> extends DeployContractDirectCommand<F> {
    public readonly deployType: DeployType
    public readonly deployedContract?: DeployedContract
    public readonly businessLogicResolverAddress?: string
    public readonly configurationId?: string
    public readonly configurationVersion?: number
    public readonly rolesStruct?: RolesStruct[]

    constructor({
        deployType,
        deployedContract,
        businessLogicResolverAddress,
        configurationId,
        configurationVersion,
        rolesStruct,
        ...parentParams
    }: DeployContractCommandParams<F>) {
        super({ ...parentParams })
        this.deployType = deployType || configuration.contracts[this.name].deployType
        this.deployedContract = deployedContract
        if (this.deployType === 'resolverProxy') {
            this.businessLogicResolverAddress = businessLogicResolverAddress
            this.configurationId = configurationId
            this.configurationVersion = configurationVersion
            this.rolesStruct = rolesStruct
            if (!this.businessLogicResolverAddress) {
                throw new BusinessLogicResolverAddressRequiredError()
            }
            if (!this.configurationId) {
                throw new ConfigurationIdRequiredError()
            }
            if (!this.configurationVersion) {
                throw new ConfigurationVersionRequiredError()
            }
            if (!this.rolesStruct) {
                throw new RolesStructRequiredError()
            }
        }
    }

    public static override async newInstance<F extends ContractFactory>({
        deployType,
        deployedContract,
        businessLogicResolverAddress,
        configurationId,
        configurationVersion,
        rolesStruct,
        ...parentParams
    }: DeployContractCommandNewParams<F>): Promise<DeployContractCommand<F>> {
        const { name, factory, signer, args = [], overrides } = await super.newInstance(parentParams)
        return new DeployContractCommand<F>({
            name,
            factory,
            signer,
            args,
            overrides,
            deployType,
            deployedContract,
            businessLogicResolverAddress,
            configurationId,
            configurationVersion,
            rolesStruct,
        })
    }
}
