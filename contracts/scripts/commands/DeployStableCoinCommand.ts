import { BigNumber, Signer, Wallet } from 'ethers'
import { IStableCoinFactory } from '@typechain-types'
import {
    DEFAULT_TOKEN,
    ADDRESS_ZERO,
    NUMBER_ZERO,
    SignerWithoutProviderError,
    TokenKeysToKeyCommand,
    getFullWalletFromSigner,
    rolesToAccounts,
    tokenKeysToKey,
    tokenKeysToContract,
    CONFIG_ID,
    DEFAULT_CONFIG_VERSION,
} from '@scripts'

export interface TokenInformation {
    name: string
    symbol: string
    decimals?: number
    initialSupply: BigNumber
    maxSupply?: BigNumber
    memo: string
    freeze: boolean
}

interface DeployStableCoinCommandParamsCommon {
    businessLogicResolverProxyAddress: string
    stableCoinFactoryProxyAddress: string
    grantKYCToOriginalSender?: boolean
    useEnvironment?: boolean
}

export interface DeployStableCoinCommandNewParams extends DeployStableCoinCommandParamsCommon {
    signer: Signer
    tokenInformation: TokenInformation
    allToContract?: boolean
    reserveAddress?: string
    initialAmountDataFeed?: string
    createReserve?: boolean
    addKyc?: boolean
    addFeeSchedule?: boolean
    allRolesToCreator?: boolean
    rolesToAccount?: string
    initialMetadata?: string
    proxyAdminOwnerAccount?: string
    stableCoinConfigurationId?: IStableCoinFactory.ResolverProxyConfigurationStruct
    reserveConfigurationId?: IStableCoinFactory.ResolverProxyConfigurationStruct
    addSupply?: boolean
    addWipe?: boolean
}

interface DeployStableCoinCommandParams extends DeployStableCoinCommandParamsCommon {
    wallet: Wallet
    tokenStruct: IStableCoinFactory.TokenStructStruct
}

export default class DeployStableCoinCommand {
    public readonly wallet: Wallet
    public readonly tokenStruct: IStableCoinFactory.TokenStructStruct
    public readonly businessLogicResolverProxyAddress: string
    public readonly stableCoinFactoryProxyAddress: string
    public readonly grantKYCToOriginalSender: boolean
    public readonly useEnvironment: boolean

    constructor({
        wallet,
        tokenStruct,
        businessLogicResolverProxyAddress,
        stableCoinFactoryProxyAddress,
        grantKYCToOriginalSender = false,
        useEnvironment = false,
    }: DeployStableCoinCommandParams) {
        this.wallet = wallet
        this.tokenStruct = tokenStruct
        this.businessLogicResolverProxyAddress = businessLogicResolverProxyAddress
        this.stableCoinFactoryProxyAddress = stableCoinFactoryProxyAddress
        this.grantKYCToOriginalSender = grantKYCToOriginalSender
        this.useEnvironment = useEnvironment
    }

    public static async newInstance({
        signer,
        businessLogicResolverProxyAddress,
        stableCoinFactoryProxyAddress,
        grantKYCToOriginalSender = false,
        useEnvironment = false,
        tokenInformation,
        allToContract = true,
        initialAmountDataFeed,
        createReserve = true,
        reserveAddress = ADDRESS_ZERO,
        addKyc = false,
        addFeeSchedule = false,
        allRolesToCreator = true,
        rolesToAccount = '',
        initialMetadata = 'test',
        stableCoinConfigurationId,
        reserveConfigurationId,
        addSupply,
        addWipe,
    }: DeployStableCoinCommandNewParams) {
        if (!signer.provider) {
            throw new SignerWithoutProviderError()
        }
        const signerAddress = await signer.getAddress()
        const wallet = await getFullWalletFromSigner(signer)

        const keys = allToContract
            ? tokenKeysToContract({ addKyc, addFeeSchedule, addSupply, addWipe })
            : tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: wallet.publicKey, isEd25519: false }))

        const tokenStruct: IStableCoinFactory.TokenStructStruct = {
            tokenName: tokenInformation.name,
            tokenSymbol: tokenInformation.symbol,
            tokenDecimals: tokenInformation.decimals ?? DEFAULT_TOKEN.decimals,
            tokenInitialSupply: tokenInformation.initialSupply,
            supplyType: Boolean(tokenInformation.maxSupply), // true = FINITE, false = INFINITE (default)
            tokenMaxSupply: tokenInformation.maxSupply ?? NUMBER_ZERO,
            freeze: tokenInformation.freeze,
            reserveAddress,
            reserveInitialAmount: initialAmountDataFeed ?? tokenInformation.initialSupply,
            createReserve,
            keys: keys.map((key) => ({
                keyType: key.keyType,
                publicKey: key.publicKey,
                isEd25519: key.isEd25519,
            })),
            roles: rolesToAccounts({
                allToContract,
                allRolesToCreator,
                CreatorAccount: signerAddress,
                RolesToAccount: rolesToAccount,
            }),
            cashinRole: {
                account: allToContract ? (allRolesToCreator ? signerAddress : rolesToAccount) : ADDRESS_ZERO,
                allowance: NUMBER_ZERO,
            },
            metadata: initialMetadata,
            businessLogicResolverAddress: businessLogicResolverProxyAddress,
            stableCoinConfigurationId: stableCoinConfigurationId ?? {
                key: CONFIG_ID.stableCoin,
                version: DEFAULT_CONFIG_VERSION,
            },
            reserveConfigurationId: reserveConfigurationId ?? {
                key: CONFIG_ID.reserve,
                version: DEFAULT_CONFIG_VERSION,
            },
        }

        return new DeployStableCoinCommand({
            wallet,
            tokenStruct,
            businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress,
            grantKYCToOriginalSender,
            useEnvironment,
        })
    }
}
