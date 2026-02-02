import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { BusinessLogicResolver } from '@contracts'
import { ADDRESS_ZERO, CONFIG_ID, ROLES, decodeEvent, delay, GAS_LIMIT } from '@scripts'

describe('➡️ BusinessLogicResolver Tests', () => {
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    let businessLogicResolver: BusinessLogicResolver

    enum VersionStatus {
        NONE = 0,
        ACTIVATED = 1,
        DEACTIVATED = 2,
    }

    const BUSINESS_LOGIC_KEYS = [
        {
            businessLogicKey: '0xc09e617fd889212115dfeb9cc200796d756bdf992e7402dfa183ec179329e774',
            businessLogicAddress: '0x7773334dc2Db6F14aAF0C1D17c1B3F1769Cf31b9',
        },
        {
            businessLogicKey: '0x67cad3aaf0e0886c201f150fada758afb90ba6fb1d000459d64ea7625c4d31a5',
            businessLogicAddress: '0x7e6bf6542E1471206E0209330f091755ce5da81c',
        },
        {
            businessLogicKey: '0x474674736567e4f596b05ac260f4b8fe268139ecc92dcf67e0248e729235be5e',
            businessLogicAddress: '0x50CA271780151A9Da8895d7629f932A3f8897EFc',
        },
        {
            businessLogicKey: '0x2a271dec87b7552f37d532385985700dca633511feb45860d02d80937f63f1b9',
            businessLogicAddress: '0xE6F13EF90Acfa7CCad117328C1828449e7f5fe2B',
        },
    ]

    async function deployBusinessLogicResolverFixture() {
        businessLogicResolver = await (
            await ethers.getContractFactory('BusinessLogicResolver')
        ).deploy({
            gasLimit: GAS_LIMIT.businessLogicResolver.deploy,
        })

        businessLogicResolver = businessLogicResolver.connect(operator)

        await businessLogicResolver.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })
    }

    beforeEach(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        // eslint-disable-next-line no-extra-semi
        ;[operator, nonOperator] = await ethers.getSigners()
        await deployBusinessLogicResolverFixture()
    })

    it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
        await expect(
            businessLogicResolver.initialize_BusinessLogicResolver({
                gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
            })
        ).to.be.revertedWithCustomError(businessLogicResolver, 'ContractIsAlreadyInitialized')
    })

    describe('AccessControl', () => {
        it('GIVEN an account without admin role WHEN registrying logics THEN transaction fails with AccountHasNoRole', async () => {
            // Using nonOperator (non role)
            businessLogicResolver = businessLogicResolver.connect(nonOperator)

            await expect(
                businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2), {
                    gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
                })
            )
                .to.be.revertedWithCustomError(businessLogicResolver, 'AccountHasNoRole')
                .withArgs(nonOperator, ROLES.defaultAdmin.hash)
        })
    })

    describe('Business Logic Resolver functionality', () => {
        it('GIVEN an empty registry WHEN getting data THEN responds empty values or BusinessLogicVersionDoesNotExist', async () => {
            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(0)
            await expect(
                businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 0)
            ).to.be.revertedWithCustomError(businessLogicResolver, 'BusinessLogicVersionDoesNotExist')
            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[1].businessLogicKey)).is.equal(0)
            await expect(
                businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[1].businessLogicKey, 0)
            ).to.be.revertedWithCustomError(businessLogicResolver, 'BusinessLogicVersionDoesNotExist')
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)
            ).is.equal(ADDRESS_ZERO)
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 0)
            ).to.be.revertedWithCustomError(businessLogicResolver, 'BusinessLogicVersionDoesNotExist')
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 1)
            ).to.be.revertedWithCustomError(businessLogicResolver, 'BusinessLogicVersionDoesNotExist')
            expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(0)
            expect(await businessLogicResolver.getBusinessLogicKeys(1, 10)).is.deep.equal([])
        })

        it('GIVEN an empty key WHEN registerBusinessLogics THEN Fails with ZeroKeyNotValidForBusinessLogic', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [
                {
                    businessLogicKey: ethers.ZeroHash,
                    businessLogicAddress: '0x7773334dc2Db6F14aAF0C1D17c1B3F1769Cf31b9',
                },
            ]

            await expect(
                businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                    gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
                })
            ).to.be.revertedWithCustomError(businessLogicResolver, 'ZeroKeyNotValidForBusinessLogic')
        })

        it('GIVEN an duplicated key WHEN registerBusinessLogics THEN Fails with BusinessLogicKeyDuplicated', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [BUSINESS_LOGIC_KEYS[0], BUSINESS_LOGIC_KEYS[0]]

            await expect(
                businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                    gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
                })
            ).to.be.revertedWithCustomError(businessLogicResolver, 'BusinessLogicKeyDuplicated')
        })

        it('GIVEN a list of logics WHEN registerBusinessLogics THEN Fails if some key is not informed with AllBusinessLogicKeysMustBeenInformed', async () => {
            await businessLogicResolver.registerBusinessLogics([BUSINESS_LOGIC_KEYS[0]])

            await expect(
                businessLogicResolver.registerBusinessLogics([BUSINESS_LOGIC_KEYS[1]], {
                    gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
                })
            ).to.be.revertedWithCustomError(businessLogicResolver, 'AllBusinessLogicKeysMustBeenInformed')
        })

        it('GIVEN an empty registry WHEN registerBusinessLogics THEN queries responds with correct values', async () => {
            const LATEST_VERSION = 1
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 2)
            const tx = await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })
            const receipt = await tx.wait()
            const event = await decodeEvent(businessLogicResolver, 'BusinessLogicsRegistered', receipt)
            console.log(event)

            const businessLogicsEventNormalized = event.businessLogics.map((businessLogic) => {
                return {
                    businessLogicKey: businessLogic.businessLogicKey,
                    businessLogicAddress: businessLogic.businessLogicAddress,
                }
            })
            expect(businessLogicsEventNormalized).to.deep.equal(BUSINESS_LOGICS_TO_REGISTER)
            expect(event.newLatestVersion[0].toString()).to.be.equal(LATEST_VERSION.toString())
            expect(event.newLatestVersion[1].toString()).to.be.equal(LATEST_VERSION.toString())

            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(
                LATEST_VERSION
            )
            expect(
                await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[0].businessLogicKey, LATEST_VERSION)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[1].businessLogicKey)).is.equal(
                LATEST_VERSION
            )
            expect(
                await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[1].businessLogicKey, LATEST_VERSION)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)
            ).is.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[1].businessLogicKey)
            ).is.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length)
            expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
                BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey)
            )
        })

        it('GIVEN an registry with 1 version WHEN registerBusinessLogics with different keys THEN queries responds with correct values', async () => {
            await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2), {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })

            const LATEST_VERSION_2 = 2
            const LATEST_VERSION_1 = 1
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 3)
            const tx = await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER)
            await delay({ time: 1, unit: 'sec' })
            const event = await decodeEvent(businessLogicResolver, 'BusinessLogicsRegistered', await tx.wait())
            const businessLogicsEventNormalized = event.businessLogics.map((businessLogic) => {
                return {
                    businessLogicKey: businessLogic.businessLogicKey,
                    businessLogicAddress: businessLogic.businessLogicAddress,
                }
            })
            expect(businessLogicsEventNormalized).to.deep.equal(BUSINESS_LOGICS_TO_REGISTER)
            expect(event.newLatestVersion[0]).to.be.equal(LATEST_VERSION_2)
            expect(event.newLatestVersion[1]).to.be.equal(LATEST_VERSION_2)
            expect(event.newLatestVersion[2]).to.be.equal(LATEST_VERSION_1)

            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(
                LATEST_VERSION_2
            )
            expect(
                await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[0].businessLogicKey, LATEST_VERSION_2)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[1].businessLogicKey)).is.equal(
                LATEST_VERSION_2
            )
            expect(
                await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[1].businessLogicKey, LATEST_VERSION_2)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[2].businessLogicKey)).is.equal(
                LATEST_VERSION_1
            )
            expect(
                await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[2].businessLogicKey, LATEST_VERSION_1)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)
            ).is.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[1].businessLogicKey)
            ).is.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[2].businessLogicKey)
            ).is.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    LATEST_VERSION_2
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey,
                    LATEST_VERSION_2
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[2].businessLogicKey,
                    LATEST_VERSION_1
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress)
            expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length)
            expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
                BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey)
            )
        })
        it('GIVEN a configuration add a selector to the blacklist THEN queries respond with correct values', async () => {
            const blackListedSelectors = ['0x8456cb59'] // pause() selector

            await businessLogicResolver.addSelectorsToBlacklist(CONFIG_ID.stableCoin, blackListedSelectors)
            await delay({ time: 1, unit: 'sec' })

            expect(
                Array.from(await businessLogicResolver.getSelectorsBlacklist(CONFIG_ID.stableCoin, 0, 100))
            ).to.deep.equal(blackListedSelectors)

            await businessLogicResolver.removeSelectorsFromBlacklist(CONFIG_ID.stableCoin, blackListedSelectors)
            await delay({ time: 1, unit: 'sec' })
            expect(
                Array.from(await businessLogicResolver.getSelectorsBlacklist(CONFIG_ID.stableCoin, 0, 100))
            ).to.deep.equal([])
        })
    })
})
