import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface DeployAllCommandBaseParams {
    useDeployed?: boolean
    useEnvironment?: boolean
    partialBatchDeploy?: boolean
}

interface DeployAllCommandParams extends WithSignerCommandParams, DeployAllCommandBaseParams {}

interface ConstructorParams extends WithSignerConstructorParams, DeployAllCommandBaseParams {}

export default class DeployAllCommand extends WithSignerCommand {
    public readonly useDeployed: boolean
    public readonly useEnvironment: boolean
    public readonly partialBatchDeploy: boolean

    constructor({
        useDeployed = true,
        useEnvironment = false,
        partialBatchDeploy = false,
        ...args
    }: ConstructorParams) {
        super(args)
        this.useDeployed = useDeployed
        this.useEnvironment = useEnvironment
        this.partialBatchDeploy = partialBatchDeploy
    }
}

export async function newInstance(args: DeployAllCommandParams): Promise<DeployAllCommand> {
    const { useDeployed, useEnvironment, partialBatchDeploy, ...signerArgs } = args
    const parentCommand = await WithSignerCommand.newInstance(signerArgs)
    return new DeployAllCommand({
        useDeployed,
        useEnvironment,
        partialBatchDeploy,
        ...parentCommand,
    })
}
