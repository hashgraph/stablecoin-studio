interface CreateConfigurationsForDeployedContractsResultParams {
    facetIdList: string[]
    facetVersionList: number[]
}

export default class CreateConfigurationsForDeployedContractsResult {
    public facetIdList: string[]
    public facetVersionList: number[]

    constructor({ facetIdList, facetVersionList }: CreateConfigurationsForDeployedContractsResultParams) {
        this.facetIdList = facetIdList
        this.facetVersionList = facetVersionList
    }

    public static empty(): CreateConfigurationsForDeployedContractsResult {
        return new CreateConfigurationsForDeployedContractsResult({
            facetIdList: [],
            facetVersionList: [],
        })
    }
}
