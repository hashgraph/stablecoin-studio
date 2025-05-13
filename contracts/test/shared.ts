import { BigNumber, Wallet } from 'ethers'
import {
    addressToHederaId,
    DEFAULT_TOKEN,
    deployStableCoin,
    DeployStableCoinCommand,
    DeployStableCoinResult,
    NUMBER_ZERO,
    tokenKeysToContract,
    TokenKeysToContractCommand,
} from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { IHederaTokenManager } from '@typechain-types'
import { NetworkName } from '@configuration'
import { computeAddress } from 'ethers/lib/utils'
export { GAS_LIMIT } from '@scripts'

export const TOKEN_DECIMALS = 6
export const TOKEN_FACTOR = BigNumber.from(10).pow(TOKEN_DECIMALS)
export const AUTO_RENEW_PERIOD = BigNumber.from(7776000)
export const OTHER_AUTO_RENEW_PERIOD = BigNumber.from(7884000)
export const INIT_SUPPLY = BigNumber.from(100).mul(TOKEN_FACTOR)

// export const DEFAULT_UPDATE_TOKEN_STRUCT = {
//     tokenName: DEFAULT_TOKEN.name,
//     tokenSymbol: DEFAULT_TOKEN.symbol,
//     keys: tokenKeysToContract(
//         new TokenKeysToContractCommand({ addKyc: false })
//     ) as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
//     second: NUMBER_ZERO,
//     autoRenewPeriod: AUTO_RENEW_PERIOD,
//     tokenMetadataURI: '',
//     initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed,
// } as IHederaTokenManager.UpdateTokenStructStructOutput

let deployedResult: DeployStableCoinResult | undefined

export async function deployStableCoinInTests({
    signer,
    businessLogicResolverProxyAddress,
    stableCoinFactoryProxyAddress,
    network,
    initialAmountDataFeed = DEFAULT_TOKEN.initialAmountDataFeed,
    allRolesToCreator,
    rolesToAccount,
    addFeeSchedule,
    grantKYCToOriginalSender,
    addKyc,
}: {
    signer: SignerWithAddress | Wallet
    businessLogicResolverProxyAddress: string
    stableCoinFactoryProxyAddress: string
    network: NetworkName
    initialAmountDataFeed?: string
    allRolesToCreator?: boolean
    rolesToAccount?: string
    addFeeSchedule?: boolean
    grantKYCToOriginalSender?: boolean
    addKyc?: boolean
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
    })

    deployedResult = await deployStableCoin(command)

    return {
        stableCoinProxyAddress: await addressToHederaId({
            address: deployedResult.stableCoinProxyAddress,
            network,
        }),
        tokenAddress: await addressToHederaId({
            address: deployedResult.tokenAddress,
            network,
        }),
        reserveProxyAddress: deployedResult.reserveProxyAddress
            ? await addressToHederaId({
                  address: deployedResult.reserveProxyAddress,
                  network,
              })
            : undefined,
    }
}

export function randomAccountAddressList(length = 3): string[] {
    const addresses: string[] = []
    for (let i = 0; i < length; i++) {
        addresses.push(computeAddress(Wallet.createRandom().privateKey))
    }
    return addresses
}
