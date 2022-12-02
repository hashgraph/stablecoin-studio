const {AccountId, AccountBalanceQuery, TransferTransaction, HbarUnit, Hbar} = require('@hashgraph/sdk')

import {HederaERC20__factory,
    HederaERC20Proxy__factory,
    HederaERC20ProxyAdmin__factory} from '../typechain-types'

import { contractCall, toEvmAddress} from "./utils";
import { Gas1, Gas2, Gas3, Gas4, Gas5, Gas6} from "./constants";


import {BigNumber} from "ethers";

export async function getHBARBalanceOf(Id: string, client: any, isAccount = true, isSolidityAddress = false): Promise<any>{
    const IdToQuery = isSolidityAddress ? AccountId.fromSolidityAddress(Id!).toString() : Id!;
    let query = isAccount ? new AccountBalanceQuery().setAccountId(IdToQuery!) : new AccountBalanceQuery().setContractId(IdToQuery!);
    let Balance = await query.execute(client);

    return BigNumber.from(Balance.hbars.toTinybars().toString());
}

export async function transferHBAR(senderAccountId: string, receiver: string, amount: any, client: any, isReceiverSolidityAddress = false){
    const receivedAccountId = isReceiverSolidityAddress ? AccountId.fromSolidityAddress(receiver!).toString() : receiver!;
    const transaction = new TransferTransaction()
     .addHbarTransfer(senderAccountId!, Hbar.fromTinybars(amount.mul(-1).toString()))
     .addHbarTransfer(receivedAccountId!, Hbar.fromTinybars(amount.toString()));

    await transaction.execute(client);
}

// AccessControlUpgradeable ///////////////////////////////////////////////////
export async function grantRole(ROLE: string, ContractId: any, proxyAddress: string, clientGrantingRole: any, accountToGrantRoleTo: string, isE25519: boolean){
    let params: any[] = [ROLE, await toEvmAddress(accountToGrantRoleTo!, isE25519)];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantRole', params, clientGrantingRole, Gas1, HederaERC20__factory.abi);
}

export async function revokeRole(ROLE: string, ContractId: any, proxyAddress: string, clientRevokingRole: any, accountToRevokeRoleFrom: string, isE25519: boolean){
    let params: any[] = [ROLE, await toEvmAddress(accountToRevokeRoleFrom!, isE25519)];  
    await contractCall(ContractId.fromString(proxyAddress!), 'revokeRole', params, clientRevokingRole, Gas1, HederaERC20__factory.abi);  
}

export async function hasRole(ROLE: string, ContractId: any, proxyAddress: string, clientCheckingRole: any, accountToCheckRoleFrom: string, isE25519: boolean): Promise<boolean>{
    let params: any[] = [ROLE, await toEvmAddress(accountToCheckRoleFrom!, isE25519)];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'hasRole', params, clientCheckingRole, Gas2, HederaERC20__factory.abi);
    return result[0]; 
}

// HederaERC20 ///////////////////////////////////////////////////
export async function getTotalSupply(ContractId: any, proxyAddress: string, client: any): Promise<any>{
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'totalSupply', [], client, Gas2, HederaERC20__factory.abi);  
    return BigNumber.from(result[0]); 
}

export async function associateToken(ContractId: any, proxyAddress: string, clientAssociatingToken: any, accountToAssociateTo: string) {
    let params : any = [AccountId.fromString(accountToAssociateTo!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'associateToken', params, clientAssociatingToken, Gas3, HederaERC20__factory.abi);
}

export async function dissociateToken(ContractId: any, proxyAddress: string, clientDissociatingToken: any, accountToDissociateFrom: string) {
    let params : any = [AccountId.fromString(accountToDissociateFrom!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'dissociateToken', params, clientDissociatingToken, Gas3, HederaERC20__factory.abi);
}

export async function getBalanceOf(ContractId: any, proxyAddress: string, client: any, accountToGetBalanceOf: string, parse = true): Promise<any>{
    let params = parse ? [AccountId.fromString(accountToGetBalanceOf!).toSolidityAddress()] : [accountToGetBalanceOf];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'balanceOf', params, client, Gas2, HederaERC20__factory.abi);  
    return BigNumber.from(result[0]);
}

export async function name(ContractId: any, proxyAddress: string, client: any): Promise<string>{
    let params: any[] = [];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'name', params, client, Gas2, HederaERC20__factory.abi);  
    return result[0];
}

export async function symbol(ContractId: any, proxyAddress: string, client: any): Promise<string>{
    let params: any[] = [];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'symbol', params, client, Gas2, HederaERC20__factory.abi);  
    return result[0];
}

export async function decimals(ContractId: any, proxyAddress: string, client: any): Promise<number>{
    let params: any[] = [];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'decimals', params, client, Gas2, HederaERC20__factory.abi);  
    return Number(result[0]);
}

export async function initialize(ContractId: any, proxyAddress: string, client: any, newTokenAddress: string){
    let params = [newTokenAddress];  
    await contractCall(ContractId.fromString(proxyAddress!), 'initialize', params, client, Gas2, HederaERC20__factory.abi);  
}

// HederaERC20Proxy ///////////////////////////////////////////////////
export async function upgradeTo(ContractId: any, proxyAddress: string, client: any, newImplementationContract: string) {
    let params : any = [newImplementationContract];  
    await contractCall(ContractId.fromString(proxyAddress!), 'upgradeTo', params, client, Gas3, HederaERC20Proxy__factory.abi);
}

export async function changeAdmin(ContractId: any, proxyAddress: string, client: any, newAdminAccount: string) {
    let params : any = [newAdminAccount];  
    await contractCall(ContractId.fromString(proxyAddress!), 'changeAdmin', params, client, Gas3, HederaERC20Proxy__factory.abi);
}

export async function admin(ContractId: any, proxyAddress: string, client: any): Promise<string>{
    let params: any[] = [];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'admin', params, client, Gas2, HederaERC20Proxy__factory.abi);  
    return result[0];
}

// HederaERC20ProxyAdmin ///////////////////////////////////////////////////
export async function owner(ContractId: any, proxyAdminAddress: string, client: any): Promise<string>{
    let params: any[] = [];  
    const result = await contractCall(ContractId.fromString(proxyAdminAddress!), 'owner', params, client, Gas2, HederaERC20ProxyAdmin__factory.abi);  
    return result[0];
}

export async function upgrade(ContractId: any, proxyAdminAddress: string, client: any, newImplementationContract: string, proxyAddress: string) {
    let params : any = [proxyAddress, newImplementationContract];  
    await contractCall(ContractId.fromString(proxyAdminAddress!), 'upgrade', params, client, Gas3, HederaERC20ProxyAdmin__factory.abi);
}

export async function changeProxyAdmin(ContractId: any, proxyAdminAddress: string, client: any, newAdminAccount: string, proxyAddress: string) {
    let params : any = [proxyAddress, AccountId.fromString(newAdminAccount!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAdminAddress!), 'changeProxyAdmin', params, client, Gas3, HederaERC20ProxyAdmin__factory.abi);
}

export async function transferOwnership(ContractId: any, proxyAdminAddress: string, client: any, newOwnerAccount: string) {
    let params : any = [AccountId.fromString(newOwnerAccount!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAdminAddress!), 'transferOwnership', params, client, Gas3, HederaERC20ProxyAdmin__factory.abi);
}

export async function getProxyImplementation(ContractId: any, proxyAdminAddress: string, client: any, proxyAddress: string): Promise<string>{
    let params: any[] = [proxyAddress];  
    const result = await contractCall(ContractId.fromString(proxyAdminAddress!), 'getProxyImplementation', params, client, Gas2, HederaERC20ProxyAdmin__factory.abi);  
    return result[0];
}

export async function getProxyAdmin(ContractId: any, proxyAdminAddress: string, client: any, proxyAddress: string): Promise<string>{
    let params: any[] = [proxyAddress];  
    const result = await contractCall(ContractId.fromString(proxyAdminAddress!), 'getProxyAdmin', params, client, Gas2, HederaERC20ProxyAdmin__factory.abi);  
    return result[0];
}

/* Methods to add
    - allowance(address,address) (external)
    - approve(address,uint256) (external)
    - transfer(address,uint256) (external)
    - transferFrom(address,address,uint256) (external)
*/

// TokenOwner ///////////////////////////////////////////////////
export async function getTokenAddress(ContractId: any, proxyAddress: string, client: any): Promise<string>{
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress!), 'getTokenAddress', params, client, Gas5, HederaERC20__factory.abi) 
    return response[0];
}

// Burnable ///////////////////////////////////////////////////
export async function Burn(ContractId: any, proxyAddress: string, amountOfTokenToBurn: any, clientBurningToken: any){
    let params = [amountOfTokenToBurn.toString()];        
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'burn', params, clientBurningToken, Gas4, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Minteable ///////////////////////////////////////////////////
export async function Mint(ContractId: any, proxyAddress: string, amountOfTokenToMint: any, clientMintingToken: any, clientToAssignTokensTo: string){
    let params: any[] = [AccountId.fromString(clientToAssignTokensTo!).toSolidityAddress(), amountOfTokenToMint.toString()];      
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'mint', params, clientMintingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Wipeable ///////////////////////////////////////////////////
export async function Wipe(ContractId: any, proxyAddress: string, amountOfTokenToWipe: any, clientWipingToken: any, accountToWipeFrom: string){
    let params = [AccountId.fromString(accountToWipeFrom!).toSolidityAddress(), amountOfTokenToWipe.toString()];      
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'wipe', params, clientWipingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Pausable ///////////////////////////////////////////////////
export async function pause(ContractId: any, proxyAddress: string, clientPausingToken: any){
    let params: any[] = [];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'pause', params, clientPausingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

export async function unpause(ContractId: any, proxyAddress: string, clientPausingToken: any){
    let params: any[] = [];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'unpause', params, clientPausingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Freezable ///////////////////////////////////////////////////
export async function freeze(ContractId: any, proxyAddress: string, clientFreezingToken: any, accountToFreeze: string){
    let params: any[] = [AccountId.fromString(accountToFreeze!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'freeze', params, clientFreezingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

export async function unfreeze(ContractId: any, proxyAddress: string, clientUnFreezingToken: any, accountToUnFreeze: string){
    let params: any[] = [AccountId.fromString(accountToUnFreeze!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'unfreeze', params, clientUnFreezingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Deletable ///////////////////////////////////////////////////
export async function deleteToken(ContractId: any, proxyAddress: string, clientDeletingToken: any){
    let params: any[] = [];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'deleteToken', params, clientDeletingToken, Gas1, HederaERC20__factory.abi);
    if(result[0] != true) throw Error;
}

// Rescueable ///////////////////////////////////////////////////
export async function rescue(ContractId: any, proxyAddress: string, amountOfTokenToRescue: any, clientRescueingToken: any){
    let params = [amountOfTokenToRescue.toString()];      
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'rescue', params, clientRescueingToken, Gas4, HederaERC20__factory.abi)  
    if(result[0] != true) throw Error;
}

// Roles ///////////////////////////////////////////////////
export async function getRoles(ContractId: any, proxyAddress: string, client: any, accountToGetRolesFrom: string): Promise<any[]>{
    let params = [AccountId.fromString(accountToGetRolesFrom!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'getRoles', params, client, Gas3, HederaERC20__factory.abi);  
    return result[0];
}

export async function getRoleId(ContractId: any, proxyAddress: string, client: any, roleName: Number): Promise<string>{
    let params = [roleName];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'getRoleId', params, client, Gas3, HederaERC20__factory.abi);  
    return result[0];
}

// SupplierAdmin ///////////////////////////////////////////////////
export async function decreaseSupplierAllowance(ContractId: any, proxyAddress: string, amountToDecrease: any, clientDecreasingAllowance: any, accountToDecreaseFrom: string){
    let params = [AccountId.fromString(accountToDecreaseFrom!).toSolidityAddress(), amountToDecrease.toString()];      
    await contractCall(ContractId.fromString(proxyAddress!), 'decreaseSupplierAllowance', params, clientDecreasingAllowance, Gas5, HederaERC20__factory.abi);
}

export async function grantSupplierRole(ContractId: any, proxyAddress: string, cashInLimit: any, clientGrantingRole: any, accountToGrantRoleTo: string){
    const params : any = [AccountId.fromString(accountToGrantRoleTo!).toSolidityAddress(), cashInLimit.toString()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantSupplierRole', params, clientGrantingRole, Gas5, HederaERC20__factory.abi);
}

export async function grantUnlimitedSupplierRole(ContractId: any, proxyAddress: string, clientGrantingRole: any, accountToGrantRoleTo: string){
    const params : any = [AccountId.fromString(accountToGrantRoleTo!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantUnlimitedSupplierRole', params, clientGrantingRole, Gas5, HederaERC20__factory.abi);
}

export async function increaseSupplierAllowance(ContractId: any, proxyAddress: string, amountToIncrease: any, clientIncreasingAllowance: any, accountToIncreaseTo: string){
    let params = [AccountId.fromString(accountToIncreaseTo!).toSolidityAddress(), amountToIncrease.toString()];      
    await contractCall(ContractId.fromString(proxyAddress!), 'increaseSupplierAllowance', params, clientIncreasingAllowance, Gas5, HederaERC20__factory.abi);
}

export async function isUnlimitedSupplierAllowance(ContractId: any, proxyAddress: string, clientChecking: any, accountToCheckFrom: string) : Promise<boolean>{
    let params = [AccountId.fromString(accountToCheckFrom!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'isUnlimitedSupplierAllowance', params, clientChecking, Gas2, HederaERC20__factory.abi);
    return result[0];
}

export async function resetSupplierAllowance(ContractId: any, proxyAddress: string, clientResetingAllowance: any, accountToResetFrom: string){
    let params = [AccountId.fromString(accountToResetFrom!).toSolidityAddress()];      
    await contractCall(ContractId.fromString(proxyAddress), 'resetSupplierAllowance', params, clientResetingAllowance, Gas5, HederaERC20__factory.abi);
}

export async function revokeSupplierRole(ContractId: any, proxyAddress: string, clientRevokingRole: any, accountToRevokeFrom: string){
    let params = [AccountId.fromString(accountToRevokeFrom!).toSolidityAddress()];      
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, clientRevokingRole, Gas5, HederaERC20__factory.abi);
}

export async function supplierAllowance(ContractId: any, proxyAddress: string, clientCheckingAllowance: any, accountToCheckFrom: string) : Promise<any> { 
    let params = [AccountId.fromString(accountToCheckFrom!).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, clientCheckingAllowance, Gas2, HederaERC20__factory.abi);
    return BigNumber.from(result[0]);
}
