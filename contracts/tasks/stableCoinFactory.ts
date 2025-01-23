import { task, types } from 'hardhat/config'
import { StableCoinFactory__factory } from '@typechain'
import { GAS_LIMIT, MESSAGES, validateTxResponse, ValidateTxResponseCommand } from '@scripts'
import { AddHederaTokenManagerVersionCommand, EditHederaTokenManagerAddressCommand, GetTokenManagerQuery } from '@tasks'

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

task('editHederaTokenManagerAddress', 'Edit TokenManager address in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .addParam('tokenManagerAddress', 'The token manager address', undefined, types.string, false)
    .addParam('index', 'The index of the TokenManager to edit', undefined, types.int, false)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: Omit<EditHederaTokenManagerAddressCommand, keyof typeof hre>, hre) => {
        const { factoryProxyAddress, tokenManagerAddress, index, signer } =
            await EditHederaTokenManagerAddressCommand.newInstance({
                hre,
                ...args,
            })

        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, signer)
        const txResponse = await sCFactory.editHederaTokenManagerAddress(index, tokenManagerAddress, {
            gasLimit: GAS_LIMIT.stableCoinFactory.editHederaTokenManagerAddress,
        })
        await validateTxResponse(
            new ValidateTxResponseCommand({
                txResponse,
                confirmationEvent: 'HederaTokenManagerAddressEdited',
                errorMessage: MESSAGES.stableCoinFactory.error.editHederaTokenManagerAddress,
            })
        )
        console.log(MESSAGES.stableCoinFactory.success.editHederaTokenManagerAddress)
    })

task('getTokenManager', 'Get TokenManager list in factory')
    .addParam('factoryProxyAddress', 'The proxy factory address', undefined, types.string, false)
    .setAction(async ({ factoryProxyAddress }: GetTokenManagerQuery, hre) => {
        const sCFactory = StableCoinFactory__factory.connect(factoryProxyAddress, hre.ethers.provider)
        const tokenManagerAddressList: string[] = await sCFactory.getHederaTokenManagerAddress({
            gasLimit: GAS_LIMIT.stableCoinFactory.getHederaTokenManagerAddress,
        })
        console.log(
            `TokenManager list in factory ${factoryProxyAddress}:\n${tokenManagerAddressList
                .map((address, index) => `${index + 1}. ${address}`)
                .join('\n')}`
        )
    })
