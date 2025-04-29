interface CreateConfigurationsForDeployedContractsResultParams {
    facetIdList: string[]
    facetVersionList: number[]
}

export default class CreateConfigurationsForDeployedContractsResult {
    public commonFacetIdList: string[]
    public commonFacetVersionList: number[]

    constructor({ facetIdList, facetVersionList }: CreateConfigurationsForDeployedContractsResultParams) {
        this.commonFacetIdList = facetIdList
        this.commonFacetVersionList = facetVersionList
    }

    public static empty(): CreateConfigurationsForDeployedContractsResult {
        return new CreateConfigurationsForDeployedContractsResult({
            facetIdList: [],
            facetVersionList: [],
        })
    }
}
