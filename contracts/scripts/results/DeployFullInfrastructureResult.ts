import {
    CreateConfigurationsForDeployedContractsResult,
    DeployScsContractListResult,
    DeployScsContractListResultParams,
} from '@scripts'

interface DeployFullInfrastructureResultParams extends DeployScsContractListResultParams {
    facetLists: CreateConfigurationsForDeployedContractsResult
}

export default class DeployFullInfrastructureResult extends DeployScsContractListResult {
    public readonly facetLists: CreateConfigurationsForDeployedContractsResult

    constructor({ facetLists, ...params }: DeployFullInfrastructureResultParams) {
        super(params)
        this.facetLists = facetLists
    }
}
