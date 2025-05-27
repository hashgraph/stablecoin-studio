import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import {
    BurnableFacet__factory,
    HederaTokenManagerFacet__factory,
    HederaTokenManagerFacet,
    BurnableFacet,
    HoldManagementFacet__factory,
    HoldManagementFacet,
    CashInFacet,
    CashInFacet__factory,
} from '@typechain-types'
import {
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

const EMPTY_HEX_BYTES = '0x'
const _DATA = '0x1234'
const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60
let currentTimestamp = 0
let expirationTimestamp = 0
const _AMOUNT = 10
const EMPTY_STRING = ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hold: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let holdIdentifier: any
describe('➡️ Hold Management Tests', () => {
    // Contracts
    let stableCoinProxyAddress: string
    let businessLogicResolverProxyAddress: string
    let stableCoinFactoryProxyAddress: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let holdManagementFacet: HoldManagementFacet
    let cashInFacet: CashInFacet
    let burnableFacet: BurnableFacet

    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress
    let account_Operator: string
    let account_nonOperator: string

    let tokensToMint: BigNumber

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        holdManagementFacet = HoldManagementFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
        burnableFacet = BurnableFacet__factory.connect(address, operator)
    }

    async function checkCreatedHold_expected(
        balance_expected: number,
        totalHeldAmount_expected: number,
        holdCount_expected: number,
        holdAmount_expected: number,
        holdEscrow_expected: string,
        holdData_expected: string,
        holdOperatorData_expected: string,
        holdDestination_expected: string,
        holdExpirationTimestamp_expected: string,
        holdsLength_expected: number,
        holdId_expected: number
    ) {
        const balance = await hederaTokenManagerFacet.balanceOf(account_Operator)
        const heldAmount = await holdManagementFacet.getHeldAmountFor(account_Operator)
        const holdCount = await holdManagementFacet.getHoldCountFor(account_Operator)
        const holdIds = await holdManagementFacet.getHoldsIdFor(account_Operator, 0, 100)

        expect(balance).to.equal(balance_expected)
        expect(heldAmount).to.equal(totalHeldAmount_expected)
        expect(holdCount).to.equal(holdCount_expected)
        expect(holdIds.length).to.equal(holdsLength_expected)

        if (holdCount_expected > 0) {
            const retrieved_hold = await holdManagementFacet.getHoldFor(holdIdentifier)

            expect(retrieved_hold.amount_).to.equal(holdAmount_expected)
            expect(retrieved_hold.escrow_).to.equal(holdEscrow_expected)
            expect(retrieved_hold.data_).to.equal(holdData_expected)
            expect(retrieved_hold.operatorData_).to.equal(holdOperatorData_expected)
            expect(retrieved_hold.destination_).to.equal(holdDestination_expected)
            expect(retrieved_hold.expirationTimestamp_).to.equal(holdExpirationTimestamp_expected)
            expect(holdIds[0]).to.equal(holdId_expected)
        }
    }

    async function setInitialData({ addSupply, addWipe }: { addSupply?: boolean; addWipe?: boolean }) {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;({ stableCoinProxyAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxyAddress,
            addSupply: addSupply,
            addWipe: addWipe,
        }))
        currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
        expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS

        hold = {
            amount: _AMOUNT,
            expirationTimestamp: expirationTimestamp,
            escrow: account_nonOperator,
            to: ADDRESS_ZERO,
            data: _DATA,
        }
        holdIdentifier = {
            tokenHolder: account_Operator,
            holdId: 1,
        }

        await setFacets(stableCoinProxyAddress)

        if (addSupply !== false) {
            tokensToMint = BigNumber.from(_AMOUNT).mul(ONE_TOKEN)
            const mintResponse = await cashInFacet.mint(account_Operator, tokensToMint, {
                gasLimit: GAS_LIMIT.hederaTokenManager.mint,
            })
            await validateTxResponse(
                new ValidateTxResponseCommand({ txResponse: mintResponse, confirmationEvent: 'TokensMinted' })
            )
        }
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()
        account_Operator = operator.address
        account_nonOperator = nonOperator.address

        const { ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        businessLogicResolverProxyAddress = deployedContracts.businessLogicResolver.proxyAddress!
        stableCoinFactoryProxyAddress = deployedContracts.stableCoinFactoryFacet.proxyAddress!
    })

    describe('Check Role Access', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN an account without HOLD_CREATOR_ROLE role WHEN createHoldByController THEN transaction fails with AccountHasNoRole', async () => {
            const txResponse = await holdManagementFacet
                .connect(nonOperator)
                .createHoldByController(account_nonOperator, hold, EMPTY_HEX_BYTES, {
                    gasLimit: GAS_LIMIT.hold.createHoldByController,
                })
            await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
        })
    })

    describe('Create with wrong input arguments', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN a Token WHEN creating hold with amount bigger than balance THEN transaction fails with ResponseCodeInvalid', async () => {
            const AmountLargerThanBalance = 1000000 * _AMOUNT * _AMOUNT
            const hold_wrong = {
                amount: AmountLargerThanBalance,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            await expect(holdManagementFacet.createHold(hold_wrong)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'ResponseCodeInvalid'
            )
            await expect(
                holdManagementFacet
                    .connect(operator)
                    .createHoldByController(account_Operator, hold_wrong, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'ResponseCodeInvalid')
        })
        it('GIVEN a Token WHEN create hold passing empty escrow THEN transaction fails with AddressZero', async () => {
            const hold_wrong = {
                amount: _AMOUNT,
                expirationTimestamp: expirationTimestamp,
                escrow: ADDRESS_ZERO,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            await expect(holdManagementFacet.createHold(hold_wrong)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'AddressZero'
            )
            await expect(
                holdManagementFacet
                    .connect(operator)
                    .createHoldByController(account_Operator, hold_wrong, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'AddressZero')
        })
        it('GIVEN a Token WHEN createHoldByController passing empty from THEN transaction fails with AddressZero', async () => {
            await expect(
                holdManagementFacet.connect(operator).createHoldByController(ADDRESS_ZERO, hold, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'AddressZero')
        })
        it('GIVEN a Token WHEN create hold passing wrong expirationTimestamp THEN transaction fails with InvalidExpiration', async () => {
            const wrongExpirationTimestamp = hold.expirationTimestamp - ONE_YEAR_IN_SECONDS - 1
            const hold_wrong = {
                amount: _AMOUNT,
                expirationTimestamp: wrongExpirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            await expect(holdManagementFacet.createHold(hold_wrong)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'InvalidExpiration'
            )
            await expect(
                holdManagementFacet
                    .connect(operator)
                    .createHoldByController(account_Operator, hold_wrong, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'InvalidExpiration')
        })
        it('GIVEN a Token WHEN create hold passing negative amount THEN transaction fails with NegativeAmount', async () => {
            const hold_wrong = {
                amount: -1,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            await expect(holdManagementFacet.createHold(hold_wrong)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'NegativeAmount'
            )
            await expect(
                holdManagementFacet
                    .connect(operator)
                    .createHoldByController(account_Operator, hold_wrong, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'NegativeAmount')
        })
        it('GIVEN a Token WHEN create hold passing zero amount THEN transaction fails with NegativeAmount', async () => {
            const hold_wrong = {
                amount: 0,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            await expect(holdManagementFacet.createHold(hold_wrong)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'NegativeAmount'
            )
            await expect(
                holdManagementFacet
                    .connect(operator)
                    .createHoldByController(account_Operator, hold_wrong, EMPTY_HEX_BYTES)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'NegativeAmount')
        })
    })
    describe('Create Holds OK', () => {
        beforeEach(async () => {
            await setInitialData({})
        })
        it('GIVEN a Token WHEN createHold THEN transaction succeeds', async () => {
            await expect(holdManagementFacet.createHold(hold))
                .to.emit(holdManagementFacet, 'HoldCreated')
                .withArgs(account_Operator, account_Operator, 1, Object.values(hold), EMPTY_HEX_BYTES)
            await checkCreatedHold_expected(
                tokensToMint.sub(_AMOUNT).toNumber(),
                _AMOUNT,
                1,
                hold.amount,
                hold.escrow,
                hold.data,
                EMPTY_HEX_BYTES,
                hold.to,
                hold.expirationTimestamp,
                1,
                1
            )
        })
        it('GIVEN a Token WHEN createHoldByController THEN transaction succeeds', async () => {
            await expect(holdManagementFacet.createHoldByController(account_Operator, hold, EMPTY_HEX_BYTES))
                .to.emit(holdManagementFacet, 'HoldCreated')
                .withArgs(account_Operator, account_Operator, 1, Object.values(hold), EMPTY_HEX_BYTES)
            await checkCreatedHold_expected(
                tokensToMint.sub(_AMOUNT).toNumber(),
                _AMOUNT,
                1,
                hold.amount,
                hold.escrow,
                hold.data,
                EMPTY_HEX_BYTES,
                hold.to,
                hold.expirationTimestamp,
                1,
                1
            )
        })
    })
    describe('Execute with wrong input arguments', () => {
        beforeEach(async () => {
            await setInitialData({})
        })
        it('GIVEN a wrong escrow id WHEN executeHold THEN transaction fails with UnauthorizedEscrow', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(operator).executeHold(holdIdentifier, account_nonOperator, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'UnauthorizedEscrow')
        })
        it('GIVEN a wrong tokenHolder id WHEN executeHold THEN transaction fails with HoldNotFound', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            const holdIdentifier = {
                tokenHolder: account_nonOperator,
                holdId: 1,
            }
            await expect(
                holdManagementFacet.connect(operator).executeHold(holdIdentifier, account_nonOperator, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldNotFound')
        })
        it('GIVEN a negative amount WHEN executeHold THEN transaction fails with NegativeAmount', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(operator).executeHold(holdIdentifier, account_nonOperator, -1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'NegativeAmount')
        })
        it('GIVEN a invalid amount WHEN executeHold THEN transaction fails with InsufficientHoldAmount', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(operator).executeHold(holdIdentifier, account_nonOperator, 1000)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'InsufficientHoldAmount')
        })
        it('GIVEN an expire hold WHEN executeHold THEN transaction fails with HoldExpired', async () => {
            const currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
            const expirationTimestamp = currentTimestamp + 5
            const hold = {
                amount: _AMOUNT,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            const holdIdentifier = {
                tokenHolder: account_Operator,
                holdId: 1,
            }
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await delay({ time: 6, unit: 'sec' })
            await expect(
                holdManagementFacet.connect(operator).executeHold(holdIdentifier, account_nonOperator, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldExpired')
        })
    })
    describe('Release with wrong input arguments', () => {
        beforeEach(async () => {
            await setInitialData({})
        })
        it('GIVEN a wrong escrow WHEN releaseHold THEN transaction fails with UnauthorizedEscrow', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(operator).releaseHold(holdIdentifier, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'UnauthorizedEscrow')
        })
        it('GIVEN a hold WHEN releaseHold for an amount larger than the total held amount THEN transaction fails with InsufficientHoldAmount', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(nonOperator).releaseHold(holdIdentifier, 2 * 10)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'InsufficientHoldAmount')
        })
        it('GIVEN a wrong tokenHolder id WHEN releaseHold THEN transaction fails with HoldNotFound', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            const holdIdentifier = {
                tokenHolder: account_nonOperator,
                holdId: 1,
            }
            await expect(
                holdManagementFacet.connect(operator).releaseHold(holdIdentifier, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldNotFound')
        })
        it('GIVEN an expire hold WHEN releaseHold THEN transaction fails with HoldExpired', async () => {
            const currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
            const expirationTimestamp = currentTimestamp + 5
            const hold = {
                amount: _AMOUNT,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            const holdIdentifier = {
                tokenHolder: account_Operator,
                holdId: 1,
            }
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await delay({ time: 6, unit: 'sec' })
            await expect(
                holdManagementFacet.connect(operator).releaseHold(holdIdentifier, 1)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldExpired')
        })
    })
    describe('Reclaim with wrong input arguments', () => {
        beforeEach(async () => {
            await setInitialData({})
        })
        it('GIVEN a wrong tokenHolder id WHEN reclaimHold THEN transaction fails with HoldNotFound', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            const holdIdentifier = {
                tokenHolder: account_nonOperator,
                holdId: 1,
            }
            await expect(
                holdManagementFacet.connect(operator).reclaimHold(holdIdentifier)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldNotFound')
        })
        it('GIVEN hold WHEN reclaimHold before expiration date THEN transaction fails with HoldNotExpired', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet.connect(operator).reclaimHold(holdIdentifier)
            ).to.be.revertedWithCustomError(holdManagementFacet, 'HoldNotExpired')
        })
    })
    describe('Execute OK', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN hold with no destination WHEN executeHold THEN transaction succeeds', async () => {
            const balance_before = await hederaTokenManagerFacet.balanceOf(account_nonOperator)
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet
                    .connect(nonOperator)
                    .executeHold(holdIdentifier, account_nonOperator, _AMOUNT, { gasLimit: GAS_LIMIT.hold.executeHold })
            )
                .to.emit(holdManagementFacet, 'HoldExecuted')
                .withArgs(account_Operator, 1, _AMOUNT, account_nonOperator)
            await checkCreatedHold_expected(
                tokensToMint.sub(_AMOUNT).toNumber(),
                0,
                0,
                0,
                EMPTY_STRING,
                EMPTY_HEX_BYTES,
                EMPTY_HEX_BYTES,
                EMPTY_STRING,
                EMPTY_STRING,
                0,
                0
            )
            const balance_after = await hederaTokenManagerFacet.balanceOf(account_nonOperator)
            expect(balance_after.toNumber()).to.equal(balance_before.add(_AMOUNT).toNumber())
        })
    })

    describe('Release OK', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN hold with no destination WHEN releaseHold THEN transaction succeeds', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                holdManagementFacet
                    .connect(nonOperator)
                    .releaseHold(holdIdentifier, _AMOUNT, { gasLimit: GAS_LIMIT.hold.releaseHold })
            )
                .to.emit(holdManagementFacet, 'HoldReleased')
                .withArgs(account_Operator, 1, _AMOUNT)
            await checkCreatedHold_expected(
                tokensToMint.toNumber(),
                0,
                0,
                0,
                EMPTY_STRING,
                EMPTY_HEX_BYTES,
                EMPTY_HEX_BYTES,
                EMPTY_STRING,
                EMPTY_STRING,
                0,
                0
            )
        })
    })
    describe('Reclaim OK', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN hold with no destination WHEN reclaimHold THEN transaction succeeds', async () => {
            const currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
            const expirationTimestamp = currentTimestamp + 5
            const hold = {
                amount: _AMOUNT,
                expirationTimestamp: expirationTimestamp,
                escrow: account_nonOperator,
                to: ADDRESS_ZERO,
                data: _DATA,
            }
            const holdIdentifier = {
                tokenHolder: account_Operator,
                holdId: 1,
            }
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await delay({ time: 6, unit: 'sec' })
            await expect(
                holdManagementFacet
                    .connect(nonOperator)
                    .reclaimHold(holdIdentifier, { gasLimit: GAS_LIMIT.hold.reclaimHold })
            )
                .to.emit(holdManagementFacet, 'HoldReclaimed')
                .withArgs(account_nonOperator, account_Operator, 1, 10)
            await checkCreatedHold_expected(
                tokensToMint.toNumber(),
                0,
                0,
                0,
                EMPTY_STRING,
                EMPTY_HEX_BYTES,
                EMPTY_HEX_BYTES,
                EMPTY_STRING,
                EMPTY_STRING,
                0,
                0
            )
        })
    })
    describe('isHoldActive modifier', () => {
        before(async () => {
            await setInitialData({})
        })
        it('GIVEN an active hold WHEN burning more than treasury funds THEN fails with BurnableAmountExceeded', async () => {
            await expect(holdManagementFacet.createHold(hold)).to.emit(holdManagementFacet, 'HoldCreated')
            await expect(
                burnableFacet.burn(DEFAULT_TOKEN.initialSupply.add(tokensToMint))
            ).to.be.revertedWithCustomError(burnableFacet, 'BurnableAmountExceeded')
        })
    })

    describe('Missing Keys', () => {
        it('GIVEN a token without the supply key THEN calling the create hold AND fail with ResponseCodeInvalid', async () => {
            await setInitialData({ addSupply: false })
            await expect(holdManagementFacet.createHold(hold)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'ResponseCodeInvalid'
            )
            await expect(holdManagementFacet.connect(operator).createHold(hold)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'ResponseCodeInvalid'
            )
        })
        it('GIVEN a token without the wipe key THEN calling the create hold AND fail with ResponseCodeInvalid', async () => {
            await setInitialData({ addWipe: false })
            await expect(holdManagementFacet.createHold(hold)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'ResponseCodeInvalid'
            )
            await expect(holdManagementFacet.connect(operator).createHold(hold)).to.be.revertedWithCustomError(
                holdManagementFacet,
                'ResponseCodeInvalid'
            )
        })
    })
})
