import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface DeployStableCoinFactoryBaseParams {
    tokenManagerAddress?: string
}

interface DeployStableCoinFactoryCommandParams extends WithSignerCommandParams, DeployStableCoinFactoryBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, DeployStableCoinFactoryBaseParams {}

export default class DeployStableCoinFactoryCommand extends WithSignerCommand {
    public readonly tokenManagerAddress?: string

    protected constructor({ tokenManagerAddress, ...args }: ConstructurParams) {
        super(args)
        this.tokenManagerAddress = tokenManagerAddress
    }

    public static async newInstance(
        args: DeployStableCoinFactoryCommandParams
    ): Promise<DeployStableCoinFactoryCommand> {
        const { tokenManagerAddress, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new DeployStableCoinFactoryCommand({
            tokenManagerAddress,
            ...parentCommand,
        })
    }
}
