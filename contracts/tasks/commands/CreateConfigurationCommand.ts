import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

export interface CreateConfigurationCommandBaseParams {
    resolverAddress: string
    factoryAddress: string
    reserveAddress: string
    scsContracts: string[]
}

export interface CreateConfigurationCommandParams
    extends WithSignerCommandParams,
        CreateConfigurationCommandBaseParams {}

interface ConstructorParams extends WithSignerConstructorParams, CreateConfigurationCommandBaseParams {}

/**
 * Command for creating a new configuration in the resolver.
 *
 *
 * @notice Currently only supports 1 version per facet.
 *
 * @param resolverAddress - The address of the resolver's proxy.
 * @param factoryAddress - The address of the factory.
 * @param reserveAddress - The address of the reserve.
 * @param scsContracts - The addresses of the SCS contracts.
 */

export default class CreateConfigurationCommand extends WithSignerCommand {
    public readonly resolverAddress: string
    public readonly factoryAddress: string
    public readonly reserveAddress: string
    public readonly scsContracts: string[]

    private constructor({ resolverAddress, factoryAddress, reserveAddress, scsContracts, ...args }: ConstructorParams) {
        super(args)

        this.resolverAddress = resolverAddress
        this.factoryAddress = factoryAddress
        this.reserveAddress = reserveAddress
        this.scsContracts = scsContracts
    }

    public static async newInstance(args: CreateConfigurationCommandParams): Promise<CreateConfigurationCommand> {
        const { resolverAddress, factoryAddress, reserveAddress, scsContracts, ...signerArgs } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new CreateConfigurationCommand({
            resolverAddress,
            factoryAddress,
            reserveAddress,
            scsContracts,
            ...parentCommand,
        })
    }
}
