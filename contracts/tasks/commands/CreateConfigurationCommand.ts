import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

export interface CreateConfigurationCommandBaseParams {
    resolverAddress: string
    facetsAddress: string // * Comma separated list
}

export interface CreateConfigurationCommandParams
    extends WithSignerCommandParams,
        CreateConfigurationCommandBaseParams {}

interface ConstructurParams extends WithSignerConstructorParams, CreateConfigurationCommandBaseParams {}

/**
 * Command for creating a new configuration in the resolver.
 *
 *
 * @notice Currently only supports 1 version per facet.
 *
 * @param resolverAddress - The address of the resolver's proxy.
 * @param facetsAddress - A comma-separated list of addresses for the facets to be configured.
 */

export default class CreateConfigurationCommand extends WithSignerCommand {
    public readonly facetsAddressList: string[]
    public readonly resolverAddress: string

    private constructor({ resolverAddress, facetsAddress, ...args }: ConstructurParams) {
        super(args)

        this.facetsAddressList = facetsAddress.split(',').map((addr) => addr.trim())
        this.resolverAddress = resolverAddress
    }

    public static async newInstance(args: CreateConfigurationCommandParams): Promise<CreateConfigurationCommand> {
        const { resolverAddress, facetsAddress, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new CreateConfigurationCommand({
            resolverAddress,
            facetsAddress,
            ...parentCommand,
        })
    }
}
