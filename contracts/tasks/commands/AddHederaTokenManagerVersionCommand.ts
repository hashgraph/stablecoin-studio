import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface AddHederaTokenManagerVersionBaseParams {
    factoryProxyAddress: string
    tokenManagerAddress: string
}

export interface AddHederaTokenManagerVersionCommandParams
    extends WithSignerCommandParams,
        AddHederaTokenManagerVersionBaseParams {}

export interface ConstructurParams extends WithSignerConstructorParams, AddHederaTokenManagerVersionBaseParams {}

export default class AddHederaTokenManagerVersionCommand extends WithSignerCommand {
    public readonly factoryProxyAddress: string
    public readonly tokenManagerAddress: string

    protected constructor({ factoryProxyAddress, tokenManagerAddress, ...args }: ConstructurParams) {
        super(args)
        this.factoryProxyAddress = factoryProxyAddress
        this.tokenManagerAddress = tokenManagerAddress
    }

    public static async newInstance(
        args: AddHederaTokenManagerVersionCommandParams
    ): Promise<AddHederaTokenManagerVersionCommand> {
        const { factoryProxyAddress, tokenManagerAddress, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new AddHederaTokenManagerVersionCommand({
            factoryProxyAddress,
            tokenManagerAddress,
            ...parentCommand,
        })
    }
}
