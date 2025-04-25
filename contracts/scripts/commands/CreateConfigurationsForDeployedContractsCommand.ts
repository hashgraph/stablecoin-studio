import {
    DeployScsContractsResult,
    BusinessLogicResolverProxyNotFound,
    BaseContractListCommand,
    BaseBlockchainCommandParams,
} from '../index'

interface CreateConfigurationsForDeployedContractsCommandParams extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployScsContractsResult
}

export default class CreateConfigurationsForDeployedContractsCommand extends BaseContractListCommand {
    constructor({ deployedContractList, signer, overrides }: CreateConfigurationsForDeployedContractsCommandParams) {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            deployer: _,
            businessLogicResolver,
            ...contractListToRegister
        } = deployedContractList

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        const contractAddressList = Object.values(contractListToRegister).map((contract) => contract.address)

        super({
            contractAddressList,
            businessLogicResolverProxyAddress: businessLogicResolver.proxyAddress,
            signer,
            overrides,
        })
    }
}
