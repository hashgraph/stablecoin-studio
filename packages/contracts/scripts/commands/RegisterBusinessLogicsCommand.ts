import { BaseContractListCommand, BaseContractListCommandParams } from '@scripts'

type RegisterBusinessLogicsCommandParams = BaseContractListCommandParams

export default class RegisterBusinessLogicsCommand extends BaseContractListCommand {
    constructor({
        contractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    }: RegisterBusinessLogicsCommandParams) {
        super({
            contractAddressList,
            businessLogicResolverProxyAddress,
            signer,
            overrides,
        })
    }

    get contractAddressListToRegister() {
        return this.contractAddressList
    }
}
