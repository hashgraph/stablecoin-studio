import { task, types } from 'hardhat/config'
import { CreateConfigurationCommand } from '@tasks'
import {
    BusinessLogicResolver__factory,
    HederaReserveFacet__factory,
    BurnableFacet__factory,
    CashInFacet__factory,
    CustomFeesFacet__factory,
    DeletableFacet__factory,
    FreezableFacet__factory,
    HoldManagementFacet__factory,
    KYCFacet__factory,
    PausableFacet__factory,
    ReserveFacet__factory,
    RoleManagementFacet__factory,
    RolesFacet__factory,
    SupplierAdminFacet__factory,
    TokenOwnerFacet__factory,
    WipeableFacet__factory,
    DiamondFacet__factory,
    HederaTokenManagerFacet__factory,
    RescuableFacet__factory,
    StableCoinFactoryFacet__factory,
} from '@typechain'
import { CONTRACT_NAMES } from '@configuration'

task('createConfiguration', 'Create a new configuration')
    .addParam('resolverAddress', 'The resolver address', undefined, types.string)
    .addParam('factoryAddress', 'The factory addresses', undefined, types.string)
    .addParam('reserveAddress', 'The hedera reserve addresses', undefined, types.string)
    .addVariadicPositionalParam('scsContracts', 'The SCS contract addresses', undefined, types.string)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signeraddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerposition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: CreateConfigurationCommand, hre) => {
        const { createConfigurationsForDeployedContracts, CreateConfigurationsForDeployedContractsCommand } =
            await import('@scripts')
        console.log(`Executing createConfiguration on ${hre.network.name} ...`)

        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

        const { resolverAddress, factoryAddress, reserveAddress, scsContracts, signer } =
            await CreateConfigurationCommand.newInstance({
                hre,
                ...args,
            })

        const deployedContracts = {
            businessLogicResolver: {
                name: CONTRACT_NAMES[3],
                address: ADDRESS_ZERO,
                contract: BusinessLogicResolver__factory.connect(ADDRESS_ZERO, signer),
                proxyAddress: resolverAddress,
            },
            diamondFacet: {
                name: CONTRACT_NAMES[4],
                address: scsContracts[0],
                contract: DiamondFacet__factory.connect(scsContracts[0], signer),
            },
            stableCoinFactoryFacet: {
                name: CONTRACT_NAMES[5],
                address: factoryAddress,
                contract: StableCoinFactoryFacet__factory.connect(factoryAddress, signer),
            },
            hederaTokenManagerFacet: {
                name: CONTRACT_NAMES[6],
                address: scsContracts[1],
                contract: HederaTokenManagerFacet__factory.connect(scsContracts[1], signer),
            },
            hederaReserveFacet: {
                name: CONTRACT_NAMES[7],
                address: reserveAddress,
                contract: HederaReserveFacet__factory.connect(reserveAddress, signer),
            },
            burnableFacet: {
                name: CONTRACT_NAMES[8],
                address: scsContracts[2],
                contract: BurnableFacet__factory.connect(scsContracts[2], signer),
            },
            cashInFacet: {
                name: CONTRACT_NAMES[9],
                address: scsContracts[3],
                contract: CashInFacet__factory.connect(scsContracts[3], signer),
            },
            customFeesFacet: {
                name: CONTRACT_NAMES[10],
                address: scsContracts[4],
                contract: CustomFeesFacet__factory.connect(scsContracts[4], signer),
            },
            deletableFacet: {
                name: CONTRACT_NAMES[11],
                address: scsContracts[5],
                contract: DeletableFacet__factory.connect(scsContracts[5], signer),
            },
            freezableFacet: {
                name: CONTRACT_NAMES[12],
                address: scsContracts[6],
                contract: FreezableFacet__factory.connect(scsContracts[6], signer),
            },
            holdManagementFacet: {
                name: CONTRACT_NAMES[13],
                address: scsContracts[7],
                contract: HoldManagementFacet__factory.connect(scsContracts[7], signer),
            },
            kycFacet: {
                name: CONTRACT_NAMES[14],
                address: scsContracts[8],
                contract: KYCFacet__factory.connect(scsContracts[8], signer),
            },
            pausableFacet: {
                name: CONTRACT_NAMES[15],
                address: scsContracts[9],
                contract: PausableFacet__factory.connect(scsContracts[9], signer),
            },
            rescuableFacet: {
                name: CONTRACT_NAMES[16],
                address: scsContracts[10],
                contract: RescuableFacet__factory.connect(scsContracts[10], signer),
            },
            reserveFacet: {
                name: CONTRACT_NAMES[17],
                address: scsContracts[11],
                contract: ReserveFacet__factory.connect(scsContracts[11], signer),
            },
            roleManagementFacet: {
                name: CONTRACT_NAMES[18],
                address: scsContracts[12],
                contract: RoleManagementFacet__factory.connect(scsContracts[12], signer),
            },
            rolesFacet: {
                name: CONTRACT_NAMES[19],
                address: scsContracts[13],
                contract: RolesFacet__factory.connect(scsContracts[13], signer),
            },
            supplierAdminFacet: {
                name: CONTRACT_NAMES[20],
                address: scsContracts[14],
                contract: SupplierAdminFacet__factory.connect(scsContracts[14], signer),
            },
            tokenOwnerFacet: {
                name: CONTRACT_NAMES[21],
                address: scsContracts[15],
                contract: TokenOwnerFacet__factory.connect(scsContracts[15], signer),
            },
            wipeableFacet: {
                name: CONTRACT_NAMES[22],
                address: scsContracts[16],
                contract: WipeableFacet__factory.connect(scsContracts[16], signer),
            },
            deployer: signer,
        }

        await createConfigurationsForDeployedContracts(
            false,
            new CreateConfigurationsForDeployedContractsCommand({
                deployedContractList: deployedContracts,
                signer,
            })
        )

        console.log(`Configurations succesfully created`)
    })
