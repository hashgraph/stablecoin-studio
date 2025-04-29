import { Signer, Wallet } from 'ethers'
import { DEFAULT_DECIMALS } from '@configuration'
import { IStableCoinFactory } from '@typechain'
import { ADDRESS_ZERO, NUMBER_ZERO } from 'scripts/constants'
import {
    SignerWithoutProviderError,
    TokenKeysToKeyCommand,
    getFullWalletFromSigner,
    rolesToAccounts,
    tokenKeysToKey,
    tokenKeysToContract,
} from '@scripts'

export interface TokenInformation {
    name: string
    symbol: string
    decimals?: number
    initialSupply: string
    maxSupply?: string
    memo: string
    freeze: boolean
}

interface DeployStableCoinCommandParamsCommon {
    businessLogicResolverAddress: string
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
    businessLogicResolverContractId: string
    stableCoinConfigurationId: IStableCoinFactory.ResolverProxyConfigurationStruct
    reserveConfigurationId: IStableCoinFactory.ResolverProxyConfigurationStruct
}

interface DeployStableCoinCommandParams extends DeployStableCoinCommandParamsCommon {
    wallet: Wallet
    tokenStruct: IStableCoinFactory.TokenStructStruct
}

export default class DeployStableCoinCommand {
    public readonly wallet: Wallet
    public readonly tokenStruct: IStableCoinFactory.TokenStructStruct
    public readonly businessLogicResolverAddress: string
    public readonly grantKYCToOriginalSender: boolean
    public readonly useEnvironment: boolean

    constructor({
        wallet,
        tokenStruct,
        businessLogicResolverAddress,
        grantKYCToOriginalSender = false,
        useEnvironment = false,
    }: DeployStableCoinCommandParams) {
        this.wallet = wallet
        this.tokenStruct = tokenStruct
        this.businessLogicResolverAddress = businessLogicResolverAddress
        this.grantKYCToOriginalSender = grantKYCToOriginalSender
        this.useEnvironment = useEnvironment
    }

    public static async newInstance({
        signer,
        businessLogicResolverAddress,
        grantKYCToOriginalSender = false,
        tokenInformation,
        allToContract = true,
        reserveAddress = ADDRESS_ZERO,
        initialAmountDataFeed,
        createReserve = true,
        addKyc = false,
        addFeeSchedule = false,
        allRolesToCreator = true,
        rolesToAccount = '',
        initialMetadata = 'test',
        proxyAdminOwnerAccount = ADDRESS_ZERO,
        businessLogicResolverContractId,
        stableCoinConfigurationId,
        reserveConfigurationId,
        useEnvironment = false,
    }: DeployStableCoinCommandNewParams) {
        if (!signer.provider) {
            throw new SignerWithoutProviderError()
        }
        const signerAddress = await signer.getAddress()
        const wallet = await getFullWalletFromSigner(signer)

        const keys = allToContract
            ? tokenKeysToContract({ addKyc, addFeeSchedule })
            : tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: wallet.publicKey, isEd25519: false }))

        const tokenStruct: IStableCoinFactory.TokenStructStruct = {
            tokenName: tokenInformation.name,
            tokenSymbol: tokenInformation.symbol,
            tokenDecimals: tokenInformation.decimals ?? DEFAULT_DECIMALS,
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
            businessLogicResolverContractId,
            stableCoinConfigurationId,
            reserveConfigurationId,
        }

        return new DeployStableCoinCommand({
            wallet,
            tokenStruct,
            businessLogicResolverAddress,
            grantKYCToOriginalSender,
            useEnvironment,
        })
    }
}
