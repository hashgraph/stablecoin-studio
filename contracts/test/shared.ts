import { BigNumber, Wallet } from 'ethers'
import {
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    DeployFullInfrastructureResult,
    NUMBER_ZERO,
    tokenKeysToContract,
    TokenKeysToContractCommand,
} from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { IHederaTokenManager, MockHtsBurn__factory } from '@typechain'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { configuration } from 'hardhat.config'
import { DeployedContract, NetworkName } from '@configuration'

export { GAS_LIMIT } from '@scripts'
export const TOKEN_DECIMALS = 6
export const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
export const TOKEN_NAME = 'MIDAS'
export const TOKEN_SYMBOL = 'MD'
export const TOKEN_FACTOR = BigNumber.from(10).pow(TOKEN_DECIMALS)
export const INIT_SUPPLY = BigNumber.from(100).mul(TOKEN_FACTOR)
export const MAX_SUPPLY = BigNumber.from(1_000).mul(TOKEN_FACTOR)
export const ONE_TOKEN = BigNumber.from(1).mul(TOKEN_FACTOR)
export const INITIAL_AMOUNT_DATA_FEED = INIT_SUPPLY.add(BigNumber.from(100_000)).toString()

export const AUTO_RENEW_PERIOD = BigNumber.from(7776000)
export const OTHER_AUTO_RENEW_PERIOD = BigNumber.from(7884000)
export const DEFAULT_UPDATE_TOKEN_STRUCT = {
    tokenName: TOKEN_NAME,
    tokenSymbol: TOKEN_SYMBOL,
    keys: tokenKeysToContract(
        new TokenKeysToContractCommand({ addKyc: false })
    ) as IHederaTokenManager.UpdateTokenStructStructOutput['keys'],
    second: NUMBER_ZERO,
    autoRenewPeriod: AUTO_RENEW_PERIOD,
    tokenMetadataURI: '',
} as IHederaTokenManager.UpdateTokenStructStructOutput

export async function deployPrecompiledHederaTokenServiceMock(
    hre: HardhatRuntimeEnvironment,
    signer: SignerWithAddress
) {
    // Impersonate the Hedera Token Service precompiled address
    await hre.network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0x0000000000000000000000000000000000000167'],
    })

    const mockedHederaTokenService = await new MockHtsBurn__factory(signer).deploy()
    await mockedHederaTokenService.deployed()
    // Force deployment to the target address
    const targetAddress = '0x0000000000000000000000000000000000000167'

    await hre.network.provider.send('hardhat_setCode', [
        targetAddress,
        await hre.ethers.provider.getCode(mockedHederaTokenService.address),
    ])

    console.log(`Mock contract deployed to ${targetAddress}`)
}

let deployedResult: DeployFullInfrastructureResult | undefined

export async function deployFullInfrastructureInTests({
    signer,
    network,
    initialAmountDataFeed = INITIAL_AMOUNT_DATA_FEED,
    allRolesToCreator,
    RolesToAccount,
    addFeeSchedule,
}: {
    signer: SignerWithAddress | Wallet
    network: NetworkName
    initialAmountDataFeed?: string
    allRolesToCreator?: boolean
    RolesToAccount?: string
    addFeeSchedule?: boolean
}) {
    const command = await DeployFullInfrastructureCommand.newInstance({
        signer,
        useDeployed: deployedResult ? true : false,
        tokenInformation: {
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            freeze: false,
        },
        initialAmountDataFeed,
        allRolesToCreator,
        RolesToAccount,
        addFeeSchedule,
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

    const { stableCoinDeployment } = deployedResult
    return {
        proxyAddress: stableCoinDeployment.proxyAddress,
        tokenAddress: stableCoinDeployment.tokenAddress,
    }
}
