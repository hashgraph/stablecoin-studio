export interface IStrategyConfig {}

export class FireblocksConfig implements IStrategyConfig {
    constructor(public apiKey: string, public apiSecretKey: string, public baseUrl: string) {}
}

export class DFNSConfig implements IStrategyConfig {
    constructor() {}
}