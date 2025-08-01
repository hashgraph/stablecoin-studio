import { IDiamondCutManager__factory, IStaticFunctionSelectors__factory } from '@contracts'
import {
    CreateConfigurationsForDeployedContractsCommand,
    CreateConfigurationsForDeployedContractsResult,
    GAS_LIMIT,
    MESSAGES,
    validateTxResponse,
    ValidateTxResponseCommand,
    FacetConfiguration,
} from '@scripts'
import { CONFIG_ID, EVENTS } from './constants'
import { Signer } from 'ethers'

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
            errorMessage: MESSAGES.businessLogicResolver.error.createConfigurations,
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
    {
        stableCoinFactoryAddressList,
        stableCoinAddressList,
        reserveAddressList,
        businessLogicResolverProxyAddress,
        signer,
    }: CreateConfigurationsForDeployedContractsCommand
): Promise<CreateConfigurationsForDeployedContractsResult> {
    const result = CreateConfigurationsForDeployedContractsResult.empty()

    await fetchFacetResolverKeys(
        result,
        signer,
        stableCoinFactoryAddressList,
        stableCoinAddressList,
        reserveAddressList
    )

    // * StableCoinFactory
    await processFacetLists(
        CONFIG_ID.stableCoinFactory,
        result.stableCoinFactoryFacetIdList,
        result.stableCoinFactoryFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        false
    )
    // * StableCoin
    await processFacetLists(
        CONFIG_ID.stableCoin,
        result.stableCoinFacetIdList,
        result.stableCoinFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        partialBatchDeploy
    )
    // * Reserve
    await processFacetLists(
        CONFIG_ID.reserve,
        result.reserveFacetIdList,
        result.reserveFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        partialBatchDeploy
    )
    return result
}

async function fetchFacetResolverKeys(
    result: CreateConfigurationsForDeployedContractsResult,
    signer: Signer,
    stableCoinFactoryAddressList: string[],
    stableCoinAddressList: string[],
    reserveAddressList: string[]
): Promise<void> {
    const resolverKeyMap = new Map<string, string>()

    result.stableCoinFactoryFacetIdList = await Promise.all(
        stableCoinFactoryAddressList.map((address) => getResolverKey(address, signer, resolverKeyMap))
    )
    result.stableCoinFacetIdList = await Promise.all(
        stableCoinAddressList.map((address) => getResolverKey(address, signer, resolverKeyMap))
    )
    result.reserveFacetIdList = await Promise.all(
        reserveAddressList.map((address) => getResolverKey(address, signer, resolverKeyMap))
    )

    result.stableCoinFactoryFacetVersionList = Array(result.stableCoinFactoryFacetIdList.length).fill(1)
    result.stableCoinFacetVersionList = Array(result.stableCoinFacetIdList.length).fill(1)
    result.reserveFacetVersionList = Array(result.reserveFacetIdList.length).fill(1)
}

async function getResolverKey(address: string, signer: Signer, keyMap: Map<string, string>): Promise<string> {
    if (!keyMap.has(address)) {
        const key = await IStaticFunctionSelectors__factory.connect(address, signer).getStaticResolverKey()
        keyMap.set(address, key)
    }
    return keyMap.get(address)!
}
