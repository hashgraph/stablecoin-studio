import { deployContractsWithSDK } from './utils'

async function main() {
    deployContractsWithSDK('TOKEN', 'TK', 2, 0, 100_000, 'memo',false)
}

main()
 