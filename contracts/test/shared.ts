import { BigNumber } from 'ethers'
import { deployFullInfrastructure, DeployFullInfrastructureCommand } from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockHtsBurn__factory } from '@typechain'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

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

export async function deployFullInfrastructureInTests({
    signer,
    addFeeSchedule,
}: {
    signer: SignerWithAddress
    addFeeSchedule?: boolean
}) {
    const command = await DeployFullInfrastructureCommand.newInstance({
        signer,
        useDeployed: false,
        tokenInformation: {
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            freeze: false,
        },
        initialAmountDataFeed: INITIAL_AMOUNT_DATA_FEED,
        addFeeSchedule,
    })

    const { stableCoinDeployment } = await deployFullInfrastructure(command)
    return {
        proxyAddress: stableCoinDeployment.proxyAddress,
        tokenAddress: stableCoinDeployment.tokenAddress,
    }
}
