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
} from '@contracts'
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
import { DEFAULT_UPDATE_TOKEN_STRUCT, deployStableCoinInTests, GAS_LIMIT, OTHER_AUTO_RENEW_PERIOD } from '@test/shared'
import { toBigInt, Wallet } from 'ethers'

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
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operator.signingKey.publicKey }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: toBigInt(getOneMonthFromNowInSeconds()),
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
        const keys = tokenKeysToKey(
            new TokenKeysToKeyCommand({ publicKey: operator.signingKey.publicKey, addKyc: false })
        )
        const longMetadata = 'X'.repeat(101)

        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: toBigInt(getOneMonthFromNowInSeconds()),
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

    it('Admin can update token', async function () {
        const keys = tokenKeysToKey(
            new TokenKeysToKeyCommand({ publicKey: operator.signingKey.publicKey, addKyc: false })
        )
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: 0n,
            autoRenewPeriod: 0n,
            tokenMetadataURI: 'newMemo',
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
        expect(newMetadata).to.equal('newMemo')

        // Update back to initial values
        const defaultResponse = await hederaTokenManagerFacet.updateToken(DEFAULT_UPDATE_TOKEN_STRUCT, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({ txResponse: defaultResponse, confirmationEvent: 'TokenUpdated' })
        )
    })

    it('Admin and supply token keys cannot be updated', async function () {
        const keys = allTokenKeysToKey(
            new AllTokenKeysToKeyCommand({ publicKey: operator.signingKey.publicKey, addKyc: false })
        )
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: toBigInt(getOneMonthFromNowInSeconds()),
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
            expect([ROLES.withoutRole.toUpperCase(), ROLES.defaultAdmin.toUpperCase()]).to.include(
                resultOperatorAccount[i].toUpperCase()
            )
        }

        const ROLES_ARRAY = Object.values(ROLES).map((v) => v.toUpperCase())

        for (let i = 0; i < resultNonOperatorAccount.length; i++) {
            expect(ROLES_ARRAY).to.include(resultNonOperatorAccount[i].toUpperCase())
        }
    })

    it('input parameters check', async function () {
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

    it('Check initialize can only be run once', async function () {
        const dummyStruct = {
            token: {
                name: 'DummyToken',
                symbol: 'DUM',
                treasury: '0x000000000000000000000000000000000000dEaD',
                memo: 'Test token memo',
                tokenSupplyType: true,
                maxSupply: 1_000_000,
                freezeDefault: false,
                tokenKeys: [
                    {
                        keyType: 1,
                        key: {
                            inheritAccountKey: false,
                            contractId: '0x1111111111111111111111111111111111111111',
                            ed25519: '0xabcdef',
                            ECDSA_secp256k1: '0x123456',
                            delegatableContractId: '0x2222222222222222222222222222222222222222',
                        },
                    },
                ],
                expiry: {
                    second: 1680000000,
                    autoRenewAccount: '0x3333333333333333333333333333333333333333',
                    autoRenewPeriod: 7890000,
                },
            },
            initialTotalSupply: 500_000,
            tokenDecimals: 8,
            originalSender: '0x4444444444444444444444444444444444444444',
            reserveAddress: '0x5555555555555555555555555555555555555555',
            roles: [
                {
                    account: '0x6666666666666666666666666666666666666666',
                    allowance: 1_000,
                    role: '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
                },
            ],
            cashinRole: {
                account: '0x7777777777777777777777777777777777777777',
                allowance: 2_000,
            },
            tokenMetadataURI: 'https://example.com/metadata.json',
        }

        // Initiliaze : fail
        const result = await hederaTokenManagerFacet.initialize(dummyStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.initialize,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: result }))).to.be.rejectedWith(
            Error
        )
    })

    it('Mint token throw error format number incorrect', async () => {
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        const badMintResponse = await cashInFacet.mint(operator.address, 1, {
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
        expect(totalSupply).to.equal(initialTotalSupply + ONE_TOKEN)
    })
})
