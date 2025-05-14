import { BigNumber, Wallet } from 'ethers'
import {
    DEFAULT_TOKEN,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    DeployFullInfrastructureResult,
    NUMBER_ZERO,
    tokenKeysToContract,
    TokenKeysToContractCommand,
} from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { IHederaTokenManager } from '@typechain-types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { configuration } from 'hardhat.config'
import { DeployedContract, NetworkName } from '@configuration'
import { computeAddress } from 'ethers/lib/utils'
export { GAS_LIMIT } from '@scripts'

export const AUTO_RENEW_PERIOD = BigNumber.from(7776000)
export const OTHER_AUTO_RENEW_PERIOD = BigNumber.from(7884000)
export const DEFAULT_UPDATE_TOKEN_STRUCT = {
    tokenName: DEFAULT_TOKEN.name,
    tokenSymbol: DEFAULT_TOKEN.symbol,
    keys: tokenKeysToContract(
        new TokenKeysToContractCommand({ addKyc: false })
    ) as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
    second: NUMBER_ZERO,
    autoRenewPeriod: AUTO_RENEW_PERIOD,
    tokenMetadataURI: '',
    initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed,
} as IHederaTokenManager.UpdateTokenStructStructOutput

let deployedResult: DeployFullInfrastructureResult | undefined

export async function deployFullInfrastructureInTests({
    signer,
    network,
    initialAmountDataFeed = DEFAULT_TOKEN.initialAmountDataFeed,
    allRolesToCreator,
    RolesToAccount,
    addFeeSchedule,
    grantKYCToOriginalSender,
    addKyc,
}: {
    signer: SignerWithAddress | Wallet
    network: NetworkName
    initialAmountDataFeed?: string
    allRolesToCreator?: boolean
    RolesToAccount?: string
    addFeeSchedule?: boolean
    grantKYCToOriginalSender?: boolean
    addKyc?: boolean
}) {
    const command = await DeployFullInfrastructureCommand.newInstance({
        signer,
        useDeployed: deployedResult ? true : false,
        tokenInformation: {
            name: DEFAULT_TOKEN.name,
            symbol: DEFAULT_TOKEN.symbol,
            decimals: DEFAULT_TOKEN.decimals,
            initialSupply: DEFAULT_TOKEN.initialSupply.toString(),
            maxSupply: DEFAULT_TOKEN.maxSupply.toString(),
            memo: DEFAULT_TOKEN.memo,
            freeze: false,
        },
        initialAmountDataFeed,
        allRolesToCreator,
        RolesToAccount,
        addFeeSchedule,
        grantKYCToOriginalSender,
        addKyc,
    })

    deployedResult = await deployFullInfrastructure(command)

    let newContracts = configuration.contracts
    newContracts.HederaTokenManager.addresses = {
        [network]: {
            address: deployedResult.hederaTokenManagerAddress,
        },
    } as Record<NetworkName, DeployedContract>
    newContracts.StableCoinFactory.addresses = {
        [network]: deployedResult.stableCoinFactoryDeployment,
    } as Record<NetworkName, DeployedContract>
    configuration.contracts = newContracts

    const { stableCoinDeployment, stableCoinFactoryDeployment } = deployedResult
    return {
        proxyAddress: stableCoinDeployment.proxyAddress,
        proxyAdminAddress: stableCoinDeployment.proxyAdminAddress,
        tokenAddress: stableCoinDeployment.tokenAddress,
        factoryProxyAddress: stableCoinFactoryDeployment.proxyAddress,
        factoryProxyAdminAddress: stableCoinFactoryDeployment.proxyAdminAddress,
        factoryAddress: stableCoinFactoryDeployment.address,
    }
}

export function randomAccountAddressList(length: number = 3): string[] {
    const addresses: string[] = []
    for (let i = 0; i < length; i++) {
        addresses.push(computeAddress(Wallet.createRandom().privateKey))
    }
    return addresses
}
