import { task, types } from 'hardhat/config'
import { NetworkName } from '@configuration'
import { DeployAllCommand } from '@tasks'

task(
    'deployAll',
    'Deploy new factory, new facet implementation, new resolver and initialize it with the new facet implementations'
)
    .addOptionalParam('useDeployed', 'Use already deployed contracts', true, types.boolean)
    .addOptionalParam('partialBatchDeploy', 'Use partial batch deploy', false, types.boolean)
    .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
    .addOptionalParam(
        'signerAddress',
        'The address of the signer to select from the Hardhat signers array',
        undefined,
        types.string
    )
    .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
    .setAction(async (args: DeployAllCommand, hre) => {
        // Inlined to avoid circular dependency
        const { deployFullInfrastructure, DeployFullInfrastructureCommand, addresstoHederaId } = await import(
            '@scripts'
        )
        const { useDeployed, partialBatchDeploy, signer } = await (DeployAllCommand.newInstance({
            ...args,
            hre,
        }) as Promise<DeployAllCommand>) // TODO: check why this is needed
        console.log(`Executing deployAll on ${hre.network.name} ...`)

        // * Deploy the full infrastructure
        const result = await deployFullInfrastructure(
            new DeployFullInfrastructureCommand({
                signer: signer,
                network: hre.network.name as NetworkName,
                useDeployed: useDeployed,
                useEnvironment: false,
                partialBatchDeploy: partialBatchDeploy,
            })
        )

        result.businessLogicResolver
        result.stableCoinFactoryFacet
        result.hederaTokenManagerFacet
        result.diamondFacet
        result.reserveFacet
        result.burnableFacet
        result.cashInFacet
        result.customFeesFacet
        result.deletableFacet
        result.freezableFacet
        result.hederaReserveFacet
        result.kycFacet
        result.holdManagementFacet
        result.pausableFacet
        result.rescuableFacet
        result.roleManagementFacet
        result.rolesFacet
        result.supplierAdminFacet
        result.tokenOwnerFacet
        result.wipeableFacet

        // * Display the deployed addresses
        const addressList = {
            'Business Logic Resolver Proxy': result.businessLogicResolver.proxyAddress,
            'Business Logic Resolver Proxy Admin': result.businessLogicResolver.proxyAdminAddress,
            'Business Logic Resolver': result.businessLogicResolver.address,
            'Stable Coin Factory Facet': result.stableCoinFactoryFacet.address,
            'Hedera Token Manager Facet': result.hederaTokenManagerFacet.address,
            'Diamond Facet': result.diamondFacet.address,
            'Reserve Facet': result.reserveFacet.address,
            'Burnable Facet': result.burnableFacet.address,
            'Cash In Facet': result.cashInFacet.address,
            'Custom Fees Facet': result.customFeesFacet.address,
            'Deletable Facet': result.deletableFacet.address,
            'Freezable Facet': result.freezableFacet.address,
            'Hedera Reserve Facet': result.hederaReserveFacet.address,
            'KYC Facet': result.kycFacet.address,
            'Hold Management Facet': result.holdManagementFacet.address,
            'Pausable Facet': result.pausableFacet.address,
            'Rescuable Facet': result.rescuableFacet.address,
            'Role Management Facet': result.roleManagementFacet.address,
            'Roles Facet': result.rolesFacet.address,
            'Supplier Admin Facet': result.supplierAdminFacet.address,
            'Token Owner Facet': result.tokenOwnerFacet.address,
            'Wipeable Facet': result.wipeableFacet.address,
        }

        console.log('\n 🟢 Deployed SCS Contract List:')
        for (const [key, address] of Object.entries(addressList)) {
            if (!address) {
                continue
            }
            const contractId = await addresstoHederaId({
                address,
                network: hre.network.name as NetworkName,
            })
            console.log(`   --> ${key}: ${address} (${contractId})`)
        }
    })

// task('deploy', 'Deploy new contract')
//     .addPositionalParam('contractName', 'The name of the contract to deploy', undefined, types.string)
//     .addOptionalParam('privateKey', 'The private key of the account in raw hexadecimal format', undefined, types.string)
//     .addOptionalParam(
//         'signerAddress',
//         'The address of the signer to select from the Hardhat signers array',
//         undefined,
//         types.string
//     )
//     .addOptionalParam('signerPosition', 'The index of the signer in the Hardhat signers array', undefined, types.int)
//     .setAction(async (args: DeployArgs, hre) => {
//         // Inlined to avoid circular dependency
//         const { deployContract, DeployContractCommand, addressListToHederaIdList } = await import('@scripts')
//         const network = hre.network.name as Network
//         console.log(`Executing deploy on ${network} ...`)
//         if (!CONTRACT_NAMES.includes(args.contractName as ContractName)) {
//             throw new Error(`Contract name ${args.contractName} is not in the list of deployable contracts`)
//         }
//         const contractName = args.contractName as ContractName
//         const { signer }: GetSignerResult = await hre.run('getSigner', {
//             privateKey: args.privateKey,
//             signerAddress: args.signerAddress,
//             signerPosition: args.signerPosition,
//         })
//         console.log(`Using signer: ${signer.address}`)
//         // * Deploy the contract
//         const { proxyAdminAddress, proxyAddress, address } = await deployContract(
//             new DeployContractCommand({
//                 name: contractName,
//                 signer,
//             })
//         )

//         const [contractId, proxyContractId, proxyAdminContractId] = await addressListToHederaIdList({
//             addressList: [address, proxyAddress, proxyAdminAddress].filter((addr): addr is string => !!addr),
//             network,
//         })

//         console.log('\n 🟢 Deployed Contract:')
//         if (proxyAdminAddress) {
//             console.log(`Proxy Admin: ${proxyAdminAddress} (${proxyAdminContractId})`)
//         }
//         if (proxyAddress) {
//             console.log(`Proxy: ${proxyAddress} (${proxyContractId})`)
//         }
//         console.log(`Implementation: ${address} (${contractId}) for ${contractName}`)
//     })
