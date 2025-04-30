import {
    IBusinessLogicResolver,
    IBusinessLogicResolver__factory,
    IDiamondCutManager__factory,
    IStaticFunctionSelectors__factory,
} from '@typechain'
import {
    CreateConfigurationsForDeployedContractsCommand,
    CreateConfigurationsForDeployedContractsResult,
    GAS_LIMIT,
    GetFacetsByConfigurationIdAndVersionQuery,
    GetFacetsByConfigurationIdAndVersionResult,
    MESSAGES,
    RegisterBusinessLogicsCommand,
    RegisterDeployedContractBusinessLogicsCommand,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { CONFIG_ID, EVENTS } from './constants'
import { Signer } from 'ethers'

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
    overrides,
}: GetFacetsByConfigurationIdAndVersionQuery): Promise<GetFacetsByConfigurationIdAndVersionResult> {
    const diamondCutManager = IDiamondCutManager__factory.connect(businessLogicResolverAddress, provider)
    const latestConfigVersionRaw = await diamondCutManager.getLatestVersionByConfiguration(configurationId, overrides)

    const lastestConfigVersion = parseInt(latestConfigVersionRaw.toHexString(), 16)

    console.log(`Number of Versions for Config ${configurationId}: ${lastestConfigVersion}`)

    const result = new GetFacetsByConfigurationIdAndVersionResult({
        facetListRecord: [],
    })
    for (let currentVersion = 1; currentVersion <= lastestConfigVersion; currentVersion++) {
        const facetListLengthRaw = await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(
            configurationId,
            currentVersion,
            overrides
        )
        const facetListLength = parseInt(facetListLengthRaw.toHexString(), 16)

        result.facetListRecord[currentVersion] = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
            configurationId,
            currentVersion,
            0,
            facetListLength,
            overrides
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
            errorMessage: MESSAGES.businessLogicResolver.error.registering,
        })
    )
}

function createFacetConfigurations(ids: string[], versions: number[]): FacetConfiguration[] {
    return ids.map((id, index) => ({ id, version: versions[index] }))
}

async function sendBatchConfiguration(
    configId: string,
    configurations: FacetConfiguration[],
    isFinalBatch: boolean,
    businessLogicResolverProxyAddress: string,
    signer: Signer
): Promise<void> {
    const txResponse = await IDiamondCutManager__factory.connect(
        businessLogicResolverProxyAddress,
        signer
    ).createBatchConfiguration(configId, configurations, isFinalBatch, {
        gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
    })

    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse,
            confirmationEvent: EVENTS.businessLogicResolver.configurationCreated,
            errorMessage: MESSAGES.businessLogicResolver.error.creatingConfigurations,
        })
    )
}

async function processFacetLists(
    configId: string,
    facetIdList: string[],
    facetVersionList: number[],
    businessLogicResolverProxyAddress: string,
    signer: Signer,
    partialBatchDeploy: boolean
): Promise<void> {
    if (facetIdList.length !== facetVersionList.length) {
        throw new Error('facetIdList and facetVersionList must have the same length')
    }
    const batchSize = Math.ceil(facetIdList.length / 2)

    for (let i = 0; i < facetIdList.length; i += batchSize) {
        const batchIds = facetIdList.slice(i, i + batchSize)
        const batchVersions = facetVersionList.slice(i, i + batchSize)
        const batch = createFacetConfigurations(batchIds, batchVersions)

        const isLastBatch = partialBatchDeploy ? false : i + batchSize >= facetIdList.length

        await sendBatchConfiguration(configId, batch, isLastBatch, businessLogicResolverProxyAddress, signer)
    }
}

export async function createConfigurationsForDeployedContracts(
    partialBatchDeploy: boolean,
    { contractAddressList, businessLogicResolverProxyAddress, signer }: CreateConfigurationsForDeployedContractsCommand
): Promise<CreateConfigurationsForDeployedContractsResult> {
    const result = CreateConfigurationsForDeployedContractsResult.empty()

    await fetchFacetResolverKeys(result, signer, contractAddressList)

    await processFacetLists(
        CONFIG_ID,
        result.commonFacetIdList,
        result.commonFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        partialBatchDeploy
    )
    return result
}

async function fetchFacetResolverKeys(
    result: CreateConfigurationsForDeployedContractsResult,
    signer: Signer,
    facetAddressList: string[]
): Promise<void> {
    const resolverKeyMap = new Map<string, string>()

    result.commonFacetIdList = await Promise.all(
        facetAddressList.map((address) => getResolverKey(address, signer, resolverKeyMap))
    )

    result.commonFacetVersionList = Array(result.commonFacetIdList.length).fill(1)
}

async function getResolverKey(address: string, signer: Signer, keyMap: Map<string, string>): Promise<string> {
    if (!keyMap.has(address)) {
        const key = await IStaticFunctionSelectors__factory.connect(address, signer).getStaticResolverKey()
        keyMap.set(address, key)
    }
    return keyMap.get(address)!
}
