import {
    AddHederaTokenManagerVersionCommand,
    AddHederaTokenManagerVersionCommandParams,
    AddHederaTokenManagerVersionConstructorParams,
} from '@tasks'

interface EditHederaTokenManagerAddressBaseParams {
    index: number
}

interface EditHederaTokenManagerAddressCommandParams
    extends AddHederaTokenManagerVersionCommandParams,
        EditHederaTokenManagerAddressBaseParams {}

interface ConstructurParams
    extends AddHederaTokenManagerVersionConstructorParams,
        EditHederaTokenManagerAddressBaseParams {}

export default class EditHederaTokenManagerAddressCommand extends AddHederaTokenManagerVersionCommand {
    public readonly index: number

    protected constructor({ index, ...args }: ConstructurParams) {
        super(args)
        this.index = index
    }

    public static async newInstance(
        args: EditHederaTokenManagerAddressCommandParams
    ): Promise<EditHederaTokenManagerAddressCommand> {
        const { index, ...signerArgs } = args
        const parentCommand = await AddHederaTokenManagerVersionCommand.newInstance(signerArgs)
        return new EditHederaTokenManagerAddressCommand({
            index,
            ...parentCommand,
        })
    }
}
