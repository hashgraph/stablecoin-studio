import { DeployFullInfrastructureResult, DeployScsContractListResult } from '@scripts'
import { BusinessLogicResolver } from '@typechain'

interface NewEnvironmentParams {
    commonFacetIdList?: string[]
    commonFacetVersionList?: number[]
    businessLogicResolver?: BusinessLogicResolver
    stableCoinProxyAddress?: string
    reserveProxyAddress?: string
    tokenAddress?: string
    deployedContracts?: DeployScsContractListResult
}

export default class Environment {
    public commonFacetIdList?: string[]
    public commonFacetVersionList?: number[]
    public businessLogicResolver?: BusinessLogicResolver
    public stableCoinProxyAddress?: string
    public reserveProxyAddress?: string
    public tokenAddress?: string
    public deployedContracts?: DeployScsContractListResult

    constructor({
        commonFacetIdList,
        commonFacetVersionList,
        businessLogicResolver,
        stableCoinProxyAddress,
        reserveProxyAddress,
        tokenAddress,
        deployedContracts,
    }: NewEnvironmentParams) {
        this.commonFacetIdList = commonFacetIdList
        this.commonFacetVersionList = commonFacetVersionList
        this.businessLogicResolver = businessLogicResolver
        this.stableCoinProxyAddress = stableCoinProxyAddress
        this.reserveProxyAddress = reserveProxyAddress
        this.tokenAddress = tokenAddress
        this.deployedContracts = deployedContracts
    }

    public static empty(): Environment {
        return new Environment({})
    }

    public toDeployAtsFullInfrastructureResult(): DeployFullInfrastructureResult {
        const { commonFacetIdList, commonFacetVersionList, deployedContracts } = this._validateInitialization()

        return new DeployFullInfrastructureResult({
            facetLists: {
                commonFacetIdList,
                commonFacetVersionList,
            },
            ...deployedContracts,
        })
    }

    public get initialized(): boolean {
        try {
            this._validateInitialization()
            return true
        } catch {
            return false
        }
    }

    private _validateInitialization() {
        if (
            !this.commonFacetIdList ||
            !this.commonFacetVersionList ||
            !this.businessLogicResolver ||
            !this.deployedContracts
        ) {
            throw new Error('Environment must be initialized')
        }
        return {
            commonFacetIdList: this.commonFacetIdList,
            commonFacetVersionList: this.commonFacetVersionList,
            businessLogicResolver: this.businessLogicResolver,
            deployedContracts: this.deployedContracts,
        }
    }
}
