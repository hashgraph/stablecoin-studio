import {
    AllTokenKeysToKeyCommand,
    GenerateKeyTypeCommand,
    ROLES,
    TokenKeysToContractCommand,
    TokenKeysToKeyCommand,
} from '@scripts'
import { BytesLike, SigningKey, toBigInt } from 'ethers'

export interface KeysStruct {
    keyType: bigint
    publicKey: BytesLike
    isEd25519: boolean
}

export function tokenKeysToContract({
    addKyc,
    addFeeSchedule,
    addSupply,
    addWipe,
}: TokenKeysToContractCommand): KeysStruct[] {
    const keyType = generateKeyType(
        new GenerateKeyTypeCommand({
            kycKey: addKyc,
            freezeKey: true,
            wipeKey: addWipe ?? true,
            feeScheduleKey: addFeeSchedule,
            pauseKey: true,
            ignored: false,
        })
    )

    return [
        fixKeys(addSupply),
        {
            keyType: keyType,
            publicKey: '0x',
            isEd25519: false,
        },
    ]
}

export function tokenKeysToKey({ publicKey, isEd25519, addKyc, addFeeSchedule }: TokenKeysToKeyCommand): KeysStruct[] {
    const keyType = generateKeyType(
        new GenerateKeyTypeCommand({
            kycKey: addKyc,
            freezeKey: true,
            wipeKey: true,
            feeScheduleKey: addFeeSchedule,
            pauseKey: true,
            ignored: false,
        })
    )

    return [
        fixKeys(),
        {
            keyType: keyType,
            publicKey: isEd25519 ? publicKey : SigningKey.computePublicKey(publicKey, true),
            isEd25519,
        },
    ]
}

export function allTokenKeysToKey({
    publicKey,
    isEd25519,
    addKyc,
    addFeeSchedule,
}: AllTokenKeysToKeyCommand): KeysStruct[] {
    const keyType = generateKeyType({
        adminKey: true,
        kycKey: addKyc,
        freezeKey: true,
        wipeKey: true,
        supplyKey: true,
        feeScheduleKey: addFeeSchedule,
        pauseKey: true,
        ignored: false,
    })

    return [
        {
            keyType: keyType,
            publicKey,
            isEd25519,
        },
    ]
}

// TODO: this function should be moved to ???
export function rolesToAccounts({
    allToContract,
    allRolesToCreator,
    CreatorAccount,
    RolesToAccount,
}: {
    allToContract: boolean
    allRolesToCreator: boolean
    CreatorAccount: string
    RolesToAccount: string
}) {
    if (!allToContract) return []
    const RoleToAccount = allRolesToCreator ? CreatorAccount : RolesToAccount

    return [
        {
            role: ROLES.burn.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.pause.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.wipe.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.freeze.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.rescue.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.delete.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.kyc.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.customFees.hash,
            account: RoleToAccount,
        },
        {
            role: ROLES.hold.hash,
            account: RoleToAccount,
        },
    ]
}

function fixKeys(addSupply?: boolean): KeysStruct {
    const keyType = generateKeyType(
        new GenerateKeyTypeCommand({
            adminKey: true,
            supplyKey: addSupply ?? true,
        })
    )

    return {
        keyType: keyType,
        publicKey: '0x',
        isEd25519: false,
    }
}

/**
 * Generates a key type based on the provided boolean flags.
 * Each flag represents a specific key type and contributes to the final key type value.
 *
 * @param {Object} params - The parameters object.
 * @param {boolean} [params.adminKey=false] - Indicates if the admin key is present.
 * @param {boolean} [params.kycKey=false] - Indicates if the KYC key is present.
 * @param {boolean} [params.freezeKey=false] - Indicates if the freeze key is present.
 * @param {boolean} [params.wipeKey=false] - Indicates if the wipe key is present.
 * @param {boolean} [params.supplyKey=false] - Indicates if the supply key is present.
 * @param {boolean} [params.feeScheduleKey=false] - Indicates if the fee schedule key is present.
 * @param {boolean} [params.pauseKey=false] - Indicates if the pause key is present.
 * @param {boolean} [params.ignored=false] - Indicates if the key is ignored.
 * @returns {number} The generated key type as a number.
 */
function generateKeyType({
    adminKey,
    kycKey,
    freezeKey,
    wipeKey,
    supplyKey,
    feeScheduleKey,
    pauseKey,
    ignored,
}: GenerateKeyTypeCommand) {
    const number =
        (adminKey ? 1 : 0) |
        (kycKey ? 2 : 0) |
        (freezeKey ? 4 : 0) |
        (wipeKey ? 8 : 0) |
        (supplyKey ? 16 : 0) |
        (feeScheduleKey ? 32 : 0) |
        (pauseKey ? 64 : 0) |
        (ignored ? 128 : 0)
    return toBigInt(number)
}
