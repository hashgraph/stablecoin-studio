import { Signer, Wallet } from 'ethers'
import { DEFAULT_DECIMALS, NetworkName, NetworkNameByChainId } from '@configuration'
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
import { NetworkChainId } from '@configuration'

export interface TokenInformation {
    name: string
    symbol: string
    decimals?: number
    initialSupply: string
    maxSupply?: string
    memo: string
    freeze: boolean
}

interface DeployFullInfrastructureCommandParamsCommmon {
    useDeployed?: boolean
    grantKYCToOriginalSender?: boolean
}

export interface DeployFullInfrastructureCommandNewParams extends DeployFullInfrastructureCommandParamsCommmon {
    signer: Signer
    tokenInformation: TokenInformation
    allToContract?: boolean
    reserveAddress?: string
    initialAmountDataFeed?: string
    createReserve?: boolean
    addKyc?: boolean
    addFeeSchedule?: boolean
    allRolesToCreator?: boolean
    RolesToAccount?: string
    initialMetadata?: string
    proxyAdminOwnerAccount?: string
}

interface DeployFullInfrastructureCommandParams extends DeployFullInfrastructureCommandParamsCommmon {
    wallet: Wallet
    network: NetworkName
    tokenStruct: IStableCoinFactory.TokenStructStruct
}

export default class DeployFullInfrastructureCommand {
    public readonly wallet: Wallet
    public readonly network: NetworkName
    public readonly tokenStruct: IStableCoinFactory.TokenStructStruct
    public readonly useDeployed: boolean = true
    public readonly grantKYCToOriginalSender: boolean = false

    constructor({
        wallet,
        network,
        tokenStruct,
        useDeployed = true,
        grantKYCToOriginalSender = false,
    }: DeployFullInfrastructureCommandParams) {
        this.wallet = wallet
        this.network = network
        this.tokenStruct = tokenStruct
        this.useDeployed = useDeployed
        this.grantKYCToOriginalSender = grantKYCToOriginalSender
    }

    public static async newInstance({
        signer,
        useDeployed = true,
        grantKYCToOriginalSender = false,
        tokenInformation,
        allToContract = true,
        reserveAddress = ADDRESS_ZERO,
        initialAmountDataFeed = tokenInformation.initialSupply,
        createReserve = true,
        addKyc = false,
        addFeeSchedule = false,
        allRolesToCreator = true,
        RolesToAccount = '',
        initialMetadata = 'test',
        proxyAdminOwnerAccount = ADDRESS_ZERO,
    }: DeployFullInfrastructureCommandNewParams) {
        if (!signer.provider) {
            throw new SignerWithoutProviderError()
        }
        const signerAddress = await signer.getAddress()
        const network = NetworkNameByChainId[(await signer.provider.getNetwork()).chainId as NetworkChainId]
        const wallet = await getFullWalletFromSigner(signer)

        const keys = allToContract
            ? tokenKeysToContract({ addKyc, addFeeSchedule })
            : tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: wallet.publicKey, isEd25519: false }))

        const tokenStruct = {
            tokenName: tokenInformation.name,
            tokenSymbol: tokenInformation.symbol,
            tokenDecimals: tokenInformation.decimals ?? DEFAULT_DECIMALS,
            tokenInitialSupply: tokenInformation.initialSupply,
            supplyType: tokenInformation.maxSupply ? true : false, // true = FINITE, false = INFINITE (default)
            tokenMaxSupply: tokenInformation.maxSupply ?? NUMBER_ZERO,
            freeze: tokenInformation.freeze,
            reserveAddress,
            reserveInitialAmount: initialAmountDataFeed,
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
                RolesToAccount,
            }),
            cashinRole: {
                account: allToContract ? (allRolesToCreator ? signerAddress : RolesToAccount) : ADDRESS_ZERO,
                allowance: NUMBER_ZERO,
            },
            metadata: initialMetadata,
            proxyAdminOwnerAccount,
        }

        return new DeployFullInfrastructureCommand({
            useDeployed,
            wallet,
            network,
            tokenStruct,
            grantKYCToOriginalSender,
        })
    }
}
