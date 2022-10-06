import { deployContractsWithSDK } from './utils'

async function main() {
    deployContractsWithSDK('TOKEN', 'TK', 2, 0, 100_000, false)
}

main()
