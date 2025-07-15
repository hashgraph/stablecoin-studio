import { Overrides, Provider } from 'ethers'

export interface BaseBlockchainQueryParams {
    provider: Provider
    overrides?: Overrides
}

export default abstract class BaseBlockchainQuery {
    public readonly provider: Provider
    public readonly overrides?: Overrides

    constructor({ provider, overrides }: BaseBlockchainQueryParams) {
        this.provider = provider
        this.overrides = overrides
    }
}
