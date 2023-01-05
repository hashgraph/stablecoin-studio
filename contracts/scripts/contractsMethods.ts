import {
    AccountId,
    AccountBalanceQuery,
    TransferTransaction,
    Hbar,
    Client,
    ContractId,
} from '@hashgraph/sdk'

import {
    HederaERC20__factory,
    HederaERC20Proxy__factory,
    HederaERC20ProxyAdmin__factory,
    StableCoinFactoryProxy__factory,
    StableCoinFactoryProxyAdmin__factory,
} from '../typechain-types'

import { contractCall, toEvmAddress } from './utils'
import { Gas1, Gas2, Gas3, Gas4, Gas5 } from './constants'

import { BigNumber } from 'ethers'

export async function getHBARBalanceOf(
    Id: string,
    client: Client,
    isAccount = true,
    isSolidityAddress = false
) {
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
    amount: BigNumber,
    client: Client,
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
    proxyAddress: string,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params = [ROLE, await toEvmAddress(accountToGrantRoleTo!, isE25519)]
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
    proxyAddress: string,
    clientRevokingRole: Client,
    accountToRevokeRoleFrom: string,
    isE25519: boolean
) {
    const params: string[] = [
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
    proxyAddress: string,
    clientCheckingRole: Client,
    accountToCheckRoleFrom: string,
    isE25519: boolean
): Promise<boolean> {
    const params: string[] = [
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
export async function getTotalSupply(proxyAddress: string, client: Client) {
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
    proxyAddress: string,
    clientAssociatingToken: Client,
    accountToAssociateTo: string,
    isE25519: boolean
) {
    const params: string[] = [
        await toEvmAddress(accountToAssociateTo!, isE25519),
    ]
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
    proxyAddress: string,
    clientDissociatingToken: Client,
    accountToDissociateFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToDissociateFrom!, isE25519)]
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
    proxyAddress: string,
    client: Client,
    accountToGetBalanceOf: string,
    isE25519: boolean,
    parse = true
) {
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
    proxyAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAddress: string,
    client: Client
): Promise<number> {
    const params: string[] = []
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
    proxyAddress: string,
    client: Client,
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
    proxyAddress: string,
    client: Client,
    newImplementationContract: string
) {
    const params = [newImplementationContract]
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
    proxyAddress: string,
    client: Client,
    newAdminAccount: string
) {
    const params = [newAdminAccount]
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
    proxyAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAdminAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAdminAddress: string,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params = [proxyAddress, newImplementationContract]
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
    proxyAdminAddress: string,
    client: Client,
    newAdminAccount: string,
    proxyAddress: string,
    isE25519: boolean
) {
    const params = [
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
    proxyAdminAddress: string,
    client: Client,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(newOwnerAccount!, isE25519)]
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
    proxyAdminAddress: string,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
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
    proxyAdminAddress: string,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
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
    proxyAddress: string,
    client: Client,
    newImplementationContract: string
) {
    const params = [newImplementationContract]
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
    proxyAddress: string,
    client: Client,
    newAdminAccount: string
) {
    const params = [newAdminAccount]
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
    proxyAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAdminAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAdminAddress: string,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params = [proxyAddress, newImplementationContract]
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
    proxyAdminAddress: string,
    client: Client,
    newAdminAccount: string,
    proxyAddress: string,
    isE25519: boolean
) {
    const params = [
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
    proxyAdminAddress: string,
    client: Client,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(newOwnerAccount!, isE25519)]
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
    proxyAdminAddress: string,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
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
    proxyAdminAddress: string,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
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
    proxyAddress: string,
    addressOwner: string,
    ownerIsE25519: boolean,
    addressSpender: string,
    spenderIsE25519: boolean,
    client: Client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    const params = [
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
    proxyAddress: string,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: Client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    const params = [
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
    proxyAddress: string,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: Client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    const params: string[] = [
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
    proxyAddress: string,
    addressOwner: string,
    ownerIsE25519: boolean,
    addressSpender: string,
    spenderIsE25519: boolean,
    amount: BigNumber,
    client: Client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    const params: string[] = [
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
    proxyAddress: string,
    client: Client
): Promise<string> {
    const params: string[] = []
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
    proxyAddress: string,
    amountOfTokenToBurn: BigNumber,
    clientBurningToken: Client
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
    proxyAddress: string,
    amountOfTokenToMint: BigNumber,
    clientMintingToken: Client,
    clientToAssignTokensTo: string,
    isE25519: boolean
) {
    const params: string[] = [
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
    proxyAddress: string,
    amountOfTokenToWipe: BigNumber,
    clientWipingToken: Client,
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
export async function pause(proxyAddress: string, clientPausingToken: Client) {
    const params: string[] = []
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
    proxyAddress: string,
    clientPausingToken: Client
) {
    const params: string[] = []
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
    proxyAddress: string,
    clientFreezingToken: Client,
    accountToFreeze: string,
    isE25519: boolean
) {
    const params: string[] = [await toEvmAddress(accountToFreeze!, isE25519)]
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
    proxyAddress: string,
    clientUnFreezingToken: Client,
    accountToUnFreeze: string,
    isE25519: boolean
) {
    const params: string[] = [await toEvmAddress(accountToUnFreeze!, isE25519)]
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
    proxyAddress: string,
    clientDeletingToken: Client
) {
    const params: string[] = []
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
    proxyAddress: string,
    amountOfTokenToRescue: BigNumber,
    clientRescueingToken: Client
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
    proxyAddress: string,
    client: Client,
    accountToGetRolesFrom: string,
    isE25519: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    proxyAddress: string,
    client: Client,
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
    proxyAddress: string,
    amountToDecrease: BigNumber,
    clientDecreasingAllowance: Client,
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
    proxyAddress: string,
    cashInLimit: BigNumber,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params: string[] = [
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
    proxyAddress: string,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToGrantRoleTo!, isE25519)]
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
    proxyAddress: string,
    amountToIncrease: BigNumber,
    clientIncreasingAllowance: Client,
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
    proxyAddress: string,
    clientChecking: Client,
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
    proxyAddress: string,
    clientResetingAllowance: Client,
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
    proxyAddress: string,
    clientRevokingRole: Client,
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
    proxyAddress: string,
    clientCheckingAllowance: Client,
    accountToCheckFrom: string,
    isE25519: boolean
) {
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
