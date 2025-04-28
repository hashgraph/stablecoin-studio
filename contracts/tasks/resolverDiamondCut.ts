import { task, types } from 'hardhat/config'
import { CreateConfigurationCommand, CreateConfigurationCommandBaseParams } from '@tasks'
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
} from '@typechain'

task('createConfiguration', 'Create a new configuration')
    .addPositionalParam('resolverAddress', 'The resolver proxy admin address', undefined, types.string)
    .addPositionalParam('facetsAddress', 'The facets addressess', undefined, types.string)
    .addOptionalParam('privatekey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signeraddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerposition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: CreateConfigurationCommandBaseParams, hre) => {
        const { createConfigurationsForDeployedContracts, CreateConfigurationsForDeployedContractsCommand } =
            await import('@scripts')
        console.log(`Executing createConfiguration on ${hre.network.name} ...`)

        const { facetsAddressList, signer } = await CreateConfigurationCommand.newInstance({
            hre,
            ...args,
        })

        const deployedContracts = {
            businessLogicResolver: {
                address: args.resolverAddress,
                contract: BusinessLogicResolver__factory.connect(args.resolverAddress, signer),
                proxyAddress: args.resolverAddress,
            },
            hederaReserveFacet: {
                address: facetsAddressList[0],
                contract: HederaReserveFacet__factory.connect(facetsAddressList[0], signer),
            },
            burnableFacet: {
                address: facetsAddressList[1],
                contract: BurnableFacet__factory.connect(facetsAddressList[1], signer),
            },
            cashInFacet: {
                address: facetsAddressList[2],
                contract: CashInFacet__factory.connect(facetsAddressList[2], signer),
            },
            customFeesFacet: {
                address: facetsAddressList[3],
                contract: CustomFeesFacet__factory.connect(facetsAddressList[3], signer),
            },
            deletableFacet: {
                address: facetsAddressList[4],
                contract: DeletableFacet__factory.connect(facetsAddressList[4], signer),
            },
            freezableFacet: {
                address: facetsAddressList[5],
                contract: FreezableFacet__factory.connect(facetsAddressList[5], signer),
            },
            holdManagementFacet: {
                address: facetsAddressList[6],
                contract: HoldManagementFacet__factory.connect(facetsAddressList[6], signer),
            },
            kycFacet: {
                address: facetsAddressList[7],
                contract: KYCFacet__factory.connect(facetsAddressList[7], signer),
            },
            pausableFacet: {
                address: facetsAddressList[8],
                contract: PausableFacet__factory.connect(facetsAddressList[8], signer),
            },
            reserveFacet: {
                address: facetsAddressList[9],
                contract: ReserveFacet__factory.connect(facetsAddressList[9], signer),
            },
            roleManagementFacet: {
                address: facetsAddressList[10],
                contract: RoleManagementFacet__factory.connect(facetsAddressList[10], signer),
            },
            rolesFacet: {
                address: facetsAddressList[11],
                contract: RolesFacet__factory.connect(facetsAddressList[11], signer),
            },
            supplierAdminFacet: {
                address: facetsAddressList[12],
                contract: SupplierAdminFacet__factory.connect(facetsAddressList[12], signer),
            },
            tokenOwnerFacet: {
                address: facetsAddressList[13],
                contract: TokenOwnerFacet__factory.connect(facetsAddressList[13], signer),
            },
            wipeableFacet: {
                address: facetsAddressList[14],
                contract: WipeableFacet__factory.connect(facetsAddressList[14], signer),
            },
            diamondFacet: {
                address: facetsAddressList[15],
                contract: DiamondFacet__factory.connect(facetsAddressList[15], signer),
            },
            deployer: signer,
        }

        await createConfigurationsForDeployedContracts(
            true,
            new CreateConfigurationsForDeployedContractsCommand({
                deployedContractList: deployedContracts,
                signer,
            })
        )

        console.log(`createConfiguration on ${hre.network.name} succesfully completed`)
    })
