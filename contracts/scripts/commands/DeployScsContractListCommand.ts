import { NetworkName } from '@configuration'
import { Signer } from 'ethers'

interface DeployScsContractsCommandNewParams {
    signer: Signer
    useDeployed?: boolean
    useEnvironment?: boolean
    partialBatchDeploy?: boolean
}

export interface DeployScsContractListCommandParams extends DeployScsContractsCommandNewParams {
    network: NetworkName
}

export default class DeployScsContractListCommand {
    public readonly signer: Signer
    public readonly network: NetworkName
    public readonly useDeployed: boolean
    public readonly useEnvironment: boolean = false
    public readonly partialBatchDeploy: boolean = false

    constructor({
        signer,
        network,
        useDeployed = true,
        useEnvironment = false,
        partialBatchDeploy = false,
    }: DeployScsContractListCommandParams) {
        this.useDeployed = useDeployed
        this.useEnvironment = useEnvironment
        this.network = network!
        this.signer = signer
        this.partialBatchDeploy = partialBatchDeploy
    }

    public static async newInstance({
        signer,
        useDeployed = true,
        useEnvironment = false,
        partialBatchDeploy = false,
    }: DeployScsContractsCommandNewParams): Promise<DeployScsContractListCommand> {
        if (!signer.provider) {
            throw new Error('Signer must have a provider')
        }
        return new DeployScsContractListCommand({
            signer,
            network: (await signer.provider.getNetwork()).name as NetworkName,
            useDeployed,
            useEnvironment,
            partialBatchDeploy,
        })
    }
}
