/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountId,
    AccountBalanceQuery,
    TransferTransaction,
    Hbar,
    Client,
    ContractId,
} from '@hashgraph/sdk'

import {
    HederaTokenManager__factory,
    ITransparentUpgradeableProxy__factory,
    ProxyAdmin__factory,
    HederaReserve__factory,
    StableCoinFactory__factory,
} from '../typechain-types'

import { toEvmAddress } from './utils'
import { contractCall } from './contractsLifeCycle/utils'
import {
    BALANCE_OF_GAS,
    BURN_GAS,
    CASHIN_GAS,
    DECREASE_SUPPLY_GAS,
    DELETE_GAS,
    FREEZE_GAS,
    GET_ROLES_GAS,
    GRANT_KYC_GAS,
    GRANT_ROLES_GAS,
    HAS_ROLE_GAS,
    INCREASE_SUPPLY_GAS,
    PAUSE_GAS,
    RESCUE_GAS,
    RESCUE_HBAR_GAS,
    RESET_SUPPLY_GAS,
    REVOKE_KYC_GAS,
    REVOKE_ROLES_GAS,
    UNFREEZE_GAS,
    UNPAUSE_GAS,
    UPDATE_TOKEN_GAS,
    WIPE_GAS,
    CHANGE_PROXY_OWNER,
    Gas2,
    Gas1,
    Gas3,
    Gas0,
} from './constants'

import { BigNumber } from 'ethers'

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

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

export async function grantRole(
    ROLE: string,
    proxyAddress: ContractId,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params = [ROLE, await toEvmAddress(accountToGrantRoleTo, isE25519)]
    await contractCall(
        proxyAddress,
        'grantRole',
        params,
        clientGrantingRole,
        GRANT_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function revokeRole(
    ROLE: string,
    proxyAddress: ContractId,
    clientRevokingRole: Client,
    accountToRevokeRoleFrom: string,
    isE25519: boolean
) {
    const params: string[] = [
        ROLE,
        await toEvmAddress(accountToRevokeRoleFrom, isE25519),
    ]
    await contractCall(
        proxyAddress,
        'revokeRole',
        params,
        clientRevokingRole,
        REVOKE_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function hasRole(
    ROLE: string,
    proxyAddress: ContractId,
    clientCheckingRole: Client,
    accountToCheckRoleFrom: string,
    isE25519: boolean
): Promise<boolean> {
    const params: string[] = [
        ROLE,
        await toEvmAddress(accountToCheckRoleFrom, isE25519),
    ]
    const result = await contractCall(
        proxyAddress,
        'hasRole',
        params,
        clientCheckingRole,
        HAS_ROLE_GAS,
        HederaTokenManager__factory.abi
    )
    return result[0]
}
export async function getAccountsForRole(
    ROLE: string,
    proxyAddress: ContractId,
    clientCheckingRole: Client
): Promise<string[]> {
    const params: string[] = [ROLE]
    const result = await contractCall(
        proxyAddress,
        'getAccountsWithRole',
        params,
        clientCheckingRole,
        GET_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

// HederaTokenManager ///////////////////////////////////////////////////
export async function getTotalSupply(proxyAddress: ContractId, client: Client) {
    const result = await contractCall(
        proxyAddress,
        'totalSupply',
        [],
        client,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return BigNumber.from(result[0])
}

export async function getBalanceOf(
    proxyAddress: ContractId,
    client: Client,
    accountToGetBalanceOf: string,
    isE25519: boolean,
    parse = true
) {
    const params = parse
        ? [await toEvmAddress(accountToGetBalanceOf, isE25519)]
        : [accountToGetBalanceOf]
    const result = await contractCall(
        proxyAddress,
        'balanceOf',
        params,
        client,
        BALANCE_OF_GAS,
        HederaTokenManager__factory.abi
    )
    return BigNumber.from(result[0])
}

export async function name(
    proxyAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'name',
        params,
        client,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

export async function symbol(
    proxyAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress!,
        'symbol',
        params,
        client,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

export async function decimals(
    proxyAddress: ContractId,
    client: Client
): Promise<number> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress!,
        'decimals',
        params,
        client,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return Number(result[0])
}

export async function initialize(
    proxyAddress: ContractId,
    client: Client,
    newTokenAddress: string
) {
    const params = [newTokenAddress]
    await contractCall(
        proxyAddress,
        'initialize',
        params,
        client,
        Gas2,
        HederaTokenManager__factory.abi
    )
}

export async function updateToken(
    proxyAddress: ContractId,
    name: string,
    symbol: string,
    keys: any,
    second: number,
    autoRenewPeriod: number,
    client: Client
): Promise<boolean> {
    const updateToken = {
        tokenName: name,
        tokenSymbol: symbol,
        keys: keys,
        second: second,
        autoRenewPeriod: autoRenewPeriod,
    }
    const params = [updateToken]
    const response = await contractCall(
        proxyAddress,
        'updateToken',
        params,
        client,
        UPDATE_TOKEN_GAS,
        HederaTokenManager__factory.abi
    )
    return response[0]
}

// HederaTokenManagerProxy ///////////////////////////////////////////////////
export async function upgradeTo(
    proxyAbi: any,
    proxyAddress: ContractId,
    client: Client,
    newImplementationContract: string
) {
    const params = [newImplementationContract]
    await contractCall(
        proxyAddress,
        'upgradeTo',
        params,
        client,
        UPDATE_TOKEN_GAS,
        proxyAbi
    )
}

export async function changeAdmin(
    proxyAbi: any,
    proxyAddress: ContractId,
    client: Client,
    newAdminAccount: string
) {
    const params = [newAdminAccount]
    await contractCall(
        proxyAddress,
        'changeAdmin',
        params,
        client,
        CHANGE_PROXY_OWNER,
        proxyAbi
    )
}

export async function admin(
    proxyAbi: any,
    proxyAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'admin',
        params,
        client,
        Gas2,
        proxyAbi
    )
    return result[0]
}

// HederaTokenManagerProxyAdmin ///////////////////////////////////////////////////
export async function owner(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAdminAddress,
        'owner',
        params,
        client,
        Gas2,
        proxyAdminAbi
    )
    return result[0]
}

export async function upgrade(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params = [proxyAddress, newImplementationContract]
    await contractCall(
        proxyAdminAddress,
        'upgrade',
        params,
        client,
        Gas3,
        proxyAdminAbi
    )
}

export async function changeProxyAdmin(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    newAdminAccount: string,
    proxyAddress: ContractId,
    isE25519: boolean
) {
    const params = [
        proxyAddress.toSolidityAddress(),
        await toEvmAddress(newAdminAccount, isE25519),
    ]
    await contractCall(
        proxyAdminAddress,
        'changeProxyAdmin',
        params,
        client,
        CHANGE_PROXY_OWNER,
        proxyAdminAbi
    )
}

export async function transferOwnership(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(newOwnerAccount, isE25519)]
    await contractCall(
        proxyAdminAddress,
        'transferOwnership',
        params,
        client,
        CHANGE_PROXY_OWNER,
        proxyAdminAbi
    )
}

export async function getProxyImplementation(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
    const result = await contractCall(
        proxyAdminAddress,
        'getProxyImplementation',
        params,
        client,
        Gas2,
        proxyAdminAbi
    )
    return result[0]
}

export async function getProxyAdmin(
    proxyAdminAbi: any,
    proxyAdminAddress: ContractId,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
    const result = await contractCall(
        proxyAdminAddress,
        'getProxyAdmin',
        params,
        client,
        Gas2,
        proxyAdminAbi
    )
    return result[0]
}

// StableCoinProxy ///////////////////////////////////////////////////
export async function upgradeTo_SCF(
    proxyAddress: ContractId,
    client: Client,
    newImplementationContract: string
) {
    const params = [newImplementationContract]
    await contractCall(
        proxyAddress,
        'upgradeTo',
        params,
        client,
        Gas3,
        ITransparentUpgradeableProxy__factory.abi
    )
}

export async function changeAdmin_SCF(
    proxyAddress: ContractId,
    client: Client,
    newAdminAccount: string
) {
    const params = [newAdminAccount]
    await contractCall(
        proxyAddress,
        'changeAdmin',
        params,
        client,
        Gas3,
        ITransparentUpgradeableProxy__factory.abi
    )
}

export async function admin_SCF(
    proxyAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'admin',
        params,
        client,
        Gas2,
        ITransparentUpgradeableProxy__factory.abi
    )
    return result[0]
}

// StableCoinProxyAdmin ///////////////////////////////////////////////////
export async function owner_SCF(
    proxyAdminAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAdminAddress,
        'owner',
        params,
        client,
        Gas2,
        ProxyAdmin__factory.abi
    )
    return result[0]
}

export async function upgrade_SCF(
    proxyAdminAddress: ContractId,
    client: Client,
    newImplementationContract: string,
    proxyAddress: string
) {
    const params = [proxyAddress, newImplementationContract]
    await contractCall(
        proxyAdminAddress,
        'upgrade',
        params,
        client,
        Gas3,
        ProxyAdmin__factory.abi
    )
}

export async function changeProxyAdmin_SCF(
    proxyAdminAddress: ContractId,
    client: Client,
    newAdminAccount: string,
    proxyAddress: ContractId,
    isE25519: boolean
) {
    const params = [
        proxyAddress.toSolidityAddress(),
        await toEvmAddress(newAdminAccount, isE25519),
    ]
    await contractCall(
        proxyAdminAddress,
        'changeProxyAdmin',
        params,
        client,
        Gas3,
        ProxyAdmin__factory.abi
    )
}

export async function transferOwnership_SCF(
    proxyAdminAddress: ContractId,
    client: Client,
    newOwnerAccount: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(newOwnerAccount, isE25519)]
    await contractCall(
        proxyAdminAddress,
        'transferOwnership',
        params,
        client,
        Gas3,
        ProxyAdmin__factory.abi
    )
}

export async function getProxyImplementation_SCF(
    proxyAdminAddress: ContractId,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
    const result = await contractCall(
        proxyAdminAddress,
        'getProxyImplementation',
        params,
        client,
        Gas2,
        ProxyAdmin__factory.abi
    )
    return result[0]
}

export async function getProxyAdmin_SCF(
    proxyAdminAddress: ContractId,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
    const result = await contractCall(
        proxyAdminAddress,
        'getProxyAdmin',
        params,
        client,
        Gas2,
        ProxyAdmin__factory.abi
    )
    return result[0]
}

// TokenOwner ///////////////////////////////////////////////////
export async function getTokenAddress(
    proxyAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const response = await contractCall(
        proxyAddress,
        'getTokenAddress',
        params,
        client,
        Gas3,
        HederaTokenManager__factory.abi
    )
    return response[0]
}

// Burnable ///////////////////////////////////////////////////
export async function Burn(
    proxyAddress: ContractId,
    amountOfTokenToBurn: BigNumber,
    clientBurningToken: Client
) {
    const params = [amountOfTokenToBurn.toString()]
    const result = await contractCall(
        proxyAddress,
        'burn',
        params,
        clientBurningToken,
        BURN_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Minteable ///////////////////////////////////////////////////
export async function Mint(
    proxyAddress: ContractId,
    amountOfTokenToMint: BigNumber,
    clientMintingToken: Client,
    clientToAssignTokensTo: string,
    isE25519: boolean,
    parse = true
) {
    const param_1: string = parse
        ? await toEvmAddress(clientToAssignTokensTo, isE25519)
        : clientToAssignTokensTo

    const params: string[] = [param_1, amountOfTokenToMint.toString()]
    const result = await contractCall(
        proxyAddress,
        'mint',
        params,
        clientMintingToken,
        CASHIN_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Wipeable ///////////////////////////////////////////////////
export async function Wipe(
    proxyAddress: ContractId,
    amountOfTokenToWipe: BigNumber,
    clientWipingToken: Client,
    accountToWipeFrom: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToWipeFrom, isE25519),
        amountOfTokenToWipe.toString(),
    ]
    const result = await contractCall(
        proxyAddress,
        'wipe',
        params,
        clientWipingToken,
        WIPE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Pausable ///////////////////////////////////////////////////
export async function pause(
    proxyAddress: ContractId,
    clientPausingToken: Client
) {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'pause',
        params,
        clientPausingToken,
        PAUSE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

export async function unpause(
    proxyAddress: ContractId,
    clientPausingToken: Client
) {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'unpause',
        params,
        clientPausingToken,
        UNPAUSE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Freezable ///////////////////////////////////////////////////
export async function freeze(
    proxyAddress: ContractId,
    clientFreezingToken: Client,
    accountToFreeze: string,
    isE25519: boolean
) {
    const params: string[] = [await toEvmAddress(accountToFreeze, isE25519)]
    const result = await contractCall(
        proxyAddress,
        'freeze',
        params,
        clientFreezingToken,
        FREEZE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

export async function unfreeze(
    proxyAddress: ContractId,
    clientUnFreezingToken: Client,
    accountToUnFreeze: string,
    isE25519: boolean
) {
    const params: string[] = [await toEvmAddress(accountToUnFreeze, isE25519)]
    const result = await contractCall(
        proxyAddress,
        'unfreeze',
        params,
        clientUnFreezingToken,
        UNFREEZE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Deletable ///////////////////////////////////////////////////
export async function deleteToken(
    proxyAddress: ContractId,
    clientDeletingToken: Client
) {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'deleteToken',
        params,
        clientDeletingToken,
        DELETE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Rescueable ///////////////////////////////////////////////////
export async function rescue(
    proxyAddress: ContractId,
    amountOfTokenToRescue: BigNumber,
    clientRescueingToken: Client
) {
    const params = [amountOfTokenToRescue.toString()]
    const result = await contractCall(
        proxyAddress,
        'rescue',
        params,
        clientRescueingToken,
        RESCUE_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

export async function rescueHBAR(
    proxyAddress: ContractId,
    amountOfHBARToRescue: BigNumber,
    clientRescueingToken: Client
) {
    const params = [amountOfHBARToRescue.toString()]
    const result = await contractCall(
        proxyAddress,
        'rescueHBAR',
        params,
        clientRescueingToken,
        RESCUE_HBAR_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// Roles ///////////////////////////////////////////////////
export async function getRoles(
    proxyAddress: ContractId,
    client: Client,
    accountToGetRolesFrom: string,
    isE25519: boolean
): Promise<string[]> {
    const params = [await toEvmAddress(accountToGetRolesFrom, isE25519)]
    const result = await contractCall(
        proxyAddress,
        'getRoles',
        params,
        client,
        GET_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

export async function getRoleId(
    proxyAddress: ContractId,
    client: Client,
    roleName: number
): Promise<string> {
    const params = [roleName]
    const result = await contractCall(
        proxyAddress,
        'getRoleId',
        params,
        client,
        GET_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

// Roles Management ///////////////////////////////////////////////////
export async function grantRoles(
    ROLES: string[],
    proxyAddress: ContractId,
    clientGrantingRoles: Client,
    accountsToGrantRolesTo: string[],
    cashInLimits: BigNumber[],
    areE25519: boolean[]
) {
    const cashInLimits_Strings: string[] = []
    cashInLimits.forEach((cashInLimit) => {
        cashInLimits_Strings.push(cashInLimit.toString())
    })

    const accountsToGrantRolesTo_EVM: string[] = []
    for (let i = 0; i < accountsToGrantRolesTo.length; i++) {
        accountsToGrantRolesTo_EVM.push(
            await toEvmAddress(accountsToGrantRolesTo[i], areE25519[i])
        )
    }

    const params = [ROLES, accountsToGrantRolesTo_EVM, cashInLimits_Strings]

    await contractCall(
        proxyAddress,
        'grantRoles',
        params,
        clientGrantingRoles,
        Gas0,
        HederaTokenManager__factory.abi
    )
}

export async function revokeRoles(
    ROLES: string[],
    proxyAddress: ContractId,
    clientRevokingRoles: Client,
    accountsToRevokeRolesFrom: string[],
    areE25519: boolean[]
) {
    const accountsToRevokeRolesFrom_EVM: string[] = []
    for (let i = 0; i < accountsToRevokeRolesFrom.length; i++) {
        accountsToRevokeRolesFrom_EVM.push(
            await toEvmAddress(accountsToRevokeRolesFrom[i], areE25519[i])
        )
    }

    const params = [ROLES, accountsToRevokeRolesFrom_EVM]

    await contractCall(
        proxyAddress,
        'revokeRoles',
        params,
        clientRevokingRoles,
        Gas0,
        HederaTokenManager__factory.abi
    )
}

// SupplierAdmin ///////////////////////////////////////////////////
export async function decreaseSupplierAllowance(
    proxyAddress: ContractId,
    amountToDecrease: BigNumber,
    clientDecreasingAllowance: Client,
    accountToDecreaseFrom: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToDecreaseFrom, isE25519),
        amountToDecrease.toString(),
    ]
    await contractCall(
        proxyAddress,
        'decreaseSupplierAllowance',
        params,
        clientDecreasingAllowance,
        DECREASE_SUPPLY_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function grantSupplierRole(
    proxyAddress: ContractId,
    cashInLimit: BigNumber,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params: string[] = [
        await toEvmAddress(accountToGrantRoleTo, isE25519),
        cashInLimit.toString(),
    ]
    await contractCall(
        proxyAddress,
        'grantSupplierRole',
        params,
        clientGrantingRole,
        GRANT_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function grantUnlimitedSupplierRole(
    proxyAddress: ContractId,
    clientGrantingRole: Client,
    accountToGrantRoleTo: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToGrantRoleTo, isE25519)]
    await contractCall(
        proxyAddress,
        'grantUnlimitedSupplierRole',
        params,
        clientGrantingRole,
        GRANT_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function increaseSupplierAllowance(
    proxyAddress: ContractId,
    amountToIncrease: BigNumber,
    clientIncreasingAllowance: Client,
    accountToIncreaseTo: string,
    isE25519: boolean
) {
    const params = [
        await toEvmAddress(accountToIncreaseTo, isE25519),
        amountToIncrease.toString(),
    ]
    await contractCall(
        proxyAddress,
        'increaseSupplierAllowance',
        params,
        clientIncreasingAllowance,
        INCREASE_SUPPLY_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function isUnlimitedSupplierAllowance(
    proxyAddress: ContractId,
    clientChecking: Client,
    accountToCheckFrom: string,
    isE25519: boolean
): Promise<boolean> {
    const params = [await toEvmAddress(accountToCheckFrom, isE25519)]
    const result = await contractCall(
        proxyAddress,
        'isUnlimitedSupplierAllowance',
        params,
        clientChecking,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

export async function resetSupplierAllowance(
    proxyAddress: ContractId,
    clientResetingAllowance: Client,
    accountToResetFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToResetFrom, isE25519)]
    await contractCall(
        proxyAddress,
        'resetSupplierAllowance',
        params,
        clientResetingAllowance,
        RESET_SUPPLY_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function revokeSupplierRole(
    proxyAddress: ContractId,
    clientRevokingRole: Client,
    accountToRevokeFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToRevokeFrom, isE25519)]
    await contractCall(
        proxyAddress,
        'revokeSupplierRole',
        params,
        clientRevokingRole,
        REVOKE_ROLES_GAS,
        HederaTokenManager__factory.abi
    )
}

export async function getSupplierAllowance(
    proxyAddress: ContractId,
    clientCheckingAllowance: Client,
    accountToCheckFrom: string,
    isE25519: boolean
) {
    const params = [await toEvmAddress(accountToCheckFrom, isE25519)]
    const result = await contractCall(
        proxyAddress,
        'getSupplierAllowance',
        params,
        clientCheckingAllowance,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return BigNumber.from(result[0])
}

// Reserve ///////////////////////////////////////////////////
export async function getReserveAmount(
    proxyAddress: ContractId,
    operatorClient: Client
) {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'getReserveAmount',
        params,
        operatorClient,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return BigNumber.from(result[0])
}

export async function getReserveAddress(
    proxyAddress: ContractId,
    operatorClient: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAddress,
        'getReserveAddress',
        params,
        operatorClient,
        Gas2,
        HederaTokenManager__factory.abi
    )
    return result[0]
}

export async function updateDataFeed(
    dataFeed: ContractId,
    proxyAddress: ContractId,
    operatorClient: Client
) {
    const params: string[] = [dataFeed.toSolidityAddress()]
    await contractCall(
        proxyAddress,
        'updateReserveAddress',
        params,
        operatorClient,
        Gas2,
        HederaTokenManager__factory.abi
    )
}

// HederaReserve ///////////////////////////////////////////////////
export async function initializeHederaReserve(
    initailAmount: BigNumber,
    hederaReserveProxy: ContractId,
    operatorClient: Client
) {
    const params: string[] = [initailAmount.toString()]
    await contractCall(
        hederaReserveProxy,
        'initialize',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
}
export async function setAmountHederaReserve(
    amountReserve: BigNumber,
    hederaReserveProxy: ContractId,
    operatorClient: Client
) {
    const params: string[] = [amountReserve.toString()]
    await contractCall(
        hederaReserveProxy,
        'setAmount',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
}
export async function setAdminHederaReserve(
    newAdminAddress: string,
    hederaReserveProxy: ContractId,
    operatorClient: Client
) {
    const params: string[] = [newAdminAddress]
    await contractCall(
        hederaReserveProxy,
        'setAdmin',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
}
export async function decimalsHederaReserve(
    hederaReserveProxy: ContractId,
    operatorClient: Client
): Promise<BigNumber> {
    const params: string[] = []
    const result = await contractCall(
        hederaReserveProxy,
        'decimals',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
    return result[0]
}
export async function descriptionHederaReserve(
    hederaReserveProxy: ContractId,
    operatorClient: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        hederaReserveProxy,
        'description',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
    return result[0]
}
export async function versionHederaReserve(
    hederaReserveProxy: ContractId,
    operatorClient: Client
): Promise<BigNumber> {
    const params: string[] = []
    const result = await contractCall(
        hederaReserveProxy,
        'version',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )
    return result[0]
}
export async function latestRoundDataDataHederaReserve(
    hederaReserveProxy: ContractId,
    operatorClient: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        hederaReserveProxy,
        'latestRoundData',
        params,
        operatorClient,
        Gas2,
        HederaReserve__factory.abi
    )

    return result['answer']
}

// KYC ///////////////////////////////////////////////////
export async function grantKyc(
    proxyAddress: ContractId,
    accountToGrantKyc: string,
    accountIsED25519: boolean,
    client: Client
) {
    const params: string[] = [
        await toEvmAddress(accountToGrantKyc, accountIsED25519),
    ]
    const result = await contractCall(
        proxyAddress,
        'grantKyc',
        params,
        client,
        GRANT_KYC_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}
export async function revokeKyc(
    proxyAddress: ContractId,
    accountToGrantKyc: string,
    accountIsED25519: boolean,
    client: Client
) {
    const params: string[] = [
        await toEvmAddress(accountToGrantKyc, accountIsED25519),
    ]
    const result = await contractCall(
        proxyAddress,
        'revokeKyc',
        params,
        client,
        REVOKE_KYC_GAS,
        HederaTokenManager__factory.abi
    )
    if (result[0] != true) throw Error
}

// StableCoinFactory ///////////////////////////////////////////////////
export async function getHederaTokenManagerAddresses(
    stableCoinFactoryProxy: ContractId,
    client: Client
) {
    const result = await contractCall(
        stableCoinFactoryProxy,
        'getHederaTokenManagerAddress',
        [],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
    return result[0]
}

export async function addHederaTokenManagerVersion(
    stableCoinFactoryProxy: ContractId,
    client: Client,
    newAddress: string
) {
    await contractCall(
        stableCoinFactoryProxy,
        'addHederaTokenManagerVersion',
        [newAddress],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
}

export async function editHederaTokenManagerVersion(
    stableCoinFactoryProxy: ContractId,
    client: Client,
    index: number,
    newAddress: string
) {
    await contractCall(
        stableCoinFactoryProxy,
        'editHederaTokenManagerAddress',
        [index, newAddress],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
}

export async function changeAdminStablecoinFactory(
    stableCoinFactoryProxy: ContractId,
    client: Client,
    newAdmin: string
) {
    await contractCall(
        stableCoinFactoryProxy,
        'changeAdmin',
        [newAdmin],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
}
export async function removeHederaTokenManagerVersion(
    stableCoinFactoryProxy: ContractId,
    client: Client,
    index: number
) {
    await contractCall(
        stableCoinFactoryProxy,
        'removeHederaTokenManagerAddress',
        [index],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
}

export async function getAdminStableCoinFactory(
    stableCoinFactoryProxy: ContractId,
    client: Client
): Promise<string> {
    const result = await contractCall(
        stableCoinFactoryProxy,
        'getAdmin',
        [],
        client,
        Gas1,
        StableCoinFactory__factory.abi
    )
    return result[0]
}
