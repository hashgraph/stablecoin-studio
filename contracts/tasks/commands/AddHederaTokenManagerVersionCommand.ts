import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface AddHederaTokenManagerVersionBaseParams {
    factoryProxyAddress: string
    tokenManagerAddress: string
}

interface AddHederaTokenManagerVersionCommandParams
    extends WithSignerCommandParams,
        AddHederaTokenManagerVersionBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, AddHederaTokenManagerVersionBaseParams {}

export default class AddHederaTokenManagerVersionCommand extends WithSignerCommand {
    public readonly factoryProxyAddress: string
    public readonly tokenManagerAddress: string

    private constructor({ factoryProxyAddress, tokenManagerAddress, ...args }: ConstructurParams) {
        super(args)
        this.factoryProxyAddress = factoryProxyAddress
        this.tokenManagerAddress = tokenManagerAddress
    }

    public static async newInstance(
        args: AddHederaTokenManagerVersionCommandParams
    ): Promise<AddHederaTokenManagerVersionCommand> {
        const { factoryProxyAddress, tokenManagerAddress, ...signerArgs } = args
        const withSignerResult = await WithSignerCommand.newInstance(signerArgs)
        return new AddHederaTokenManagerVersionCommand({
            factoryProxyAddress,
            tokenManagerAddress,
            ...withSignerResult,
        })
    }
}
