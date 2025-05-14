import { DeployFullInfrastructureResult, DeployScsContractListResult } from '@scripts'
import { BusinessLogicResolver } from '@typechain-types'

interface NewEnvironmentParams {
    stableCoinFactoryFacetIdList?: string[]
    stableCoinFactoryFacetVersionList?: number[]
    stableCoinFacetIdList?: string[]
    stableCoinFacetVersionList?: number[]
    reserveFacetIdList?: string[]
    reserveFacetVersionList?: number[]
    businessLogicResolver?: BusinessLogicResolver
    stableCoinFactoryProxyAddress?: string
    stableCoinProxyAddress?: string
    reserveProxyAddress?: string
    tokenAddress?: string
    deployedContracts?: DeployScsContractListResult
}

export default class Environment {
    public stableCoinFactoryFacetIdList?: string[]
    public stableCoinFactoryFacetVersionList?: number[]
    public stableCoinFacetIdList?: string[]
    public stableCoinFacetVersionList?: number[]
    public reserveFacetIdList?: string[]
    public reserveFacetVersionList?: number[]
    public commonFacetIdList?: string[]
    public commonFacetVersionList?: number[]
    public businessLogicResolver?: BusinessLogicResolver
    public stableCoinFactoryProxyAddress?: string
    public stableCoinProxyAddress?: string
    public reserveProxyAddress?: string
    public tokenAddress?: string
    public deployedContracts?: DeployScsContractListResult

    constructor({
        stableCoinFactoryFacetIdList,
        stableCoinFactoryFacetVersionList,
        stableCoinFacetIdList,
        stableCoinFacetVersionList,
        reserveFacetIdList,
        reserveFacetVersionList,
        businessLogicResolver,
        stableCoinFactoryProxyAddress,
        stableCoinProxyAddress,
        reserveProxyAddress,
        tokenAddress,
        deployedContracts,
    }: NewEnvironmentParams) {
        this.stableCoinFactoryFacetIdList = stableCoinFactoryFacetIdList
        this.stableCoinFactoryFacetVersionList = stableCoinFactoryFacetVersionList
        this.stableCoinFacetIdList = stableCoinFacetIdList
        this.stableCoinFacetVersionList = stableCoinFacetVersionList
        this.reserveFacetIdList = reserveFacetIdList
        this.reserveFacetVersionList = reserveFacetVersionList
        this.businessLogicResolver = businessLogicResolver
        this.stableCoinFactoryProxyAddress = stableCoinFactoryProxyAddress
        this.stableCoinProxyAddress = stableCoinProxyAddress
        this.reserveProxyAddress = reserveProxyAddress
        this.tokenAddress = tokenAddress
        this.deployedContracts = deployedContracts
    }

    public static empty(): Environment {
        return new Environment({})
    }

    public toDeployScsFullInfrastructureResult(): DeployFullInfrastructureResult {
        const {
            stableCoinFactoryFacetIdList,
            stableCoinFactoryFacetVersionList,
            stableCoinFacetIdList,
            stableCoinFacetVersionList,
            reserveFacetIdList,
            reserveFacetVersionList,
            deployedContracts,
        } = this._validateInitialization()

        return new DeployFullInfrastructureResult({
            facetLists: {
                stableCoinFactoryFacetIdList,
                stableCoinFactoryFacetVersionList,
                stableCoinFacetIdList,
                stableCoinFacetVersionList,
                reserveFacetIdList,
                reserveFacetVersionList,
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
            !this.stableCoinFactoryFacetIdList ||
            !this.stableCoinFactoryFacetVersionList ||
            !this.stableCoinFacetIdList ||
            !this.stableCoinFacetVersionList ||
            !this.reserveFacetIdList ||
            !this.reserveFacetVersionList ||
            !this.businessLogicResolver ||
            !this.deployedContracts
        ) {
            throw new Error('Environment must be initialized')
        }
        return {
            stableCoinFactoryFacetIdList: this.stableCoinFactoryFacetIdList,
            stableCoinFactoryFacetVersionList: this.stableCoinFactoryFacetVersionList,
            stableCoinFacetIdList: this.stableCoinFacetIdList,
            stableCoinFacetVersionList: this.stableCoinFacetVersionList,
            reserveFacetIdList: this.reserveFacetIdList,
            reserveFacetVersionList: this.reserveFacetVersionList,
            businessLogicResolver: this.businessLogicResolver,
            deployedContracts: this.deployedContracts,
        }
    }
}
