import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Network } from '@configuration'
import { IStableCoinFactory } from '@typechain'
import { ADDRESS_ZERO, NUMBER_ZERO } from 'scripts/constants'
import {
    SignerWithoutProviderError,
    TokenKeysToKeyCommand,
    getFullWalletFromSigner,
    rolesToAccounts,
    tokenKeysToKey,
    tokenKeystoContract,
} from '@scripts'
import { Wallet } from 'ethers'

export interface TokenInformation {
    name: string
    symbol: string
    decimals: number
    initialSupply: string
    maxSupply?: string
    memo: string
    freeze: boolean
}

interface DeployFullInfrastructureCommandParamsCommmon {
    useDeployed?: boolean
    grantKYCToOriginalSender?: boolean
}

interface DeployFullInfrastructureCommandNewParams extends DeployFullInfrastructureCommandParamsCommmon {
    signer: SignerWithAddress
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
    network: Network
    tokenStruct: IStableCoinFactory.TokenStructStruct
}

export default class DeployFullInfrastructureCommand {
    public readonly wallet: Wallet
    public readonly network: Network
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
        const network = (await signer.provider.getNetwork()).name as Network
        const wallet = await getFullWalletFromSigner(signer)

        const keys = allToContract
            ? tokenKeystoContract({ addKyc, addFeeSchedule })
            : tokenKeysToKey(new TokenKeysToKeyCommand({ publicKey: wallet.publicKey, isEd25519: false }))

        const tokenStruct = {
            tokenName: tokenInformation.name,
            tokenSymbol: tokenInformation.symbol,
            tokenDecimals: tokenInformation.decimals,
            tokenInitialSupply: tokenInformation.initialSupply,
            supplyType: tokenInformation.maxSupply ? true : false, // true = FINITE, false = INFINITE (default)
            tokenMaxSupply: tokenInformation.maxSupply || NUMBER_ZERO,
            freeze: tokenInformation.freeze,
            reserveAddress,
            reserveInitialAmount: initialAmountDataFeed,
            createReserve,
            keys: keys.map((key) => ({
                keyType: key.keyType,
                publicKey: key.publicKey,
                isED25519: key.isEd25519,
            })),
            roles: rolesToAccounts({
                allToContract,
                allRolesToCreator,
                CreatorAccount: signer.address,
                RolesToAccount,
            }),
            cashinRole: {
                account: allToContract ? (allRolesToCreator ? signer.address : RolesToAccount) : ADDRESS_ZERO,
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
