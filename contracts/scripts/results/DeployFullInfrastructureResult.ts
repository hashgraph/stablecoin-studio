interface TupDeployment {
    address: string
    proxyAddress: string
    proxyAdminAddress: string
}
interface StableCoinDeployment extends TupDeployment {
    tokenAddress: string
    reserveProxy?: string
    reserveProxyAdmin?: string
}
interface DeployFullInfrastructureResultParams {
    hederaTokenManagerAddress: string
    stableCoinDeployment: StableCoinDeployment
    stableCoinFactoryDeployment: TupDeployment
    stableCoinCreator: string
    KycGranted: boolean
}

export default class DeployFullInfrastructureResult {
    public readonly hederaTokenManagerAddress: string
    public readonly stableCoinDeployment: StableCoinDeployment
    public readonly stableCoinFactoryDeployment: TupDeployment
    public readonly stableCoinCreator: string
    public readonly KycGranted: boolean

    constructor({
        hederaTokenManagerAddress,
        stableCoinDeployment,
        stableCoinFactoryDeployment,
        stableCoinCreator,
        KycGranted,
    }: DeployFullInfrastructureResultParams) {
        this.hederaTokenManagerAddress = hederaTokenManagerAddress
        this.stableCoinDeployment = stableCoinDeployment
        this.stableCoinFactoryDeployment = stableCoinFactoryDeployment
        this.stableCoinCreator = stableCoinCreator
        this.KycGranted = KycGranted
    }
}
