import { Signer } from 'ethers'
import { NetworkName, NetworkNameByChainId } from '@configuration'
import { SignerWithoutProviderError } from '@scripts'
import { NetworkChainId } from '@configuration'

interface DeployFullInfrastructureCommandParamsCommon {
    signer: Signer
    useDeployed?: boolean
    useEnvironment?: boolean
    partialBatchDeploy?: boolean
}

export interface DeployFullInfrastructureCommandNewParams extends DeployFullInfrastructureCommandParamsCommon {}

interface DeployFullInfrastructureCommandParams extends DeployFullInfrastructureCommandParamsCommon {
    network: NetworkName
}

export default class DeployFullInfrastructureCommand {
    public readonly signer: Signer
    public readonly network: NetworkName
    public readonly useDeployed: boolean
    public readonly useEnvironment: boolean
    public readonly partialBatchDeploy: boolean

    constructor({
        signer,
        network,
        useDeployed = true,
        useEnvironment = false,
        partialBatchDeploy = false,
    }: DeployFullInfrastructureCommandParams) {
        this.signer = signer
        this.network = network
        this.useDeployed = useDeployed
        this.useEnvironment = useEnvironment
        this.partialBatchDeploy = partialBatchDeploy
    }

    public static async newInstance({
        signer,
        useDeployed = true,
        useEnvironment = false,
        partialBatchDeploy = false,
    }: DeployFullInfrastructureCommandNewParams): Promise<DeployFullInfrastructureCommand> {
        if (!signer.provider) {
            throw new SignerWithoutProviderError()
        }
        const { chainId } = await signer.provider.getNetwork()
        const network = NetworkNameByChainId[Number(chainId) as NetworkChainId]

        return new DeployFullInfrastructureCommand({
            signer,
            network,
            useDeployed,
            useEnvironment,
            partialBatchDeploy,
        })
    }
}
