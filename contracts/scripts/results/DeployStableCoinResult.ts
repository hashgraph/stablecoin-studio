import { ContractTransactionReceipt } from 'ethers'

interface DeployStableCoinResultParams {
    stableCoinProxyAddress: string
    tokenAddress: string
    reserveProxyAddress?: string
    receipt?: ContractTransactionReceipt
}

export default class DeployStableCoinResult {
    public readonly stableCoinProxyAddress: string
    public readonly tokenAddress: string
    public readonly reserveProxyAddress?: string
    public readonly receipt?: ContractTransactionReceipt

    constructor({ stableCoinProxyAddress, tokenAddress, reserveProxyAddress, receipt }: DeployStableCoinResultParams) {
        this.stableCoinProxyAddress = stableCoinProxyAddress
        this.tokenAddress = tokenAddress
        this.reserveProxyAddress = reserveProxyAddress
        this.receipt = receipt
    }
}
