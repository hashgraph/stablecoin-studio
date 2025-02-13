import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Signer, Wallet } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'

export interface WithSignerCommandParams {
    hre: HardhatRuntimeEnvironment
    privateKey?: string
    signerAddress?: string
    signerPosition?: number
}

export interface WithSignerConstructorParams {
    signer: Signer
    address: string
    privateKey?: string
}

export default class WithSignerCommand {
    public readonly signer: Signer
    public readonly address: string
    public readonly privateKey?: string

    protected constructor({ signer, address, privateKey }: WithSignerConstructorParams) {
        this.signer = signer
        this.address = address
        this.privateKey = privateKey
    }

    public static async newInstance(args: WithSignerCommandParams): Promise<WithSignerCommand> {
        const {
            hre: { ethers },
            privateKey,
            signerAddress,
            signerPosition,
        } = args
        const signers = await ethers.getSigners()

        let signer: Signer = signers[0]
        if (privateKey) {
            signer = new Wallet(privateKey, ethers.provider)
        } else if (signerPosition) {
            signer = signers[signerPosition]
        } else if (signerAddress) {
            signer =
                signers.find((signer) => {
                    return keccak256(signer.address) === keccak256(signerAddress)
                }) ?? signers[0]
        }

        return new WithSignerCommand({ signer, address: await signer.getAddress(), privateKey })
    }
}
