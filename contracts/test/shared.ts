import { ethers, network } from 'hardhat'
import { computeAddress, Wallet } from 'ethers'
import {
    DEFAULT_TOKEN,
    deployStableCoin,
    DeployStableCoinCommand,
    DeployStableCoinResult,
    NUMBER_ZERO,
    tokenKeysToContract,
    TokenKeysToContractCommand,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    DeployFullInfrastructureResult,
    HEDERA_PRECOMPILED_ADDRESS,
} from '@scripts'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { IHederaTokenManager } from '@contracts'

export { GAS_LIMIT } from '@scripts'

export const AUTO_RENEW_PERIOD = 7776000n
export const OTHER_AUTO_RENEW_PERIOD = 7884000n
export const DEFAULT_UPDATE_TOKEN_STRUCT = {
    tokenName: DEFAULT_TOKEN.name,
    tokenSymbol: DEFAULT_TOKEN.symbol,
    keys: tokenKeysToContract(
        new TokenKeysToContractCommand({ addKyc: false })
    ) as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
    second: NUMBER_ZERO,
    autoRenewPeriod: AUTO_RENEW_PERIOD,
    tokenMetadataURI: '',
} as IHederaTokenManager.UpdateTokenStructStructOutput

let deployedResult: DeployStableCoinResult | undefined

export async function deployFullInfrastructureInTests(
    command: DeployFullInfrastructureCommand,
    anyAccountBalance = 0
): Promise<DeployFullInfrastructureResult> {

    if (network.name == 'hardhat') {
      // * Deploy precompiled mock
      await deployPrecompiledMock(anyAccountBalance)
    }

    return await deployFullInfrastructure(command)
}

export async function deployPrecompiledMock(anyAccountBalance = 0) {
    const PrecompiledMock = await ethers.getContractFactory('PrecompiledMock')
    const precompiledMock = await PrecompiledMock.deploy(anyAccountBalance)
    const runtimeBytecode = await ethers.provider.getCode(await precompiledMock.getAddress())
    await ethers.provider.send('hardhat_setCode', [HEDERA_PRECOMPILED_ADDRESS, runtimeBytecode])
    const mockPrecompiled = await ethers.getContractAt('PrecompiledMock', HEDERA_PRECOMPILED_ADDRESS)
}

export async function deployStableCoinInTests({
    signer,
    businessLogicResolverProxyAddress,
    stableCoinFactoryProxyAddress,
    initialAmountDataFeed = DEFAULT_TOKEN.initialAmountDataFeed,
    allRolesToCreator,
    rolesToAccount,
    addFeeSchedule,
    grantKYCToOriginalSender,
    addKyc,
    addSupply,
    addWipe,
}: {
    signer: SignerWithAddress | Wallet
    businessLogicResolverProxyAddress: string
    stableCoinFactoryProxyAddress: string
    initialAmountDataFeed?: string
    allRolesToCreator?: boolean
    rolesToAccount?: string
    addFeeSchedule?: boolean
    grantKYCToOriginalSender?: boolean
    addKyc?: boolean
    addSupply?: boolean
    addWipe?: boolean
}) {
    const command = await DeployStableCoinCommand.newInstance({
        signer,
        businessLogicResolverProxyAddress,
        stableCoinFactoryProxyAddress,
        useEnvironment: deployedResult ? true : false,
        tokenInformation: {
            name: DEFAULT_TOKEN.name,
            symbol: DEFAULT_TOKEN.symbol,
            decimals: DEFAULT_TOKEN.decimals,
            initialSupply: DEFAULT_TOKEN.initialSupply,
            maxSupply: DEFAULT_TOKEN.maxSupply,
            memo: DEFAULT_TOKEN.memo,
            freeze: false,
        },
        initialAmountDataFeed,
        allRolesToCreator,
        rolesToAccount,
        addFeeSchedule,
        grantKYCToOriginalSender,
        addKyc,
        addSupply,
        addWipe,
    })

    deployedResult = await deployStableCoin(command)

    return {
        stableCoinProxyAddress: deployedResult.stableCoinProxyAddress,
        tokenAddress: deployedResult.tokenAddress,
        reserveProxyAddress: deployedResult.reserveProxyAddress,
    }
}

export function randomAccountAddressList(length = 3): string[] {
    const addresses: string[] = []
    for (let i = 0; i < length; i++) {
        addresses.push(computeAddress(Wallet.createRandom().privateKey))
    }
    return addresses
}
