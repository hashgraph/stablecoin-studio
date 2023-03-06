import { ContractId } from '@hashgraph/sdk'
import { task } from 'hardhat/config'
import { toHashgraphKey } from './deploy'
import { getClient } from './utils'
import { addHederaERC20Version } from './contractsMethods'


interface AccountHedera {
    account: string
    publicKey: string
    privateKey: string
    isED25519Type: string
}

task('addNewVersionERC20', "Add a new version ERC in factory")
    .addParam('erc20', 'The erc20 address')
    .addParam('proxyfactory', 'The proxy factory address')
    .setAction(
        async (
            { erc20, proxyfactory }: { erc20: string; proxyfactory: string },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as Array<unknown> as Array<AccountHedera>
            console.log(accounts[0].account)
            console.log(erc20, proxyfactory)
            const client = getClient(hre.network.name)

            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
                
            await addHederaERC20Version(
                ContractId.fromString(proxyfactory),
                client,
                ContractId.fromString(erc20).toSolidityAddress()
            )

            console.log('ERC20 successfully added to proxy.')
            
        }
    )
