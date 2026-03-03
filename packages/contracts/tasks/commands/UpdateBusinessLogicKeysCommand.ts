import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface UpdateBusinessLogicKeysCommandBaseParams {
    resolverAddress: string
    implementationAddressList: string // * Comma separated list
}

interface UpdateBusinessLogicKeysCommandParams
    extends WithSignerCommandParams,
        UpdateBusinessLogicKeysCommandBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, UpdateBusinessLogicKeysCommandBaseParams {}

export default class UpdateBusinessLogicKeysCommand extends WithSignerCommand {
    public readonly resolverAddress: string
    public readonly implementationAddressList: string

    private constructor({ resolverAddress, implementationAddressList, ...args }: ConstructurParams) {
        super(args)
        this.resolverAddress = resolverAddress
        this.implementationAddressList = implementationAddressList
    }

    public static async newInstance(
        args: UpdateBusinessLogicKeysCommandParams
    ): Promise<UpdateBusinessLogicKeysCommand> {
        const { resolverAddress, implementationAddressList, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new UpdateBusinessLogicKeysCommand({
            resolverAddress,
            implementationAddressList,
            ...parentCommand,
        })
    }
}
