import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface EditHederaTokenManagerAddressBaseParams {
    factoryProxyAddress: string
    tokenManagerAddress: string
    index: number
}

interface EditHederaTokenManagerAddressCommandParams
    extends WithSignerCommandParams,
        EditHederaTokenManagerAddressBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, EditHederaTokenManagerAddressBaseParams {}

export default class EditHederaTokenManagerAddressCommand extends WithSignerCommand {
    public readonly factoryProxyAddress: string
    public readonly tokenManagerAddress: string
    public readonly index: number

    private constructor({ factoryProxyAddress, tokenManagerAddress, index, ...args }: ConstructurParams) {
        super(args)
        this.factoryProxyAddress = factoryProxyAddress
        this.tokenManagerAddress = tokenManagerAddress
        this.index = index
    }

    public static async newInstance(
        args: EditHederaTokenManagerAddressCommandParams
    ): Promise<EditHederaTokenManagerAddressCommand> {
        const { factoryProxyAddress, tokenManagerAddress, index, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new EditHederaTokenManagerAddressCommand({
            factoryProxyAddress,
            tokenManagerAddress,
            index,
            ...parentCommand,
        })
    }
}
