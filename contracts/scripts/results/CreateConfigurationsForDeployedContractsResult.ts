interface CreateConfigurationsForDeployedContractsResultParams {
    stableCoinFactoryFacetIdList: string[]
    stableCoinFactoryFacetVersionList: number[]
    stableCoinFacetIdList: string[]
    stableCoinFacetVersionList: number[]
    reserveFacetIdList: string[]
    reserveFacetVersionList: number[]
}

export default class CreateConfigurationsForDeployedContractsResult {
    public stableCoinFactoryFacetIdList: string[]
    public stableCoinFactoryFacetVersionList: number[]
    public stableCoinFacetIdList: string[]
    public stableCoinFacetVersionList: number[]
    public reserveFacetIdList: string[]
    public reserveFacetVersionList: number[]

    constructor({
        stableCoinFactoryFacetIdList,
        stableCoinFactoryFacetVersionList,
        stableCoinFacetIdList,
        stableCoinFacetVersionList,
        reserveFacetIdList,
        reserveFacetVersionList,
    }: CreateConfigurationsForDeployedContractsResultParams) {
        this.stableCoinFactoryFacetIdList = stableCoinFactoryFacetIdList
        this.stableCoinFactoryFacetVersionList = stableCoinFactoryFacetVersionList
        this.stableCoinFacetIdList = stableCoinFacetIdList
        this.stableCoinFacetVersionList = stableCoinFacetVersionList
        this.reserveFacetIdList = reserveFacetIdList
        this.reserveFacetVersionList = reserveFacetVersionList
    }

    public static empty(): CreateConfigurationsForDeployedContractsResult {
        return new CreateConfigurationsForDeployedContractsResult({
            stableCoinFactoryFacetIdList: [],
            stableCoinFactoryFacetVersionList: [],
            stableCoinFacetIdList: [],
            stableCoinFacetVersionList: [],
            reserveFacetIdList: [],
            reserveFacetVersionList: [],
        })
    }
}
