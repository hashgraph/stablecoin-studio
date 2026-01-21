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
    WipeableFacet,
    WipeableFacet__factory,
    StableCoinTokenMock,
    StableCoinTokenMock__factory,
} from '@contracts'
import {
    allTokenKeysToKey,
    AllTokenKeysToKeyCommand,
    DEFAULT_TOKEN,
    delay,
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
  deployFullInfrastructureInTests,
  GAS_LIMIT,
  OTHER_AUTO_RENEW_PERIOD
} from '@test/shared'
import { toBigInt, Wallet, Signer, SigningKey, hashMessage } from 'ethers'

describe('➡️ HederaTokenManager Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let businessLogicResolver: string
    let stableCoinFactory: string
    let hederaTokenManagerFacet: HederaTokenManagerFacet
    let cashInFacet: CashInFacet
    let wipeFacet: WipeableFacet
    let tokenAddress: string
    // Accounts
    let operator: Wallet // ! usign Wallet instead of SignerWithAddress because need public key
    let nonOperator: Wallet

    async function setFacets(address: string) {
        hederaTokenManagerFacet = HederaTokenManagerFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
        wipeFacet = WipeableFacet__factory.connect(address, operator)
    }

    async function getAccountPublicKey(operatorSigner: Signer) {
        const message = "test"
        const signature = await operatorSigner.signMessage(message)
        const digest = hashMessage(message)
        return SigningKey.recoverPublicKey(digest, signature);
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        const [operatorSigner, nonOperatorSigner] = await ethers.getSigners()
        operator = await getFullWalletFromSigner(operatorSigner)
        nonOperator = await getFullWalletFromSigner(nonOperatorSigner)

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operatorSigner,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        businessLogicResolver = deployedContracts.businessLogicResolver.proxyAddress!
        stableCoinFactory = deployedContracts.stableCoinFactoryFacet.proxyAddress!
        ;({ stableCoinProxyAddress, tokenAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactory,
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed.toString(),
            addFeeSchedule: true,
        }))

        await StableCoinTokenMock__factory.connect(tokenAddress, operator)
          .setStableCoinAddress(stableCoinProxyAddress);

        await setFacets(stableCoinProxyAddress)
    })

    it('Cannot Update token if not Admin', async function () {
        const operatorPublicKey = await getAccountPublicKey(operator)
        const keys = tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: operatorPublicKey }))
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: toBigInt(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: DEFAULT_TOKEN.memo,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        hederaTokenManagerFacet = hederaTokenManagerFacet.connect(nonOperator)
        await expect(hederaTokenManagerFacet.updateToken(updateTokenStruct, {
          gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })).to.be.revertedWithCustomError(hederaTokenManagerFacet, "AccountHasNoRole")
          .withArgs(nonOperator, ROLES.defaultAdmin.hash)
    })

    it('Admin cannot update token if metadata exceeds 100 characters', async function () {
        const operatorPublicKey = await getAccountPublicKey(operator)
        const keys = tokenKeysToKey(
            new TokenKeysToKeyCommand({ publicKey: operatorPublicKey, addKyc: false })
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

        await expect(hederaTokenManagerFacet.updateToken(updateTokenStruct, {
          gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })).to.be.revertedWithCustomError(hederaTokenManagerFacet, "MoreThan100Error")
    })

    it('Admin can update token', async function () {
        const operatorPublicKey = await getAccountPublicKey(operator)
        const keys = tokenKeysToKey(
            new TokenKeysToKeyCommand({ publicKey: operatorPublicKey, addKyc: false })
        )
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: 0n,
            autoRenewPeriod: 0n,
            tokenMetadataURI: 'newMemo',
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        hederaTokenManagerFacet = hederaTokenManagerFacet.connect(operator)
        await expect(hederaTokenManagerFacet.updateToken(updateTokenStruct, {
          gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })).to.emit(hederaTokenManagerFacet, "TokenUpdated")
          //.withArgs(currentTokenAddress, updateTokenStruct)

        const newMetadata = await hederaTokenManagerFacet.getMetadata({
            gasLimit: GAS_LIMIT.hederaTokenManager.getMetadata,
        })
        expect(newMetadata).to.equal('newMemo')

        // Update back to initial values
        await expect(hederaTokenManagerFacet.updateToken(DEFAULT_UPDATE_TOKEN_STRUCT, {
          gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })).to.emit(hederaTokenManagerFacet, "TokenUpdated")
          //.withArgs(currentTokenAddress, DEFAULT_UPDATE_TOKEN_STRUCT)
    })

    it('Admin and supply token keys cannot be updated', async function () {
        const operatorPublicKey = await getAccountPublicKey(operator)
        const keys = allTokenKeysToKey(
            new AllTokenKeysToKeyCommand({ publicKey: operatorPublicKey, addKyc: false })
        )
        const updateTokenStruct = {
            tokenName: 'newName',
            tokenSymbol: 'newSymbol',
            keys: keys as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
            second: toBigInt(getOneMonthFromNowInSeconds()),
            autoRenewPeriod: OTHER_AUTO_RENEW_PERIOD,
            tokenMetadataURI: DEFAULT_TOKEN.memo,
        } as IHederaTokenManager.UpdateTokenStructStructOutput

        await expect(hederaTokenManagerFacet.updateToken(updateTokenStruct, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateToken,
        })).to.be.revertedWithCustomError(hederaTokenManagerFacet, "AdminKeyUpdateError")
    })

    it('Mint token throw error format number incorrect', async () => {
        const initialTotalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        await expect (cashInFacet.mint(operator.address, 1, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.be.revertedWithCustomError(cashInFacet, "FormatNumberIncorrect")
            .withArgs(1)

        const afterErrorTotalSupply = await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })
        expect(initialTotalSupply).to.equal(afterErrorTotalSupply)

        await expect (cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.emit(cashInFacet, "TokensMinted")
            .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)

        await delay({ time: 500, unit: 'ms' })
        expect (await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })).to.equal(initialTotalSupply + ONE_TOKEN)

        await expect(wipeFacet.wipe(operator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.wipe,
        })).to.emit(wipeFacet, "TokensWiped")
          .withArgs(operator.address, tokenAddress, operator.address, ONE_TOKEN)

        await delay({ time: 500, unit: 'ms' })
        expect (await hederaTokenManagerFacet.totalSupply({
            gasLimit: GAS_LIMIT.hederaTokenManager.totalSupply,
        })).to.equal(initialTotalSupply)
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
            else if (i == ROLES.hold.id)
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
            else if (i == ROLES.hold.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.hold.hash.toUpperCase())
            else if (i == ROLES.defaultAdmin.id)
                expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
            else expect(resultNonOperatorAccount[i].toUpperCase()).to.equals(ROLES.withoutRole.hash.toUpperCase())
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
            updatedAtThreshold: 0,
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
        await expect(hederaTokenManagerFacet.initialize(dummyStruct, {
          gasLimit: GAS_LIMIT.hederaTokenManager.initialize,
        })).to.be.revertedWithCustomError(hederaTokenManagerFacet, "ContractIsAlreadyInitialized")
          //.withArgs(currentTokenAddress, updateTokenStruct)
    })
})
