import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import {
  ADDRESS_ZERO,
  BusinessLogicRegistryData,
  delay,
  FacetConfiguration,
  GAS_LIMIT,
  ROLES
} from '@scripts'
import {
    BusinessLogicResolver,
    DiamondFacet,
    DiamondFacet__factory,
    DiamondLoupeFacet,
    DiamondLoupeFacet__factory,
    PausableFacet,
    PausableFacet__factory,
    RolesFacet,
    RolesFacet__factory,
    DiamondCutFacet,
    DiamondCutFacet__factory
} from '@contracts'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('➡️ ResolverProxy Tests', () => {
    const DIAMOND_RESOLVER_KEY = '0xec97912280645fb8759d3503d74d0034275fcd2435a3eebfb862e6dff89dccee'
    const DIAMOND_LOUPE_KEY = '0xaf1e22eff76611c014015c9e4feee3706f134b01bc698e2bc76dfc8332fae1c1'
    const NO_CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000011'
    const CONFIG_ID_2 = '0x0000000000000000000000000000000000000000000000000000000000000022'

    let resolver: BusinessLogicResolver
    let resolver_2: BusinessLogicResolver
    let diamondFacet: DiamondFacet
    let diamondCutFacet: DiamondCutFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let roleImpl: RolesFacet
    let pauseImpl: PausableFacet
    let signer_A: SignerWithAddress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let businessLogicsRegistryData: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let businessLogicsRegistryData_2: any

    let account_A: string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function assertObject(actual: any, expected: any, path = ''): void {
        Object.keys(expected).forEach((key) => {
            const actualValue = actual[key]
            const expectedValue = expected[key]

            if (typeof actualValue === 'object' && typeof expectedValue === 'object') {
                if (Array.isArray(actualValue) && Array.isArray(expectedValue)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    actualValue.forEach((item: any, index: number) => {
                        assertObject(item, expectedValue[index], key)
                    })
                } else {
                    assertObject(actualValue, expectedValue, key)
                }
            } else {
                const pathError = path === '' ? key : `${path}.${key}`
                expect(actualValue).to.equal(expectedValue, `Found error on ${pathError}`)
            }
        })
    }

    async function deployContracts() {
        resolver = await deployResolver()
        resolver_2 = await deployResolver()

        diamondFacet = await new DiamondFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.diamondFacet.deploy,
        })
        roleImpl = await new RolesFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
        pauseImpl = await new PausableFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
        businessLogicsRegistryData = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: await diamondFacet.getAddress(),
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: await roleImpl.getAddress(),
            },
        ]
        businessLogicsRegistryData_2 = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: await diamondFacet.getAddress(),
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: await roleImpl.getAddress(),
            },
            {
                businessLogicKey: await pauseImpl.getStaticResolverKey(),
                businessLogicAddress: await pauseImpl.getAddress(),
            },
        ]
        await setUpResolver(businessLogicsRegistryData, undefined, resolver)
        await setUpResolver(businessLogicsRegistryData, undefined, resolver_2)
        await setUpResolver(businessLogicsRegistryData, CONFIG_ID_2, resolver_2)
    }

    async function setUpResolver(
        businessLogicsRegistryData: BusinessLogicRegistryData[],
        configID?: string,
        resolverContract?: BusinessLogicResolver
    ) {
        if (!configID) configID = CONFIG_ID
        if (!resolverContract) resolverContract = resolver

        const facetIds = businessLogicsRegistryData.map((data) => `${data.businessLogicKey}`)

        const facetVersions = facetIds.map(() => 1)

        const facetConfigurations: FacetConfiguration[] = []
        facetIds.forEach((id, index) => facetConfigurations.push({ id, version: facetVersions[index] }))

        await resolverContract.registerBusinessLogics(businessLogicsRegistryData, {
            gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
        })

        await resolverContract.createConfiguration(configID, facetConfigurations, {
            gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
        })
    }

    async function deployResolver(): Promise<BusinessLogicResolver> {
        const newResolver = await (
            await ethers.getContractFactory('BusinessLogicResolver', signer_A)
        ).deploy({
            gasLimit: GAS_LIMIT.businessLogicResolver.deploy,
        })

        await newResolver.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })

        return newResolver
    }

    async function checkFacets(
        businessLogicsRegistryData: BusinessLogicRegistryData[],
        diamondLoupe: DiamondLoupeFacet
    ) {
        const expectedFacets = await Promise.all(
            businessLogicsRegistryData.map(async (data) => {
                const staticFunctionSelectors = await ethers.getContractAt(
                    'IStaticFunctionSelectors',
                    data.businessLogicAddress
                )
                return {
                    id: data.businessLogicKey,
                    addr: data.businessLogicAddress,
                    selectors: await staticFunctionSelectors.getStaticFunctionSelectors(),
                    interfaceIds: await staticFunctionSelectors.getStaticInterfaceIds(),
                }
            })
        )

        assertObject(await diamondLoupe.getFacets(), expectedFacets)

        const expectedFacetIds = expectedFacets.map((facet) => facet.id)
        const expectedFacetAddresses = expectedFacets.map((facet) => facet.addr)

        for (const facet of expectedFacets) {
            expect(await diamondLoupe.getFacetSelectors(facet.id)).to.deep.equal(facet.selectors)
            expect(await diamondLoupe.getFacetIdBySelector(facet.selectors[0])).to.deep.equal(facet.id)
            assertObject(await diamondLoupe.getFacet(facet.id), facet)
            expect(await diamondLoupe.getFacetAddress(facet.selectors[0])).to.deep.equal(facet.addr)
        }

        expect(await diamondLoupe.getFacetIds()).to.deep.equal(expectedFacetIds)
        expect(await diamondLoupe.getFacetAddresses()).to.deep.equal(expectedFacetAddresses)
    }

    before(async () => {
        // eslint-disable-next-line no-extra-semi, @typescript-eslint/no-extra-semi
        ;[signer_A] = await ethers.getSigners()
        account_A = signer_A.address

        await deployContracts()
    })

    it('GIVEN a diamond cut facet deployed WHEN getting the resolver key THEN the resolver key is obtained', async () => {
        diamondCutFacet = await new DiamondCutFacet__factory(signer_A).deploy()
        const diamondCut = await ethers.getContractAt('DiamondCutFacet', diamondCutFacet)

        expect(await diamondCut.getStaticResolverKey()).to.eq(DIAMOND_RESOLVER_KEY)
    })

    it('GIVEN a diamond cut facet deployed WHEN getting the function selectors THEN the function selectors are obtained', async () => {
        const diamondCut = await ethers.getContractAt('DiamondCutFacet', diamondCutFacet)

        expect(await diamondCut.getStaticFunctionSelectors()).to.deep.eq(
          ['0x002eeb22', '0x0b3bad61', '0xe5d3a872', '0x78a1bf05']
         )
    })

    it('GIVEN a diamond cut facet deployed WHEN getting the interfaces ids THEN the interfaces ids are obtained', async () => {
        const diamondCut = await ethers.getContractAt('DiamondCutFacet', diamondCutFacet)

        expect(await diamondCut.getStaticInterfaceIds()).to.deep.eq(['0x96675134'])
    })

    it('GIVEN a diamond loupe facet deployed WHEN getting the resolver key THEN the resolver key is obtained', async () => {
        diamondLoupeFacet = await new DiamondLoupeFacet__factory(signer_A).deploy()
        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', diamondLoupeFacet)

        expect(await diamondLoupe.getStaticResolverKey()).to.eq(DIAMOND_LOUPE_KEY)
    })

    it('GIVEN a diamond loupe facet deployed WHEN getting the function selectors THEN the function selectors are obtained', async () => {
        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', diamondLoupeFacet)

        expect(await diamondLoupe.getStaticFunctionSelectors()).to.deep.eq(
          ['0x662ea47d', '0x430720f9', '0xbf02c5b9', '0x8214de3e', '0xca1f70ec', '0x39a9e956',
           '0xcd25d535', '0x20202e6d', '0x3bed2f49', '0x9fea53e7', '0xb3fd6894', '0xe317d12f',
           '0x7a070c2d', '0x01ffc9a7']
        )
    })

    it('GIVEN a diamond loupe facet deployed WHEN getting the interfaces ids THEN the interfaces ids are obtained', async () => {
        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', diamondLoupeFacet)

        expect(await diamondLoupe.getStaticInterfaceIds()).to.deep.eq(['0x886634d9', '0x01ffc9a7'])
    })

    it('GIVEN deployed facets WHEN deploy a new resolverProxy with an address zero BLR THEN fails with ResolverAddressIsZero', async () => {
        const ResolverProxyFactory = await ethers.getContractFactory('ResolverProxy')
        await expect (ResolverProxyFactory.deploy(
          ADDRESS_ZERO, CONFIG_ID, 1, [],
          { gasLimit: GAS_LIMIT.resolverProxy.deploy }
        )).to.be.revertedWithCustomError(ResolverProxyFactory, 'ResolverAddressIsZero')
    })

    it('GIVEN deployed facets WHEN deploy a new resolverProxy with resolver proxy configuration id is 0 BLR THEN fails with ConfigurationIdIsZero', async () => {
        const ResolverProxyFactory = await ethers.getContractFactory('ResolverProxy')
        await expect (ResolverProxyFactory.deploy(
          await resolver.getAddress(), NO_CONFIG_ID, 1, [],
          { gasLimit: GAS_LIMIT.resolverProxy.deploy }
        )).to.be.revertedWithCustomError(ResolverProxyFactory, 'ConfigurationIdIsZero')
    })

    it('GIVEN a diamond loupe facet deployed WHEN calling to external get functions THEN properly information is obtained', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', resolverProxy)

        const facetAddress = await diamondLoupe.getFacetAddressesByPage(1, 1)

        expect (await diamondLoupe.getFacetsLength()).to.eq(2)
        expect (await diamondLoupe.getFacetsByPage(1, 1)).to.deep.eq(
            [[
              '0xd4408b4f5b6c8488e6b89c9cd1aba76ff1dd23cbd95a4b7c24737fc3700125ce',
              facetAddress[0],
              [
                '0x91d14854',
                '0x47c9b7cd',
                '0xb19737bf',
                '0x2f2ff15d',
                '0xd547741f',
                '0xce6ccfaf',
                '0x7e0b9df8'
              ],
              [ '0xce6ccfaf' ]
            ]]
        )
        expect (await diamondLoupe.getFacetSelectorsLength(
          '0xd4408b4f5b6c8488e6b89c9cd1aba76ff1dd23cbd95a4b7c24737fc3700125ce')
        ).to.eq(7)
        expect (await diamondLoupe.getFacetSelectorsByPage(
          '0xd4408b4f5b6c8488e6b89c9cd1aba76ff1dd23cbd95a4b7c24737fc3700125ce', 1, 1)
        ).to.deep.eq(['0x47c9b7cd'])
        expect (await diamondLoupe.getFacetIdsByPage(
          1, 1
        )).to.deep.eq(['0xd4408b4f5b6c8488e6b89c9cd1aba76ff1dd23cbd95a4b7c24737fc3700125ce'])
    })

    it('GIVEN deployed facets WHEN deploy a new resolverProxy with correct configuration THEN a new resolverProxy proxy was deployed', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        const result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(1)

        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', resolverProxy)

        await checkFacets(businessLogicsRegistryData, diamondLoupe)
    })

    it('GIVEN deployed facets WHEN deploying a resolverProxy and registering Facets to use a non exposed signature THEN raise FunctionNotFound and it is not recognized by supportsInterface', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const burnableFacet = await ethers.getContractAt('BurnableFacet', resolverProxy)
        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', resolverProxy)

        const BURN_SIGNATURE = '0x5cd3a608'
        await expect(burnableFacet.burn(10))
            .to.be.revertedWithCustomError(resolverProxy, 'FunctionNotFound')
            .withArgs(BURN_SIGNATURE)
        expect(await diamondLoupe.supportsInterface(BURN_SIGNATURE)).to.be.false
    })

    it('GIVEN deployed facets WHEN deploy a diamond to latestVersion and one to a specific version THEN only the latest version one will get updated', async () => {
        const resolverProxy_v1 = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const resolverProxy_latest = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 0, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondFacet_v1 = await ethers.getContractAt('DiamondFacet', resolverProxy_v1)

        const diamondFacet_latest = await ethers.getContractAt('DiamondFacet', resolverProxy_latest)

        await checkFacets(businessLogicsRegistryData, diamondFacet_v1)
        await checkFacets(businessLogicsRegistryData, diamondFacet_latest)

        await setUpResolver(businessLogicsRegistryData_2)

        await checkFacets(businessLogicsRegistryData, diamondFacet_v1)
        await checkFacets(businessLogicsRegistryData_2, diamondFacet_latest)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating version THEN fails with AccountHasNoRole', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        await expect(diamondCut.updateConfigVersion(0)).to.be.revertedWithCustomError(roleImpl, 'AccountHasNoRole')
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing version THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        diamondCut = diamondCut.connect(signer_A)

        await expect(
            diamondCut.updateConfigVersion(100, {
                gasLimit: GAS_LIMIT.diamondFacet.updateConfigVersion,
            })
        )
            .to.be.revertedWithCustomError(resolver, 'ResolverProxyConfigurationNoRegistered')
            .withArgs(CONFIG_ID, 100)
    })

    it('GIVEN resolverProxy and admin user WHEN updating version THEN succeeds', async () => {
        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, oldVersion, roles, {
            gasLimit: GAS_LIMIT.resolverProxy.deploy,
        })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateConfigVersion(newVersion)
        await delay({ time: 1, unit: 'sec' })
        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(newVersion)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating configID THEN fails with AccountHasNoRole', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.revertedWithCustomError(
            roleImpl,
            'AccountHasNoRole'
        )
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing configID THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        diamondCut = diamondCut.connect(signer_A)

        await expect(
            diamondCut.updateConfig(CONFIG_ID_2, 1, {
                gasLimit: GAS_LIMIT.diamondFacet.updateConfig,
            })
        )
            .to.be.revertedWithCustomError(resolver, 'ResolverProxyConfigurationNoRegistered')
            .withArgs(CONFIG_ID_2, 1)
    })

    it('GIVEN resolverProxy and admin user WHEN updating configID THEN succeeds', async () => {
        await setUpResolver(businessLogicsRegistryData_2, CONFIG_ID_2)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, oldVersion, roles, {
            gasLimit: GAS_LIMIT.resolverProxy.deploy,
        })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateConfig(CONFIG_ID_2, newVersion, { gasLimit: GAS_LIMIT.diamondFacet.updateConfig })
        await delay({ time: 1, unit: 'sec' })
        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID_2)
        expect(result.version_).to.equal(newVersion)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating resolver THEN fails with AccountHasNoRole', async () => {
        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        await expect(
            diamondCut.updateResolver(await resolver_2.getAddress(), CONFIG_ID_2, 1)
        ).to.be.revertedWithCustomError(roleImpl, 'AccountHasNoRole')
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing resolver THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        diamondCut = diamondCut.connect(signer_A)

        await expect(
            diamondCut.updateResolver(await resolver_2.getAddress(), CONFIG_ID_2, 2, {
                gasLimit: GAS_LIMIT.diamondFacet.updateResolver,
            })
        )
            .to.be.revertedWithCustomError(resolver, 'ResolverProxyConfigurationNoRegistered')
            .withArgs(CONFIG_ID_2, 2)
    })

    it('GIVEN resolverProxy and admin user WHEN updating resolver THEN succeeds', async () => {
        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(await resolver.getAddress(), CONFIG_ID, oldVersion, roles, {
            gasLimit: GAS_LIMIT.resolverProxy.deploy,
        })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateResolver(resolver_2, CONFIG_ID_2, newVersion, {
            gasLimit: GAS_LIMIT.diamondFacet.updateResolver,
        })
        await delay({ time: 1, unit: 'sec' })
        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(await resolver_2.getAddress())
        expect(result.configurationId_).to.equal(CONFIG_ID_2)
        expect(result.version_).to.equal(newVersion)
    })
})
