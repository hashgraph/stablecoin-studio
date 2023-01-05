const {
    AccountId,
    AccountBalanceQuery,
    TransferTransaction,
    HbarUnit,
    Hbar,
} = require('@hashgraph/sdk')

import {
    HederaERC20__factory,
    HederaERC20Proxy__factory,
    HederaERC20ProxyAdmin__factory,
    StableCoinFactoryProxy__factory,
    StableCoinFactoryProxyAdmin__factory,
} from '../typechain-types'

import { contractCall, toEvmAddress } from './utils'
import { Gas1, Gas2, Gas3, Gas4, Gas5, Gas6 } from './constants'

import { BigNumber } from 'ethers'

export async function getHBARBalanceOf(
    Id: string,
    client: any,
    isAccount = true,
    isSolidityAddress = false
): Promise<any> {
    const IdToQuery = isSolidityAddress
        ? AccountId.fromSolidityAddress(Id!).toString()
        : Id!
    const query = isAccount
        ? new AccountBalanceQuery().setAccountId(IdToQuery!)
        : new AccountBalanceQuery().setContractId(IdToQuery!)
    const Balance = await query.execute(client)

    return BigNumber.from(Balance.hbars.toTinybars().toString())
}

export async function transferHBAR(
    senderAccountId: string,
    receiver: string,
    amount: any,
    client: any,
    isReceiverSolidityAddress = false
) {
    const receivedAccountId = isReceiverSolidityAddress
        ? AccountId.fromSolidityAddress(receiver!).toString()
        : receiver!
    const transaction = new TransferTransaction()
        .addHbarTransfer(
            senderAccountId!,
            Hbar.fromTinybars(amount.mul(-1).toString())
        )
        .addHbarTransfer(
            receivedAccountId!,
            Hbar.fromTinybars(amount.toString())
        )

    await transaction.execute(client)
}

// AccessControlUpgradeable ///////////////////////////////////////////////////
export async function grantRole(
    ROLE: string,
    ContractId: any,
    proxyAddress: string,
    clientGrantingRole: any,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params: any[] = [
        ROLE,
        await toEvmAddress(accountToGrantRoleTo!, isE25519),
    ]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'grantRole',
        params,
        clientGrantingRole,
        Gas1,
        HederaERC20__factory.abi
    )
}

export async function revokeRole(
    ROLE: string,
    ContractId: any,
    proxyAddress: string,
    clientRevokingRole: any,
    accountToRevokeRoleFrom: string,
    isE25519: boolean
) {
    const params: any[] = [
        ROLE,
        await toEvmAddress(accountToRevokeRoleFrom!, isE25519),
    ]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'revokeRole',
        params,
        clientRevokingRole,
        Gas1,
        HederaERC20__factory.abi
    )
}

export async function hasRole(
    ROLE: string,
    ContractId: any,
    proxyAddress: string,
    clientCheckingRole: any,
    accountToCheckRoleFrom: string,
    isE25519: boolean
): Promise<boolean> {
    const params: any[] = [
        ROLE,
        await toEvmAddress(accountToCheckRoleFrom!, isE25519),
    ]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'hasRole',
        params,
        clientCheckingRole,
        Gas2,
        HederaERC20__factory.abi
    )
    return result[0]
}

// HederaERC20 ///////////////////////////////////////////////////
export async function getTotalSupply(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<any> {
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'totalSupply',
        [],
        client,
        Gas2,
        HederaERC20__factory.abi
    )
    return BigNumber.from(result[0])
}

export async function associateToken(
    ContractId: any,
    proxyAddress: string,
    clientAssociatingToken: any,
    accountToAssociateTo: string,
    isE25519: boolean
) {
    const params: any = [await toEvmAddress(accountToAssociateTo!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'associateToken',
        params,
        clientAssociatingToken,
        Gas3,
        HederaERC20__factory.abi
    )
}

export async function dissociateToken(
    ContractId: any,
    proxyAddress: string,
    clientDissociatingToken: any,
    accountToDissociateFrom: string,
    isE25519: boolean
) {
    const params: any = [await toEvmAddress(accountToDissociateFrom!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'dissociateToken',
        params,
        clientDissociatingToken,
        Gas3,
        HederaERC20__factory.abi
    )
}

export async function getBalanceOf(
    ContractId: any,
    proxyAddress: string,
    client: any,
    accountToGetBalanceOf: string,
    isE25519: boolean,
    parse = true
): Promise<any> {
    const params = parse
        ? [await toEvmAddress(accountToGetBalanceOf!, isE25519)]
        : [accountToGetBalanceOf]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'balanceOf',
        params,
        client,
        Gas2,
        HederaERC20__factory.abi
    )
    return BigNumber.from(result[0])
}

export async function name(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'name',
        params,
        client,
        Gas2,
        HederaERC20__factory.abi
    )
    return result[0]
}

export async function symbol(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'symbol',
        params,
        client,
        Gas2,
        HederaERC20__factory.abi
    )
    return result[0]
}

export async function decimals(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<number> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'decimals',
        params,
        client,
        Gas2,
        HederaERC20__factory.abi
    )
    return Number(result[0])
}

export async function initialize(
    ContractId: any,
    proxyAddress: string,
    client: any,
    newTokenAddress: string
) {
    const params = [newTokenAddress]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'initialize',
        params,
        client,
        Gas2,
        HederaERC20__factory.abi
    )
}

// HederaERC20Proxy ///////////////////////////////////////////////////
export async function upgradeTo(
    ContractId: any,
    proxyAddress: string,
    client: any,
    newImplementationContract: string
) {
    const params: any = [newImplementationContract]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'upgradeTo',
        params,
        client,
        Gas3,
        HederaERC20Proxy__factory.abi
    )
}

export async function changeAdmin(
    ContractId: any,
    proxyAddress: string,
    client: any,
    newAdminAccount: string
) {
    const params: any = [newAdminAccount]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'changeAdmin',
        params,
        client,
        Gas3,
        HederaERC20Proxy__factory.abi
    )
}

export async function admin(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'admin',
        params,
        client,
        Gas2,
        HederaERC20Proxy__factory.abi
    )
    return result[0]
}

// HederaERC20ProxyAdmin ///////////////////////////////////////////////////
export async function owner(
    ContractId: any,
    proxyAdminAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'owner',
        params,
        client,
        Gas2,
        HederaERC20ProxyAdmin__factory.abi
    )
    return result[0]
}

export async function upgrade(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params: any = [proxyAddress, newImplementationContract]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'upgrade',
        params,
        client,
        Gas3,
        HederaERC20ProxyAdmin__factory.abi
    )
}

export async function changeProxyAdmin(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newAdminAccount: string,
    proxyAddress: string,
    isE25519: boolean
) {
    const params: any = [
        proxyAddress,
        await toEvmAddress(newAdminAccount!, isE25519),
    ]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'changeProxyAdmin',
        params,
        client,
        Gas3,
        HederaERC20ProxyAdmin__factory.abi
    )
}

export async function transferOwnership(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params: any = [await toEvmAddress(newOwnerAccount!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'transferOwnership',
        params,
        client,
        Gas3,
        HederaERC20ProxyAdmin__factory.abi
    )
}

export async function getProxyImplementation(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    proxyAddress: string
): Promise<string> {
    const params: any[] = [proxyAddress]
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'getProxyImplementation',
        params,
        client,
        Gas2,
        HederaERC20ProxyAdmin__factory.abi
    )
    return result[0]
}

export async function getProxyAdmin(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    proxyAddress: string
): Promise<string> {
    const params: any[] = [proxyAddress]
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'getProxyAdmin',
        params,
        client,
        Gas2,
        HederaERC20ProxyAdmin__factory.abi
    )
    return result[0]
}

// StableCoinProxy ///////////////////////////////////////////////////
export async function upgradeTo_SCF(
    ContractId: any,
    proxyAddress: string,
    client: any,
    newImplementationContract: string
) {
    const params: any = [newImplementationContract]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'upgradeTo',
        params,
        client,
        Gas3,
        StableCoinFactoryProxy__factory.abi
    )
}

export async function changeAdmin_SCF(
    ContractId: any,
    proxyAddress: string,
    client: any,
    newAdminAccount: string
) {
    const params: any = [newAdminAccount]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'changeAdmin',
        params,
        client,
        Gas3,
        StableCoinFactoryProxy__factory.abi
    )
}

export async function admin_SCF(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'admin',
        params,
        client,
        Gas2,
        StableCoinFactoryProxy__factory.abi
    )
    return result[0]
}

// StableCoinProxyAdmin ///////////////////////////////////////////////////
export async function owner_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'owner',
        params,
        client,
        Gas2,
        StableCoinFactoryProxyAdmin__factory.abi
    )
    return result[0]
}

export async function upgrade_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params: any = [proxyAddress, newImplementationContract]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'upgrade',
        params,
        client,
        Gas3,
        StableCoinFactoryProxyAdmin__factory.abi
    )
}

export async function changeProxyAdmin_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newAdminAccount: string,
    proxyAddress: string,
    isE25519: boolean
) {
    const params: any = [
        proxyAddress,
        await toEvmAddress(newAdminAccount!, isE25519),
    ]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'changeProxyAdmin',
        params,
        client,
        Gas3,
        StableCoinFactoryProxyAdmin__factory.abi
    )
}

export async function transferOwnership_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params: any = [await toEvmAddress(newOwnerAccount!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'transferOwnership',
        params,
        client,
        Gas3,
        StableCoinFactoryProxyAdmin__factory.abi
    )
}

export async function getProxyImplementation_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    proxyAddress: string
): Promise<string> {
    const params: any[] = [proxyAddress]
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'getProxyImplementation',
        params,
        client,
        Gas2,
        StableCoinFactoryProxyAdmin__factory.abi
    )
    return result[0]
}

export async function getProxyAdmin_SCF(
    ContractId: any,
    proxyAdminAddress: string,
    client: any,
    proxyAddress: string
): Promise<string> {
    const params: any[] = [proxyAddress]
    const result = await contractCall(
        ContractId.fromString(proxyAdminAddress!),
        'getProxyAdmin',
        params,
        client,
        Gas2,
        StableCoinFactoryProxyAdmin__factory.abi
    )
    return result[0]
}

/* Methods to add
    - allowance(address,address) (external)
    - approve(address,uint256) (external)
    - transfer(address,uint256) (external)
    - transferFrom(address,address,uint256) (external)
*/
export async function allowance(
    ContractId: any,
    proxyAddress: string,
    addressOwner: string,
    ownerIsE25519: boolean,
    addressSpender: string,
    spenderIsE25519: boolean,
    client: any
): Promise<any> {
    const params: any[] = [
        await toEvmAddress(addressOwner, ownerIsE25519),
        await toEvmAddress(addressSpender, spenderIsE25519),
    ]
    const response = await contractCall(
        ContractId.fromString(proxyAddress!),
        'allowance',
        params,
        client,
        Gas1,
        HederaERC20__factory.abi
    )
    return response[0]
}

export async function approve(
    ContractId: any,
    proxyAddress: string,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: any
): Promise<any> {
    const params: any[] = [
        await toEvmAddress(addressSpender, spenderIsE25519),
        amount.toString(),
    ]
    const response = await contractCall(
        ContractId.fromString(proxyAddress!),
        'approve',
        params,
        client,
        Gas1,
        HederaERC20__factory.abi
    )
    return response[0]
}

export async function transfer(
    ContractId: any,
    proxyAddress: string,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: any
): Promise<any> {
    const params: any[] = [
        await toEvmAddress(addressSpender, spenderIsE25519),
        amount.toString(),
    ]
    const response = await contractCall(
        ContractId.fromString(proxyAddress!),
        'transfer',
        params,
        client,
        Gas1,
        HederaERC20__factory.abi
    )
    return response[0]
}

export async function transferFrom(
    ContractId: any,
    proxyAddress: string,
    addressOwner: string,
    ownerIsE25519: boolean,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: any
): Promise<any> {
    const params: any[] = [
        await toEvmAddress(addressOwner, ownerIsE25519),
        await toEvmAddress(addressSpender, spenderIsE25519),
        amount.toString(),
    ]
    const response = await contractCall(
        ContractId.fromString(proxyAddress!),
        'transferFrom',
        params,
        client,
        Gas1,
        HederaERC20__factory.abi
    )
    return response[0]
}

// TokenOwner ///////////////////////////////////////////////////
export async function getTokenAddress(
    ContractId: any,
    proxyAddress: string,
    client: any
): Promise<string> {
    const params: any[] = []
    const response = await contractCall(
        ContractId.fromString(proxyAddress!),
        'getTokenAddress',
        params,
        client,
        Gas5,
        HederaERC20__factory.abi
    )
    return response[0]
}

// Burnable ///////////////////////////////////////////////////
export async function Burn(
    ContractId: any,
    proxyAddress: string,
    amountOfTokenToBurn: any,
    clientBurningToken: any
) {
    const params = [amountOfTokenToBurn.toString()]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'burn',
        params,
        clientBurningToken,
        Gas4,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Minteable ///////////////////////////////////////////////////
export async function Mint(
    ContractId: any,
    proxyAddress: string,
    amountOfTokenToMint: any,
    clientMintingToken: any,
    clientToAssignTokensTo: string,
    isE25519: boolean
) {
    const params: any[] = [
        await toEvmAddress(clientToAssignTokensTo!, isE25519),
        amountOfTokenToMint.toString(),
    ]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'mint',
        params,
        clientMintingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Wipeable ///////////////////////////////////////////////////
export async function Wipe(
    ContractId: any,
    proxyAddress: string,
    amountOfTokenToWipe: any,
    clientWipingToken: any,
    accountToWipeFrom: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToWipeFrom!, isE25519),
        amountOfTokenToWipe.toString(),
    ]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'wipe',
        params,
        clientWipingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Pausable ///////////////////////////////////////////////////
export async function pause(
    ContractId: any,
    proxyAddress: string,
    clientPausingToken: any
) {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'pause',
        params,
        clientPausingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

export async function unpause(
    ContractId: any,
    proxyAddress: string,
    clientPausingToken: any
) {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'unpause',
        params,
        clientPausingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Freezable ///////////////////////////////////////////////////
export async function freeze(
    ContractId: any,
    proxyAddress: string,
    clientFreezingToken: any,
    accountToFreeze: string,
    isE25519: boolean
) {
    const params: any[] = [await toEvmAddress(accountToFreeze!, isE25519)]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'freeze',
        params,
        clientFreezingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

export async function unfreeze(
    ContractId: any,
    proxyAddress: string,
    clientUnFreezingToken: any,
    accountToUnFreeze: string,
    isE25519: boolean
) {
    const params: any[] = [await toEvmAddress(accountToUnFreeze!, isE25519)]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'unfreeze',
        params,
        clientUnFreezingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Deletable ///////////////////////////////////////////////////
export async function deleteToken(
    ContractId: any,
    proxyAddress: string,
    clientDeletingToken: any
) {
    const params: any[] = []
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'deleteToken',
        params,
        clientDeletingToken,
        Gas1,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Rescueable ///////////////////////////////////////////////////
export async function rescue(
    ContractId: any,
    proxyAddress: string,
    amountOfTokenToRescue: any,
    clientRescueingToken: any
) {
    const params = [amountOfTokenToRescue.toString()]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'rescue',
        params,
        clientRescueingToken,
        Gas4,
        HederaERC20__factory.abi
    )
    if (result[0] != true) throw Error
}

// Roles ///////////////////////////////////////////////////
export async function getRoles(
    ContractId: any,
    proxyAddress: string,
    client: any,
    accountToGetRolesFrom: string,
    isE25519: boolean
): Promise<any[]> {
    const params = [await toEvmAddress(accountToGetRolesFrom!, isE25519)]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'getRoles',
        params,
        client,
        Gas3,
        HederaERC20__factory.abi
    )
    return result[0]
}

export async function getRoleId(
    ContractId: any,
    proxyAddress: string,
    client: any,
    roleName: number
): Promise<string> {
    const params = [roleName]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'getRoleId',
        params,
        client,
        Gas3,
        HederaERC20__factory.abi
    )
    return result[0]
}

// SupplierAdmin ///////////////////////////////////////////////////
export async function decreaseSupplierAllowance(
    ContractId: any,
    proxyAddress: string,
    amountToDecrease: any,
    clientDecreasingAllowance: any,
    accountToDecreaseFrom: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToDecreaseFrom!, isE25519),
        amountToDecrease.toString(),
    ]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'decreaseSupplierAllowance',
        params,
        clientDecreasingAllowance,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function grantSupplierRole(
    ContractId: any,
    proxyAddress: string,
    cashInLimit: any,
    clientGrantingRole: any,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params: any = [
        await toEvmAddress(accountToGrantRoleTo!, isE25519),
        cashInLimit.toString(),
    ]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'grantSupplierRole',
        params,
        clientGrantingRole,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function grantUnlimitedSupplierRole(
    ContractId: any,
    proxyAddress: string,
    clientGrantingRole: any,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params: any = [await toEvmAddress(accountToGrantRoleTo!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'grantUnlimitedSupplierRole',
        params,
        clientGrantingRole,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function increaseSupplierAllowance(
    ContractId: any,
    proxyAddress: string,
    amountToIncrease: any,
    clientIncreasingAllowance: any,
    accountToIncreaseTo: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToIncreaseTo!, isE25519),
        amountToIncrease.toString(),
    ]
    await contractCall(
        ContractId.fromString(proxyAddress!),
        'increaseSupplierAllowance',
        params,
        clientIncreasingAllowance,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function isUnlimitedSupplierAllowance(
    ContractId: any,
    proxyAddress: string,
    clientChecking: any,
    accountToCheckFrom: string,
    isE25519: boolean
): Promise<boolean> {
    const params = [await toEvmAddress(accountToCheckFrom!, isE25519)]
    const result = await contractCall(
        ContractId.fromString(proxyAddress!),
        'isUnlimitedSupplierAllowance',
        params,
        clientChecking,
        Gas2,
        HederaERC20__factory.abi
    )
    return result[0]
}

export async function resetSupplierAllowance(
    ContractId: any,
    proxyAddress: string,
    clientResetingAllowance: any,
    accountToResetFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToResetFrom!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAddress),
        'resetSupplierAllowance',
        params,
        clientResetingAllowance,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function revokeSupplierRole(
    ContractId: any,
    proxyAddress: string,
    clientRevokingRole: any,
    accountToRevokeFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToRevokeFrom!, isE25519)]
    await contractCall(
        ContractId.fromString(proxyAddress),
        'revokeSupplierRole',
        params,
        clientRevokingRole,
        Gas5,
        HederaERC20__factory.abi
    )
}

export async function supplierAllowance(
    ContractId: any,
    proxyAddress: string,
    clientCheckingAllowance: any,
    accountToCheckFrom: string,
    isE25519: boolean
): Promise<any> {
    const params = [await toEvmAddress(accountToCheckFrom!, isE25519)]
    const result = await contractCall(
        ContractId.fromString(proxyAddress),
        'supplierAllowance',
        params,
        clientCheckingAllowance,
        Gas2,
        HederaERC20__factory.abi
    )
    return BigNumber.from(result[0])
}
