import { IDiamondLoupe } from '@contracts'

interface FacetsPerVersion {
    facetListRecord: Record<number, IDiamondLoupe.FacetStructOutput[]>
}

export default class GetFacetsByConfigurationIdAndVersionResult {
    public readonly facetListRecord: Record<number, IDiamondLoupe.FacetStructOutput[]>

    constructor({ facetListRecord }: FacetsPerVersion) {
        this.facetListRecord = facetListRecord
    }
}
