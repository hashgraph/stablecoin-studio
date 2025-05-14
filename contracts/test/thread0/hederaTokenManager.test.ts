import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    HederaTokenManagerFacet,
    HederaTokenManagerFacet__factory,
    IHederaTokenManager,
    RolesFacet__factory,
    SupplierAdminFacet__factory,
} from '@typechain-types'
import {
    allTokenKeysToKey,
    AllTokenKeysToKeyCommand,
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    getFullWalletFromSigner,
    getOneMonthFromNowInSeconds,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    tokenKeysToKey,
    TokenKeysToKeyCommand,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import {
    DEFAULT_UPDATE_TOKEN_STRUCT,
    deployStableCoinInTests,
    GAS_LIMIT,
    OTHER_AUTO_RENEW_PERIOD,
} from '@test/shared'
import { BigNumber, Wallet } from 'ethers'

describe('➡️ HederaTokenManager Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let businessLogicResolver: string
    let stableCoinFactory: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let cashInFacet: CashInFacet
    // Accounts
    let operator: Wallet // ! usign Wallet instead of SignerWithAddress because need public key
    let nonOperator: Wallet

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        const [operatorSigner, nonOperatorSigner] = await ethers.getSigners()
        operator = await getFullWalletFromSigner(operatorSigner)
        nonOperator = await getFullWalletFromSigner(nonOperatorSigner)

        const { ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operatorSigner,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        businessLogicResolver = deployedContracts.businessLogicResolver.proxyAddress!
        stableCoinFactory = deployedContracts.stableCoinFactoryFacet.proxyAddress!
        ;({ stableCoinProxyAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactory,
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed.toString(),
            addFeeSchedule: true,
        }))

        await setFacets(stableCoinProxyAddress)
    })

    it('Cannot Update token if not Admin', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: DEFAULT_TOKEN.memo,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManagerFacet
            .connect(nonOperator)
            .updateToken(updateTokenStruct, { gasLimit: GAS_LIMIT.hederaTokenManager.updateToken })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Admin cannot update token if metadata exceeds 100 characters', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const longMetadata = 'X'.repeat(101)

        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: longMetadata,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManagerFacet.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })

        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    // TODO: review this test
    it.skip('Admin can update token', async function () {
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: DEFAULT_TOKEN.memo,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        const response = await hederaTokenManagerFacet.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: response, confirmationEvent: 'TokenUpdated' })
        )

        const newMetadata = await hederaTokenManagerFacet.getMetadata({
            gasLimit: GAS_LIMIT.hederaTokenManager.getMetadata,
        })
        expect(newMetadata).to.equal(DEFAULT_TOKEN.memo)

        // Update back to initial values
        const defaultResponse = await hederaTokenManagerFacet.updateToken(DEFAULT_UPDATE_TOKEN_STRUCT, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: defaultResponse, confirmationEvent: 'TokenUpdated' })
        )
    })

    it('Admin and supply token keys cannot be updated', async function () {
        const keys = allTokenKeysToKey(new AllTokenKeysToKeyCommand({ publicKey: operator.publicKey, addKyc: false }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: BigNumber.from(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: DEFAULT_TOKEN.memo,
        } as IHederaTokenManager.UpdateTokenStructStructOutput
        const response = await hederaTokenManagerFacet.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('deploy SC with roles associated to another account', async function () {
        // Deploy New Token
        const { stableCoinProxyAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactory,
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed.toString(),
            allRolesToCreator: false,
            rolesToAccount: nonOperator.address,
            addFeeSchedule: true,
        })

        const rolesFacet = RolesFacet__factory.connect(stableCoinProxyAddress, operator)
        const supplierAdminFacet = SupplierAdminFacet__factory.connect(stableCoinProxyAddress, operator)


        // Checking roles
        const [resultOperatorAccount, resultNonOperatorAccount, isUnlimitedOperator, isUnlimitedNonOperator] =
            await Promise.all([
                rolesFacet.getRoles(operator.address, { gasLimit: GAS_LIMIT.hederaTokenManager.getRoles }),
                rolesFacet.getRoles(nonOperator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.getRoles,
                }),
                supplierAdminFacet.isUnlimitedSupplierAllowance(operator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
                }),
                supplierAdminFacet.isUnlimitedSupplierAllowance(nonOperator.address, {
                    gasLimit: GAS_LIMIT.hederaTokenManager.isUnlimitedSupplierAllowance,
                }),
            ])

        expect(isUnlimitedOperator).to.eq(false)
        expect(isUnlimitedNonOperator).to.eq(true)

        for (let i = 0; i < resultOperatorAccount.length; i++) {
            if (i == ROLES.cashin.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.burn.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.delete.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.freeze.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.wipe.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.rescue.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.pause.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.kyc.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.customFees.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else if (i == ROLES.defaultAdmin.id)
                expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.defaultAdmin.hash.toUpperCase())
            else expect(resultOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }

        for (let i = 0; i < resultNonOperatorAccount.length; i++) {
            if (i == ROLES.cashin.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.cashin.hash.toUpperCase())
            else if (i == ROLES.burn.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.burn.hash.toUpperCase())
            else if (i == ROLES.delete.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.delete.hash.toUpperCase())
            else if (i == ROLES.freeze.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.freeze.hash.toUpperCase())
            else if (i == ROLES.wipe.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.wipe.hash.toUpperCase())
            else if (i == ROLES.rescue.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.rescue.hash.toUpperCase())
            else if (i == ROLES.pause.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.pause.hash.toUpperCase())
            else if (i == ROLES.kyc.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.kyc.hash.toUpperCase())
            else if (i == ROLES.customFees.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.customFees.hash.toUpperCase())
            else if (i == ROLES.defaultAdmin.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
        }
    })

    it('input parmeters check', async function () {
        // We retreive the Token basic params
        const [retrievedTokenName, retrievedTokenSymbol, retrievedTokenDecimals, retrievedTokenTotalSupply] =
            await Promise.all([
                hederaTokenManagerFacet.name({ gasLimit: GAS_LIMIT.hederaTokenManager.name }),
                hederaTokenManagerFacet.symbol({ gasLimit: GAS_LIMIT.hederaTokenManager.symbol }),
                hederaTokenManagerFacet.decimals({ gasLimit: GAS_LIMIT.hederaTokenManager.decimals }),
                hederaTokenManagerFacet.totalSupply({ gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply }),
            ])

        // We check their values : success
        expect(retrievedTokenName).to.equals(DEFAULT_TOKEN.name)
        expect(retrievedTokenSymbol).to.equals(DEFAULT_TOKEN.symbol)
        expect(retrievedTokenDecimals).to.equals(DEFAULT_TOKEN.decimals)
        expect(retrievedTokenTotalSupply.toString()).to.equals(DEFAULT_TOKEN.initialSupply.toString())
    })

    // TODO: init test before only pass the tokenAddress, this was never tested
    it.skip('Check initialize can only be run once', async function () {
        const initStruct = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token: ethers.constants.HashZero as any,  //! imposible to test...
            initialTotalSupply: 0,
            tokenDecimals: 0,
            originalSender: operator.address,
            reserveAddress: operator.address,
            roles: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cashinRole: ethers.constants.HashZero as any,
            tokenMetadataURI: '',
        }

        // Initiliaze : fail
        const result = await hederaTokenManagerFacet.initialize(initStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.initialize,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })

    it('Mint token throw error format number incorrrect', async () => {
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        const badMintResponse = await cashInFacet.mint(operator.address, BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: badMintResponse }))
        ).to.be.rejectedWith(Error)

        const afterErrorTotalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        expect(initialTotalSupply).to.equal(afterErrorTotalSupply)

        const goodMintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: goodMintResponse, confirmationEvent: 'TokensMinted' })
        )

        await delay({ time: 500, unit: 'ms' })
        const totalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        expect(totalSupply).to.equal(initialTotalSupply.add(ONE_TOKEN))
    })
})
