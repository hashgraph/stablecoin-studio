import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    CONFIG_ID,
    DEFAULT_CONFIG_VERSION,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    GAS_LIMIT,
    MESSAGES,
    ValidateTxResponseCommand,
} from '@scripts'
import {
    BusinessLogicResolver,
    DiamondCutManager,
    DiamondCutManager__factory,
    IDiamondCutManager,
    IDiamondLoupe,
} from '@typechain-types'

describe('➡️ DiamondCutManager Tests', () => {
    const configId = '0x0000000000000000000000000000000000000000000000000000000000000000'

    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    let businessLogicResolver: BusinessLogicResolver
    let diamondCutManager: DiamondCutManager
    let stableCoinFacetIdList: string[] = []
    let stableCoinFactoryFacetIdList: string[] = []
    let reserveFacetIdList: string[] = []
    let stableCoinFacetVersionList: number[] = []

    before(async () => {
        // mute | mock console.log
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        console.log = () => {}
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        // eslint-disable-next-line no-extra-semi
        ;[operator, nonOperator] = await ethers.getSigners()

        const { facetLists, ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
            })
        )

        businessLogicResolver = deployedContracts.businessLogicResolver.contract
        diamondCutManager = DiamondCutManager__factory.connect(businessLogicResolver.address, operator)
        ;({ stableCoinFactoryFacetIdList, stableCoinFacetIdList, reserveFacetIdList, stableCoinFacetVersionList } =
            facetLists)
    })

    async function validateConfiguration(configId: string) {
        for (let configVersion = 1; configVersion <= 1; configVersion++) {
            await validateFacets(configId, configVersion)
        }
    }

    async function validateFacets(configId: string, configVersion: number) {
        const facetsLength = (
            await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(configId, configVersion)
        ).toNumber()
        const facets = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
            configId,
            configVersion,
            0,
            facetsLength
        )

        const facetIds: string[] = []
        const facetAddresses: string[] = []

        for (const facet of facets) {
            facetIds.push(facet.id)
            facetAddresses.push(facet.addr)
            await validateFacetDetails(configId, configVersion, facet)
        }

        await validateFacetIdsAndAddresses(configId, configVersion, facetsLength, facetIds, facetAddresses)
    }

    async function validateFacetDetails(
        configId: string,
        configVersion: number,
        facet: IDiamondLoupe.FacetStructOutput
    ) {
        const selectorsLength = (
            await diamondCutManager.getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
                configId,
                configVersion,
                facet.id
            )
        ).toNumber()

        const selectors = await diamondCutManager.getFacetSelectorsByConfigurationIdVersionAndFacetId(
            configId,
            configVersion,
            facet.id,
            0,
            selectorsLength
        )

        const address = await diamondCutManager.getFacetAddressByConfigurationIdVersionAndFacetId(
            configId,
            configVersion,
            facet.id
        )

        const facet_2 = await diamondCutManager.getFacetByConfigurationIdVersionAndFacetId(
            configId,
            configVersion,
            facet.id
        )

        expect(facet.addr).to.exist
        expect(facet.addr).to.not.be.empty
        expect(facet.addr).to.equal(address)
        expect(facet.addr).to.not.equal('0x0000000000000000000000000000000000000000')
        expect(facet.selectors).to.exist
        expect(facet.selectors).to.not.be.empty
        expect(facet.selectors).to.have.members(selectors)

        expect(facet.interfaceIds).to.exist
        expect(facet.interfaceIds).to.not.be.empty
        expect(facet).to.deep.equal(facet_2)

        await validateSelectors(configId, configVersion, facet, selectorsLength)
        await validateInterfaces(configId, configVersion, facet)
    }

    async function validateSelectors(
        configId: string,
        configVersion: number,
        facet: IDiamondLoupe.FacetStructOutput,
        selectorsLength: number
    ) {
        for (let selectorIndex = 0; selectorIndex < selectorsLength; selectorIndex++) {
            const selectorId = facet.selectors[selectorIndex]

            const id = await diamondCutManager.getFacetIdByConfigurationIdVersionAndSelector(
                configId,
                configVersion,
                selectorId
            )

            const facetAddressForSelector = await diamondCutManager.resolveResolverProxyCall(
                configId,
                configVersion,
                selectorId
            )

            expect(facetAddressForSelector).to.equal(facet.addr)
            expect(id).to.equal(facet.id)
        }
    }

    async function validateInterfaces(configId: string, configVersion: number, facet: IDiamondLoupe.FacetStructOutput) {
        for (const interfaceId of facet.interfaceIds) {
            const interfaceExists = await diamondCutManager.resolveSupportsInterface(
                configId,
                configVersion,
                interfaceId
            )
            expect(interfaceExists).to.be.true
        }
    }

    async function validateFacetIdsAndAddresses(
        configId: string,
        configVersion: number,
        facetsLength: number,
        facetIds: string[],
        facetAddresses: string[]
    ) {
        const facetIds_2 = await diamondCutManager.getFacetIdsByConfigurationIdAndVersion(
            configId,
            configVersion,
            0,
            facetsLength
        )

        const facetAddresses_2 = await diamondCutManager.getFacetAddressesByConfigurationIdAndVersion(
            configId,
            configVersion,
            0,
            facetsLength
        )

        expect(facetIds).to.have.members(facetIds_2)
        expect(facetAddresses).to.have.members(facetAddresses_2)

        const facetIdMap = {
            [CONFIG_ID.stableCoin]: stableCoinFacetIdList,
            [CONFIG_ID.reserve]: reserveFacetIdList,
            [CONFIG_ID.stableCoinFactory]: stableCoinFactoryFacetIdList,
        }

        const expectedFacetIdList = facetIdMap[configId] || null

        if (!expectedFacetIdList) {
            expect.fail('Unknown configId')
        }

        expect(facetsLength).to.equal(expectedFacetIdList.length)
        expect(facetIds).to.have.members(expectedFacetIdList)
    }

    it('GIVEN a resolver WHEN reading configuration information THEN everything matches', async () => {
        const configLength = (await diamondCutManager.getConfigurationsLength()).toNumber()
        expect(configLength).to.equal(3)

        const configIds = await diamondCutManager.getConfigurations(0, configLength)
        expect(configIds).to.have.members([CONFIG_ID.stableCoin, CONFIG_ID.reserve, CONFIG_ID.stableCoinFactory])

        for (const configId of configIds) {
            const configLatestVersion = (await diamondCutManager.getLatestVersionByConfiguration(configId)).toNumber()
            expect(configLatestVersion).to.equal(1)

            await validateConfiguration(configId)
        }
    })

    it('GIVEN a resolver WHEN resolving calls THEN success', async () => {
        const facets = await diamondCutManager.getFacetsByConfigurationIdAndVersion(
            CONFIG_ID.stableCoin,
            DEFAULT_CONFIG_VERSION,
            0,
            stableCoinFacetIdList.length
        )

        expect(facets.length).to.be.greaterThan(0)

        const configVersionDoesNotExist = await diamondCutManager.isResolverProxyConfigurationRegistered(
            CONFIG_ID.stableCoin,
            2
        )
        expect(configVersionDoesNotExist).to.be.false
        await expect(
            diamondCutManager.checkResolverProxyConfigurationRegistered(CONFIG_ID.stableCoin, 2)
        ).to.be.rejectedWith('ResolverProxyConfigurationNoRegistered')

        const configDoesNotExist = await diamondCutManager.isResolverProxyConfigurationRegistered(
            configId,
            DEFAULT_CONFIG_VERSION
        )
        expect(configDoesNotExist).to.equal(false)
        await expect(
            diamondCutManager.checkResolverProxyConfigurationRegistered(configId, DEFAULT_CONFIG_VERSION)
        ).to.be.rejectedWith('ResolverProxyConfigurationNoRegistered')

        const noFacetAddress = await diamondCutManager.resolveResolverProxyCall(
            CONFIG_ID.stableCoin,
            DEFAULT_CONFIG_VERSION,
            '0x00000001'
        )
        expect(noFacetAddress).to.equal('0x0000000000000000000000000000000000000000')

        const interfaceDoesnotExist = await diamondCutManager.resolveSupportsInterface(
            CONFIG_ID.stableCoin,
            DEFAULT_CONFIG_VERSION,
            '0x00000001'
        )
        expect(interfaceDoesnotExist).to.equal(false)
    })

    it('GIVEN a resolver WHEN adding a new configuration with configId at 0 THEN fails with DefaultValueForConfigurationIdNotPermitted', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        stableCoinFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: stableCoinFacetVersionList[index],
            })
        )

        const response = await diamondCutManager.createConfiguration(configId, facetConfigurations, {
            gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver and a non admin user WHEN adding a new configuration THEN fails with AccountHasNoRole', async () => {
        diamondCutManager = diamondCutManager.connect(nonOperator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        stableCoinFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: stableCoinFacetVersionList[index],
            })
        )
        const response = await diamondCutManager.createConfiguration(CONFIG_ID.stableCoin, facetConfigurations, {
            gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver WHEN adding a new configuration with a non registered facet THEN fails with FacetIdNotRegistered', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
            {
                id: configId,
                version: DEFAULT_CONFIG_VERSION,
            },
        ]
        const response = await diamondCutManager.createConfiguration(CONFIG_ID.stableCoin, facetConfigurations, {
            gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver WHEN adding a new configuration with a duplicated facet THEN fails with DuplicatedFacetInConfiguration', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        // Add a duplicated facet
        const facetsIds = [...stableCoinFacetIdList, stableCoinFacetIdList[0]]
        // Add a duplicated version
        const facetVersions = [...stableCoinFacetVersionList, stableCoinFacetVersionList[0]]

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        facetsIds.forEach((id, index) => {
            facetConfigurations.push({
                id,
                version: facetVersions[index],
            })
        })
        const response = await diamondCutManager.createConfiguration(CONFIG_ID.stableCoin, facetConfigurations, {
            gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a batch deploying WHEN run cancelBatchConfiguration THEN all the related information is removed', async () => {
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        const { ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                partialBatchDeploy: true,
            })
        )

        businessLogicResolver = deployedContracts.businessLogicResolver.contract
        diamondCutManager = DiamondCutManager__factory.connect(businessLogicResolver.address, operator)

        const configLength = (await diamondCutManager.getConfigurationsLength()).toNumber()
        expect(configLength).to.equal(1)

        const configIds = await diamondCutManager.getConfigurations(0, configLength)
        expect(configIds).to.have.members([CONFIG_ID.stableCoinFactory])

        for (const configId of [CONFIG_ID.stableCoin, CONFIG_ID.reserve]) {
            const configLatestVersion = (await diamondCutManager.getLatestVersionByConfiguration(configId)).toNumber()
            expect(configLatestVersion).to.equal(0)
            await validateConfiguration(configId)

            // Run cancelBatchConfiguration
            await diamondCutManager.cancelBatchConfiguration(configId)
            expect(
                await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(configId, DEFAULT_CONFIG_VERSION)
            ).to.equal(0)
        }
        expect(await diamondCutManager.getConfigurationsLength()).to.equal(1)
    })

    it('GIVEN a resolver WHEN adding a new configuration with configId at 0 with createBatchConfiguration THEN fails with DefaultValueForConfigurationIdNotPermitted', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        stableCoinFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: stableCoinFacetVersionList[index],
            })
        )

        const response = await diamondCutManager.createBatchConfiguration(configId, facetConfigurations, false, {
            gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver and a non admin user WHEN adding a new configuration with createBatchConfiguration THEN fails with AccountHasNoRole', async () => {
        diamondCutManager = diamondCutManager.connect(nonOperator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        stableCoinFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: stableCoinFacetVersionList[index],
            })
        )

        const response = await diamondCutManager.createBatchConfiguration(
            CONFIG_ID.stableCoin,
            facetConfigurations,
            false,
            {
                gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
            }
        )
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver WHEN adding a new configuration with a non registered facet using createBatchConfiguration THEN fails with FacetIdNotRegistered', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = [
            {
                id: configId,
                version: DEFAULT_CONFIG_VERSION,
            },
        ]

        const response = await diamondCutManager.createBatchConfiguration(
            CONFIG_ID.stableCoin,
            facetConfigurations,
            false,
            {
                gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
            }
        )
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN a resolver WHEN adding a new configuration with a duplicated facet using createBatchConfiguration THEN fails with DuplicatedFacetInConfiguration', async () => {
        diamondCutManager = diamondCutManager.connect(operator)

        // Add a duplicated facet
        const facetsIds = [...stableCoinFacetIdList, stableCoinFacetIdList[0]]
        // Add a duplicated version
        const facetVersions = [...stableCoinFacetVersionList, stableCoinFacetVersionList[0]]

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        facetsIds.forEach((id, index) => {
            facetConfigurations.push({
                id,
                version: facetVersions[index],
            })
        })
        const response = await diamondCutManager.createBatchConfiguration(
            CONFIG_ID.stableCoin,
            facetConfigurations,
            false,
            {
                gasLimit: GAS_LIMIT.diamondCutManager.createConfiguration,
            }
        )
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })
    it('GIVEN a resolver WHEN a selector is blacklisted THEN transaction fails with SelectorBlacklisted', async () => {
        const blackListedSelectors = ['0x8456cb59'] // pause() selector

        await businessLogicResolver.addSelectorsToBlacklist(CONFIG_ID.stableCoin, blackListedSelectors)

        diamondCutManager = diamondCutManager.connect(operator)
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] = []
        stableCoinFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: stableCoinFacetIdList[index],
            })
        )

        await expect(diamondCutManager.createConfiguration(CONFIG_ID.stableCoin, facetConfigurations))
            .to.be.revertedWithCustomError(diamondCutManager, 'SelectorBlacklisted')
            .withArgs(blackListedSelectors[0])
    })
})
