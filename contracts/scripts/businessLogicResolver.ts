import {
    IBusinessLogicResolver,
    IBusinessLogicResolver__factory,
    IDiamondCutManager__factory,
    IStaticFunctionSelectors__factory,
} from '@typechain-types'
import {
    EVENTS,
    GAS_LIMIT,
    GetFacetsByConfigurationIdAndVersionQuery,
    GetFacetsByConfigurationIdAndVersionResult,
    MESSAGES,
    RegisterBusinessLogicsCommand,
    RegisterDeployedContractBusinessLogicsCommand,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'

export interface BusinessLogicRegistryData {
    businessLogicKey: string
    businessLogicAddress: string
}

export interface FacetConfiguration {
    id: string
    version: number
}

export let businessLogicResolver: IBusinessLogicResolver

export async function getFacetsByConfigurationIdAndVersion({
    businessLogicResolverAddress,
    configurationId,
    provider,
}: GetFacetsByConfigurationIdAndVersionQuery): Promise<GetFacetsByConfigurationIdAndVersionResult> {
    const diamondCutManager = IDiamondCutManager__factory.connect(businessLogicResolverAddress, provider)
    const latestConfigVersionRaw = await diamondCutManager.getLatestVersionByConfiguration(configurationId)

    const lastestConfigVersion = parseInt(latestConfigVersionRaw.toHexString(), 16)

    console.log(`Number of Versions for Config ${configurationId}: ${lastestConfigVersion}`)

    const result = new GetFacetsByConfigurationIdAndVersionResult({
        facetListRecord: [],
    })
    for (let currentVersion = 1; currentVersion <= lastestConfigVersion; currentVersion++) {
        const facetListLengthRaw = await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(
            configurationId,
            currentVersion
        )
        const facetListLength = parseInt(facetListLengthRaw.toHexString(), 16)

        result.facetListRecord[currentVersion] = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
            configurationId,
            currentVersion,
            0,
            facetListLength
        )
    }
    return result
}

export async function registerDeployedContractBusinessLogics({
    deployedContractAddressList,
    businessLogicResolverProxyAddress,
    signer,
    overrides,
}: RegisterDeployedContractBusinessLogicsCommand) {
    const registerBusinessLogicsCommand = new RegisterBusinessLogicsCommand({
        contractAddressList: deployedContractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    })
    await registerBusinessLogics(registerBusinessLogicsCommand)
}

/**
 * Registers business logic contracts with a resolver.
 *
 * This function performs the following steps:
 * 1. Gets business logic keys from each contract in the provided address list
 * 2. Creates registry data objects containing keys and addresses
 * 3. Registers the business logics with the resolver contract
 * 4. Validates the transaction response
 *
 * @param deployedContractAddressList - Object containing addresses of deployed contracts to register
 * @param businessLogicResolver - Address of the business logic resolver contract
 * @param signer - Ethereum signer to execute transactions
 *
 * @throws Will throw an error if registration transaction fails validation
 *
 * @remarks
 * Each contract in the address list must implement the IStaticFunctionSelectors interface
 */
export async function registerBusinessLogics({
    contractAddressListToRegister,
    businessLogicResolverProxyAddress,
    signer,
    overrides,
}: RegisterBusinessLogicsCommand): Promise<void> {
    const businessLogicRegistries: BusinessLogicRegistryData[] = await Promise.all(
        Object.values(contractAddressListToRegister).map(async (address) => {
            const proxiedContract = IStaticFunctionSelectors__factory.connect(address, signer)
            const businessLogicKey = await proxiedContract.getStaticResolverKey()

            return {
                businessLogicKey,
                businessLogicAddress: address.replace('0x', ''),
            }
        })
    )

    const resolverContract = IBusinessLogicResolver__factory.connect(businessLogicResolverProxyAddress, signer)
    const response = await resolverContract.registerBusinessLogics(businessLogicRegistries, {
        gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
        ...overrides,
    })
    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: response,
            confirmationEvent: EVENTS.businessLogicResolver.registered,
            errorMessage: MESSAGES.businessLogicResolver.error.register,
        })
    )
}
