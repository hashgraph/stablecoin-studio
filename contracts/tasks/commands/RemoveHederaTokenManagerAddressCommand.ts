import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface RemoveHederaTokenManagerAddressBaseParams {
    factoryProxyAddress: string
    index: number
}

interface RemoveHederaTokenManagerAddressCommandParams
    extends WithSignerCommandParams,
        RemoveHederaTokenManagerAddressBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, RemoveHederaTokenManagerAddressBaseParams {}

export default class RemoveHederaTokenManagerAddressCommand extends WithSignerCommand {
    public readonly factoryProxyAddress: string
    public readonly index: number

    private constructor({ factoryProxyAddress, index, ...args }: ConstructurParams) {
        super(args)
        this.factoryProxyAddress = factoryProxyAddress
        this.index = index
    }

    public static async newInstance(
        args: RemoveHederaTokenManagerAddressCommandParams
    ): Promise<RemoveHederaTokenManagerAddressCommand> {
        const { factoryProxyAddress, index, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new RemoveHederaTokenManagerAddressCommand({
            factoryProxyAddress,
            index,
            ...parentCommand,
        })
    }
}
