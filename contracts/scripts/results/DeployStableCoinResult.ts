import { ContractReceipt } from 'ethers'

interface DeployStableCoinResultParams {
    stableCoinProxyAddress: string
    tokenAddress: string
    reserveProxyAddress?: string
    receipt?: ContractReceipt
}

export default class DeployStableCoinResult {
    public readonly stableCoinProxyAddress: string
    public readonly tokenAddress: string
    public readonly reserveProxyAddress?: string
    public readonly receipt?: ContractReceipt

    constructor({ stableCoinProxyAddress, tokenAddress, reserveProxyAddress, receipt }: DeployStableCoinResultParams) {
        this.stableCoinProxyAddress = stableCoinProxyAddress
        this.tokenAddress = tokenAddress
        this.reserveProxyAddress = reserveProxyAddress
        this.receipt = receipt
    }
}
