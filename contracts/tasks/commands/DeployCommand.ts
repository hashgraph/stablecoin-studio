import { ContractName } from '@configuration'
import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface DeployCommandBaseParams {
    contractName: ContractName
}

interface DeployCommandParams extends WithSignerCommandParams, DeployCommandBaseParams {}

interface ConstructorParams extends WithSignerConstructorParams, DeployCommandBaseParams {}

export default class DeployCommand extends WithSignerCommand {
    public readonly contractName: ContractName

    constructor({ contractName, ...args }: ConstructorParams) {
        super(args)
        this.contractName = contractName
    }

    public static async newInstance(args: DeployCommandParams): Promise<DeployCommand> {
        const { contractName, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new DeployCommand({
            contractName,
            ...parentCommand,
        })
    }
}
