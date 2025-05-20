import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { BusinessLogicResolver } from '@typechain-types'
import { GAS_LIMIT, ValidateTxResponseCommand } from '@scripts'

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
        const initResponse = await businessLogicResolver.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: initResponse }).execute()).to.be.rejectedWith(Error)
    })

    describe('AccessControl', () => {
        it('GIVEN an account without admin role WHEN registrying logics THEN transaction fails with AccountHasNoRole', async () => {
            // Using nonOperator (non role)
            businessLogicResolver = businessLogicResolver.connect(nonOperator)

            const initResponse = await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2), {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })
            await expect(new ValidateTxResponseCommand({ txResponse: initResponse }).execute()).to.be.rejectedWith(
                Error
            )
        })
    })

    describe('Business Logic Resolver functionality', () => {
        it('GIVEN an empty registry WHEN getting data THEN responds empty values or BusinessLogicVersionDoesNotExist', async () => {
            expect(await businessLogicResolver.getLatestVersion()).is.equal(0)
            await expect(businessLogicResolver.getVersionStatus(0)).to.be.rejectedWith(
                'BusinessLogicVersionDoesNotExist'
            )
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)
            ).is.equal(ethers.constants.AddressZero)
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 0)
            ).to.be.rejectedWith('BusinessLogicVersionDoesNotExist')
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 1)
            ).to.be.rejectedWith('BusinessLogicVersionDoesNotExist')
            expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(0)
            expect(await businessLogicResolver.getBusinessLogicKeys(1, 10)).is.deep.equal([])
        })

        it('GIVEN an empty key WHEN registerBusinessLogics THEN Fails with ZeroKeyNotValidForBusinessLogic', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [
                {
                    businessLogicKey: ethers.constants.HashZero,
                    businessLogicAddress: '0x7773334dc2Db6F14aAF0C1D17c1B3F1769Cf31b9',
                },
            ]

            const response = await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })
            await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
        })

        it('GIVEN an duplicated key WHEN registerBusinessLogics THEN Fails with BusinessLogicKeyDuplicated', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [BUSINESS_LOGIC_KEYS[0], BUSINESS_LOGIC_KEYS[0]]

            const response = await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })
            await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
        })

        it('GIVEN a list of logics WHEN registerBusinessLogics THEN Fails if some key is not informed with AllBusinessLogicKeysMustBeenInformed', async () => {
            await businessLogicResolver.registerBusinessLogics([BUSINESS_LOGIC_KEYS[0]])

            const response = await businessLogicResolver.registerBusinessLogics([BUSINESS_LOGIC_KEYS[1]], {
                gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            })
            await expect(new ValidateTxResponseCommand({ txResponse: response }).execute()).to.be.rejectedWith(Error)
        })

        it('GIVEN an empty registry WHEN registerBusinessLogics THEN queries responds with correct values', async () => {
            const LATEST_VERSION = 1
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 2)
            expect(
                await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER, {
                    gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
                })
            )
                .to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
                .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION)

            expect(await businessLogicResolver.getLatestVersion()).is.equal(LATEST_VERSION)
            expect(await businessLogicResolver.getVersionStatus(LATEST_VERSION)).to.be.equal(VersionStatus.ACTIVATED)
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

            const LATEST_VERSION = 2
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 3)
            expect(await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER))
                .to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
                .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION)

            expect(await businessLogicResolver.getLatestVersion()).is.equal(LATEST_VERSION)
            expect(await businessLogicResolver.getVersionStatus(LATEST_VERSION)).to.be.equal(VersionStatus.ACTIVATED)
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
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[2].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress)
            expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length)
            expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
                BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey)
            )
        })
    })
})
