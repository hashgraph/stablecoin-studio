import { BigNumber } from 'ethers'
import { deployFullInfrastructure, DeployFullInfrastructureCommand } from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

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

export const deployFullInfrastructureInTests = async (signer: SignerWithAddress) => {
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
    })

    const {
        stableCoinDeployment: { proxyAddress },
    } = await deployFullInfrastructure(command)
    return proxyAddress
}
