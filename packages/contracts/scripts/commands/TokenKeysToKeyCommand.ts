import { BytesLike } from 'ethers'
import { BaseTokenKeysCommand, BaseTokenKeysCommandParams } from '@scripts'

interface TokenKeysToKeyCommandParams extends BaseTokenKeysCommandParams {
    publicKey: BytesLike
    isEd25519?: boolean
}

export default class TokenKeysToContractCommand extends BaseTokenKeysCommand {
    public readonly publicKey: BytesLike = '0x'
    public readonly isEd25519: boolean = false

    constructor({
        publicKey = '0x',
        isEd25519 = false,
        addKyc = true,
        addFeeSchedule = true,
    }: TokenKeysToKeyCommandParams) {
        super({ addKyc, addFeeSchedule })
        this.publicKey = publicKey
        this.isEd25519 = isEd25519
    }
}
