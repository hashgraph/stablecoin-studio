import {
    DeployScsContractsResult,
    BusinessLogicResolverProxyNotFound,
    BaseContractListCommand,
    BaseBlockchainCommandParams,
} from '@scripts'

interface RegisterDeployedContractBusinessLogicsCommandParams extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployScsContractsResult
}

export default class RegisterDeployedContractBusinessLogicsCommand extends BaseContractListCommand {
    constructor({ deployedContractList, signer, overrides }: RegisterDeployedContractBusinessLogicsCommandParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deployer, businessLogicResolver, ...contractListToRegister } = deployedContractList
        const contractAddressList = Object.values(contractListToRegister).map((contract) => contract.address)

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        super({
            contractAddressList,
            businessLogicResolverProxyAddress: businessLogicResolver.proxyAddress,
            signer,
            overrides,
        })
    }
    get deployedContractAddressList() {
        return this.contractAddressList
    }
}
