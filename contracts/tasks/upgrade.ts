// TODO: BBND-553

// task('getProxyAdminconfig', 'Get Proxy Admin owner and implementation')
//     .addParam('proxyadmin', 'The proxy admin address')
//     .addParam('proxy', 'The proxy address')
//     .setAction(
//         async (
//             {
//                 proxyadmin,
//                 proxy,
//             }: {
//                 proxyadmin: string
//                 proxy: string
//             },
//             hre
//         ) => {
//             const accounts = hre.network.config.accounts as unknown as Array<AccountHedera>
//             const client = getClient(hre.network.name)
//             const clientOneAccount: string = accounts[0].account
//             const clientOnePrivateKey: string = accounts[0].privateKey
//             const clientOneIsED25519: boolean = accounts[0].isED25519Type === 'true'

//             client.setOperator(clientOneAccount, toHashgraphKey(clientOnePrivateKey, clientOneIsED25519))
//             console.log(hre.network.name)
//             const owner = await evmToHederaFormat(await owner_SCF(ContractId.fromString(proxyadmin), client))

//             const pendingQwner = await evmToHederaFormat(
//                 await pendingOwner_SCF(ContractId.fromString(proxyadmin), client)
//             )

//             const implementation = await evmToHederaFormat(
//                 await getProxyImplementation_SCF(
//                     ContractId.fromString(proxyadmin),
//                     client,
//                     ContractId.fromString(proxy).toSolidityAddress()
//                 )
//             )

//             console.log(
//                 'Owner : ' + owner + '. Pending owner : ' + pendingQwner + '. Implementation : ' + implementation
//             )
//         }
//     )

// task('updateFactoryVersion', 'Update factory version')
//     .addParam('proxyadmin', 'The proxy admin address')
//     .addParam('transparentproxy', 'The transparent proxy address')
//     .addParam('implementation', 'The new implementation')
//     .setAction(
//         async (
//             {
//                 proxyadmin,
//                 transparentproxy,
//                 implementation,
//             }: {
//                 proxyadmin: string
//                 transparentproxy: string
//                 implementation: string
//             },
//             hre
//         ) => {
//             const accounts = hre.network.config.accounts as unknown as Array<AccountHedera>
//             const client = getClient(hre.network.name)
//             const clientOneAccount: string = accounts[0].account
//             const clientOnePrivateKey: string = accounts[0].privateKey
//             const clientOneIsED25519: boolean = accounts[0].isED25519Type === 'true'

//             client.setOperator(clientOneAccount, toHashgraphKey(clientOnePrivateKey, clientOneIsED25519))
//             console.log(hre.network.name)

//             await updateProxy(client, proxyadmin, transparentproxy, implementation)

//             await getProxyImpl(client, proxyadmin, transparentproxy)
//         }
//     )
