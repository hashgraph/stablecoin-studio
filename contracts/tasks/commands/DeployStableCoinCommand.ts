import { BigNumber } from 'ethers'
import { CONFIG_ID, DEFAULT_CONFIG_VERSION, DEFAULT_TOKEN } from 'scripts/constants'
import { WithSignerCommand, WithSignerCommandParams, WithSignerConstructorParams } from '@tasks'

interface DeployStableCoinCommandBaseParams {
    tokenName?: string
    tokenSymbol?: string
    tokenDecimals?: number
    tokenInitialSupply?: BigNumber
    tokenMaxSupply?: BigNumber
    tokenMemo?: string
    tokenFreeze?: boolean
    initialAmountDataFeed?: string
    createReserve?: boolean
    reserveAddress?: string
    allRolesToCreator?: boolean
    initialMetadata?: string
    rolesToAccount?: string
    addFeeSchedule?: boolean
    addKyc?: boolean
    stableCoinConfigurationIdKey?: string
    stableCoinConfigurationIdVersion?: number
    reserveConfigurationIdKey?: string
    reserveConfigurationIdVersion?: number
    businessLogicResolverProxyAddress: string
    stableCoinFactoryProxyAddress: string
    grantKYCToOriginalSender?: boolean
    useEnvironment?: boolean
}

interface DeployStableCoinCommandParams extends WithSignerCommandParams, DeployStableCoinCommandBaseParams {}

interface ConstructorParams extends WithSignerConstructorParams, DeployStableCoinCommandBaseParams {}

export default class DeployStableCoinCommand extends WithSignerCommand {
    public readonly tokenName?: string
    public readonly tokenSymbol?: string
    public readonly tokenDecimals?: number
    public readonly tokenInitialSupply?: BigNumber
    public readonly tokenMaxSupply?: BigNumber
    public readonly tokenMemo?: string
    public readonly tokenFreeze?: boolean
    public readonly initialAmountDataFeed?: string
    public readonly createReserve?: boolean
    public readonly reserveAddress?: string
    public readonly allRolesToCreator?: boolean
    public readonly rolesToAccount?: string
    public readonly initialMetadata?: string
    public readonly addFeeSchedule?: boolean
    public readonly addKyc?: boolean
    public readonly stableCoinConfigurationIdKey?: string
    public readonly stableCoinConfigurationIdVersion?: number
    public readonly reserveConfigurationIdKey?: string
    public readonly reserveConfigurationIdVersion?: number
    public readonly businessLogicResolverProxyAddress: string
    public readonly stableCoinFactoryProxyAddress: string
    public readonly grantKYCToOriginalSender?: boolean
    public readonly useEnvironment?: boolean

    constructor({
        tokenName = DEFAULT_TOKEN.name,
        tokenSymbol = DEFAULT_TOKEN.symbol,
        tokenDecimals = DEFAULT_TOKEN.decimals,
        tokenInitialSupply = DEFAULT_TOKEN.initialSupply,
        tokenMaxSupply = DEFAULT_TOKEN.maxSupply,
        tokenMemo = DEFAULT_TOKEN.memo,
        tokenFreeze = DEFAULT_TOKEN.freeze,
        initialAmountDataFeed,
        createReserve,
        reserveAddress,
        allRolesToCreator,
        rolesToAccount,
        initialMetadata,
        addFeeSchedule,
        addKyc,
        stableCoinConfigurationIdKey = CONFIG_ID.stableCoin,
        stableCoinConfigurationIdVersion = DEFAULT_CONFIG_VERSION,
        reserveConfigurationIdKey = CONFIG_ID.reserve,
        reserveConfigurationIdVersion = DEFAULT_CONFIG_VERSION,
        businessLogicResolverProxyAddress,
        stableCoinFactoryProxyAddress,
        grantKYCToOriginalSender = false,
        useEnvironment = false,
        ...args
    }: ConstructorParams) {
        super(args)
        this.tokenName = tokenName
        this.tokenSymbol = tokenSymbol
        this.tokenDecimals = tokenDecimals
        this.tokenInitialSupply = tokenInitialSupply
        this.tokenMaxSupply = tokenMaxSupply
        this.tokenMemo = tokenMemo
        this.tokenFreeze = tokenFreeze
        this.initialAmountDataFeed = initialAmountDataFeed
        this.createReserve = createReserve
        this.reserveAddress = reserveAddress
        this.allRolesToCreator = allRolesToCreator
        this.rolesToAccount = rolesToAccount
        this.initialMetadata = initialMetadata
        this.addFeeSchedule = addFeeSchedule
        this.addKyc = addKyc
        this.stableCoinConfigurationIdKey = stableCoinConfigurationIdKey
        this.stableCoinConfigurationIdVersion = stableCoinConfigurationIdVersion
        this.reserveConfigurationIdKey = reserveConfigurationIdKey
        this.reserveConfigurationIdVersion = reserveConfigurationIdVersion
        this.businessLogicResolverProxyAddress = businessLogicResolverProxyAddress
        this.stableCoinFactoryProxyAddress = stableCoinFactoryProxyAddress
        this.grantKYCToOriginalSender = grantKYCToOriginalSender
        this.useEnvironment = useEnvironment
    }

    public static async newInstance(args: DeployStableCoinCommandParams): Promise<DeployStableCoinCommand> {
        const {
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenInitialSupply,
            tokenMaxSupply,
            tokenMemo,
            tokenFreeze,
            initialAmountDataFeed,
            createReserve,
            reserveAddress,
            allRolesToCreator,
            rolesToAccount,
            initialMetadata,
            addFeeSchedule,
            addKyc,
            stableCoinConfigurationIdKey,
            stableCoinConfigurationIdVersion,
            reserveConfigurationIdKey,
            reserveConfigurationIdVersion,
            businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress,
            grantKYCToOriginalSender,
            useEnvironment,
            ...signerArgs
        } = args
        const parentCommand = await WithSignerCommand.newInstance(signerArgs)
        return new DeployStableCoinCommand({
            tokenName,
            tokenSymbol,
            tokenDecimals,
            tokenInitialSupply,
            tokenMaxSupply,
            tokenMemo,
            tokenFreeze,
            initialAmountDataFeed,
            createReserve,
            reserveAddress,
            allRolesToCreator,
            rolesToAccount,
            initialMetadata,
            addFeeSchedule,
            addKyc,
            stableCoinConfigurationIdKey,
            stableCoinConfigurationIdVersion,
            reserveConfigurationIdKey,
            reserveConfigurationIdVersion,
            businessLogicResolverProxyAddress,
            stableCoinFactoryProxyAddress,
            grantKYCToOriginalSender,
            useEnvironment,
            ...parentCommand,
        })
    }
}
