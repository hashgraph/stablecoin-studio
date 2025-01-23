import { task, types } from 'hardhat/config'
import AddHederaTokenManagerVersionCommand from './commands/AddHederaTokenManagerVersionCommand'
import { StableCoinFactory__factory } from '@typechain'
import { GAS_LIMIT, MESSAGES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'

task('addHederaTokenManagerVersion', 'Add a new version TokenManager in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .addParam('tokenManagerAddress', 'The token manager address', undefined, types.string, false)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<AddHederaTokenManagerVersionCommand, keyof typeof hre>, hre) => {
        const { factoryProxyAddress, tokenManagerAddress, signer } =
            await AddHederaTokenManagerVersionCommand.newInstance({
                hre,
                ...args,
            })

        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, signer)
        const txResponse = await sCFactory.addHederaTokenManagerVersion(tokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.addHederaTokenManagerVersion,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse,
                confirmationEvent: 'HederaTokenManagerAddressAdded',
                errorMessage: MESSAGES.stableCoinFactory.error.addHederaTokenManagerVersion,
            })
        )

        console.log('TokenManager successfully added to proxy.')
    })
