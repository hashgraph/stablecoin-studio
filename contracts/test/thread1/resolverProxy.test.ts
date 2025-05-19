import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BusinessLogicRegistryData, FacetConfiguration, GAS_LIMIT, ROLES, ValidateTxResponseCommand } from '@scripts'
import {
    BusinessLogicResolver,
    DiamondFacet,
    DiamondFacet__factory,
    DiamondLoupeFacet,
    PausableFacet,
    PausableFacet__factory,
    RolesFacet,
    RolesFacet__factory,
} from '@typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('➡️ ResolverProxy Tests', () => {
    const CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000011'
    const CONFIG_ID_2 = '0x0000000000000000000000000000000000000000000000000000000000000022'

    let resolver: BusinessLogicResolver
    let resolver_2: BusinessLogicResolver
    let diamondFacet: DiamondFacet
    let roleImpl: RolesFacet
    let pauseImpl: PausableFacet
    let signer_A: SignerWithAddress

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
        diamondFacet = await new DiamondFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.diamondFacet.deploy,
        })
        roleImpl = await new RolesFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
        pauseImpl = await new PausableFacet__factory(signer_A).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
    }

    async function setUpResolver(
        businessLogicsRegistryDatas: BusinessLogicRegistryData[],
        configID?: string,
        resolverContract?: BusinessLogicResolver
    ) {
        if (!configID) configID = CONFIG_ID
        if (!resolverContract) resolverContract = resolver

        const facetIds = businessLogicsRegistryDatas.map((data) => `${data.businessLogicKey}`)

        const facetVersions = facetIds.map(() => 1)

        const facetConfigurations: FacetConfiguration[] = []
        facetIds.forEach((id, index) => facetConfigurations.push({ id, version: facetVersions[index] }))

        await resolverContract.registerBusinessLogics(businessLogicsRegistryDatas)

        await resolverContract.createConfiguration(configID, facetConfigurations)
    }

    async function deployResolver(): Promise<BusinessLogicResolver> {
        let newResolver = await (
            await ethers.getContractFactory('BusinessLogicResolver')
        ).deploy({
            gasLimit: GAS_LIMIT.businessLogicResolver.deploy,
        })

        newResolver = newResolver.connect(signer_A)

        await newResolver.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })

        return newResolver
    }

    async function checkFacets(
        businessLogicsRegistryDatas: BusinessLogicRegistryData[],
        diamondLoupe: DiamondLoupeFacet
    ) {
        const expectedFacets = await Promise.all(
            businessLogicsRegistryDatas.map(async (data) => {
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

    beforeEach(async () => {
        // eslint-disable-next-line no-extra-semi
        ;[signer_A] = await ethers.getSigners()
        account_A = signer_A.address

        await deployContracts()
    })

    it('GIVEN deployed facets WHEN deploy a new resolverProxy with correct configuration THEN a new resolverProxy proxy was deployed', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]
        await setUpResolver(businessLogicsRegistryDatas)

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        const result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(1)

        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', resolverProxy.address)

        await checkFacets(businessLogicsRegistryDatas, diamondLoupe)
    })

    it('GIVEN deployed facets WHEN deploying a resolverProxy and registering Facets to use a non exposed signature THEN raise FunctionNotFound and it is not recognized by supportsInterface', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const rolesFacet = await ethers.getContractAt('RolesFacet', resolverProxy.address)
        const diamondLoupe = await ethers.getContractAt('DiamondLoupeFacet', resolverProxy.address)

        const GRANT_ROLE_SIGNATURE = '0x2f2ff15d'
        await expect(rolesFacet.grantRole(ROLES.defaultAdmin.hash, account_A))
            .to.be.revertedWithCustomError(resolverProxy, 'FunctionNotFound')
            .withArgs(GRANT_ROLE_SIGNATURE)
        expect(await diamondLoupe.supportsInterface(GRANT_ROLE_SIGNATURE)).to.be.false
    })

    it('GIVEN deployed facets WHEN deploy a diamond to latestVersion and one to a specific version THEN only the latest version one will get updated', async () => {
        const businessLogicsRegistryDatas_1 = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        const businessLogicsRegistryDatas_2 = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
            {
                businessLogicKey: await pauseImpl.getStaticResolverKey(),
                businessLogicAddress: pauseImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas_1)

        const resolverProxy_v1 = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const resolverProxy_latest = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 0, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondFacet_v1 = await ethers.getContractAt('DiamondFacet', resolverProxy_v1.address)

        const diamondFacet_latest = await ethers.getContractAt('DiamondFacet', resolverProxy_latest.address)

        await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1)
        await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_latest)

        await setUpResolver(businessLogicsRegistryDatas_2)

        await checkFacets(businessLogicsRegistryDatas_1, diamondFacet_v1)
        await checkFacets(businessLogicsRegistryDatas_2, diamondFacet_latest)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating version THEN fails with AccountHasNoRole', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        await expect(diamondCut.updateConfigVersion(0)).to.be.revertedWithCustomError(roleImpl, 'AccountHasNoRole')
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing version THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        diamondCut = diamondCut.connect(signer_A)

        const response = await diamondCut.updateConfigVersion(100, {
            gasLimit: GAS_LIMIT.diamondFacet.updateConfigVersion,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN resolverProxy and admin user WHEN updating version THEN succeeds', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, oldVersion, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateConfigVersion(newVersion)

        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(newVersion)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating configID THEN fails with AccountHasNoRole', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        await expect(diamondCut.updateConfig(CONFIG_ID_2, 1)).to.be.revertedWithCustomError(
            roleImpl,
            'AccountHasNoRole'
        )
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing configID THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        diamondCut = diamondCut.connect(signer_A)

        const response = await diamondCut.updateConfig(CONFIG_ID_2, 1, {
            gasLimit: GAS_LIMIT.diamondFacet.updateConfig,
        })

        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN resolverProxy and admin user WHEN updating configID THEN succeeds', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)
        await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, oldVersion, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateConfig(CONFIG_ID_2, newVersion, { gasLimit: GAS_LIMIT.diamondFacet.updateConfig })

        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID_2)
        expect(result.version_).to.equal(newVersion)
    })

    it('GIVEN resolverProxy and non-admin user WHEN updating resolver THEN fails with AccountHasNoRole', async () => {
        resolver_2 = await deployResolver()

        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, [], { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        const diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        await expect(diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, 1)).to.be.revertedWithCustomError(
            roleImpl,
            'AccountHasNoRole'
        )
    })

    it('GIVEN resolverProxy and admin user WHEN updating to non existing resolver THEN fails with ResolverProxyConfigurationNoRegistered', async () => {
        resolver_2 = await deployResolver()

        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, 1, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        diamondCut = diamondCut.connect(signer_A)

        const response = await diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, 1, {
            gasLimit: GAS_LIMIT.diamondFacet.updateResolver,
        })

        await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
    })

    it('GIVEN resolverProxy and admin user WHEN updating resolver THEN succeeds', async () => {
        resolver_2 = await deployResolver()

        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await roleImpl.getStaticResolverKey(),
                businessLogicAddress: roleImpl.address,
            },
        ]

        await setUpResolver(businessLogicsRegistryDatas)
        await setUpResolver(businessLogicsRegistryDatas, CONFIG_ID_2, resolver_2)

        const roles = [
            {
                role: ROLES.defaultAdmin.hash,
                account: account_A,
            },
        ]

        const oldVersion = 1

        const resolverProxy = await (
            await ethers.getContractFactory('ResolverProxy')
        ).deploy(resolver.address, CONFIG_ID, oldVersion, roles, { gasLimit: GAS_LIMIT.resolverProxy.deploy })

        let diamondCut = await ethers.getContractAt('DiamondCutFacet', resolverProxy.address)

        let result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver.address)
        expect(result.configurationId_).to.equal(CONFIG_ID)
        expect(result.version_).to.equal(oldVersion)

        diamondCut = diamondCut.connect(signer_A)

        const newVersion = 0

        await diamondCut.updateResolver(resolver_2.address, CONFIG_ID_2, newVersion, {
            gasLimit: GAS_LIMIT.diamondFacet.updateResolver,
        })

        result = await diamondCut.getConfigInfo()

        expect(result.resolver_).to.equal(resolver_2.address)
        expect(result.configurationId_).to.equal(CONFIG_ID_2)
        expect(result.version_).to.equal(newVersion)
    })
})
