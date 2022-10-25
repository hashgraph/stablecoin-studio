const {AccountId} = require('@hashgraph/sdk')

import {HederaERC20__factory,} from '../typechain-types'

import { contractCall} from "./utils";

import {BigNumber} from "ethers";

// AccessControlUpgradeable
export async function grantRole(ROLE: string, ContractId: any, proxyAddress: string, clientGrantingRole: any, accountToGrantRoleTo: string){
    let params: any[] = [ROLE, AccountId.fromString(accountToGrantRoleTo!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantRole', params, clientGrantingRole, 400000, HederaERC20__factory.abi);
}

export async function revokeRole(ROLE: string, ContractId: any, proxyAddress: string, clientRevokingRole: any, accountToRevokeRoleFrom: string){
    let params: any[] = [ROLE, AccountId.fromString(accountToRevokeRoleFrom!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'revokeRole', params, clientRevokingRole, 400000, HederaERC20__factory.abi);  
}

export async function checkRole(ROLE: string, ContractId: any, proxyAddress: string, clientCheckingRole: any, accountToCheckRoleFrom: string): Promise<boolean>{
    let params: any[] = [ROLE, AccountId.fromString(accountToCheckRoleFrom!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'hasRole', params, clientCheckingRole, 60000, HederaERC20__factory.abi);
    return result[0]; 
}

// HederaERC20
export async function getTotalSupply(ContractId: any, proxyAddress: string, client: any): Promise<any>{
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    return BigNumber.from(result[0]); 
}

export async function associateToken(ContractId: any, proxyAddress: string, clientAssociatingToken: any, accountToAssociateTo: string) {
    let params : any = [AccountId.fromString(accountToAssociateTo!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'associateToken', params, clientAssociatingToken, 1800000, HederaERC20__factory.abi);
}

export async function dissociateToken(ContractId: any, proxyAddress: string, clientDissociatingToken: any, accountToDissociateFrom: string) {
    let params : any = [AccountId.fromString(accountToDissociateFrom!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'dissociateToken', params, clientDissociatingToken, 1800000, HederaERC20__factory.abi);
}

export async function getBalanceOf(ContractId: any, proxyAddress: string, client: any, accountToGetBalanceOf: string): Promise<any>{
    let params = [AccountId.fromString(accountToGetBalanceOf!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress!), 'balanceOf', params, client, 60000, HederaERC20__factory.abi);  
    return BigNumber.from(result[0]);
}

// Burnable
export async function Burn(ContractId: any, proxyAddress: string, amountOfTokenToBurn: any, clientBurningToken: any){
    let params = [amountOfTokenToBurn.toString()];        
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'burn', params, clientBurningToken, 500000, HederaERC20__factory.abi);
    if(!result[0]) throw new Error("Burn unsucessful!!!");
}

// Minteable
export async function Mint(ContractId: any, proxyAddress: string, amountOfTokenToMint: any, clientMintingToken: any, clientToAssignTokensTo: string){
    let params: any[] = [AccountId.fromString(clientToAssignTokensTo!).toSolidityAddress(), amountOfTokenToMint.toString()];      
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'mint', params, clientMintingToken, 400000, HederaERC20__factory.abi);
    if(!result[0]) throw new Error("Mint unsucessful!!!");
}

// Wipeable
export async function Wipe(ContractId: any, proxyAddress: string, amountOfTokenToWipe: any, clientWipingToken: any, accountToWipeFrom: string){
    let params = [AccountId.fromString(accountToWipeFrom!).toSolidityAddress(), amountOfTokenToWipe.toString()];      
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'wipe', params, clientWipingToken, 400000, HederaERC20__factory.abi);
    if(!result[0]) throw new Error("Wipe unsucessful!!!");
}

// SupplierAdmin
export async function decreaseSupplierAllowance(ContractId: any, proxyAddress: string, amountToDecrease: any, clientDecreasingAllowance: any, accountToDecreaseFrom: string){
    let params = [AccountId.fromString(accountToDecreaseFrom!).toSolidityAddress(), amountToDecrease.toString()];      
    await contractCall(ContractId.fromString(proxyAddress!), 'decreaseSupplierAllowance', params, clientDecreasingAllowance, 130000, HederaERC20__factory.abi);
}

export async function grantSupplierRole(ContractId: any, proxyAddress: string, cashInLimit: any, clientGrantingRole: any, accountToGrantRoleTo: string){
    const params : any = [AccountId.fromString(accountToGrantRoleTo!).toSolidityAddress(), cashInLimit.toString()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantSupplierRole', params, clientGrantingRole, 130000, HederaERC20__factory.abi);
}

export async function grantUnlimitedSupplierRole(ContractId: any, proxyAddress: string, clientGrantingRole: any, accountToGrantRoleTo: string){
    const params : any = [AccountId.fromString(accountToGrantRoleTo!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress!), 'grantUnlimitedSupplierRole', params, clientGrantingRole, 130000, HederaERC20__factory.abi);
}

export async function increaseSupplierAllowance(ContractId: any, proxyAddress: string, amountToIncrease: any, clientIncreasingAllowance: any, accountToIncreaseTo: string){
    let params = [AccountId.fromString(accountToIncreaseTo!).toSolidityAddress(), amountToIncrease.toString()];      
    await contractCall(ContractId.fromString(proxyAddress!), 'increaseSupplierAllowance', params, clientIncreasingAllowance, 130000, HederaERC20__factory.abi);
}

export async function isUnlimitedSupplierAllowance(ContractId: any, proxyAddress: string, clientChecking: any, accountToCheckFrom: string) : Promise<boolean>{
    let params = [AccountId.fromString(accountToCheckFrom!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress!), 'isUnlimitedSupplierAllowance', params, clientChecking, 60000, HederaERC20__factory.abi);
    return result[0];
}

export async function resetSupplierAllowance(ContractId: any, proxyAddress: string, clientResetingAllowance: any, accountToResetFrom: string){
    let params = [AccountId.fromString(accountToResetFrom!).toSolidityAddress()];      
    await contractCall(ContractId.fromString(proxyAddress), 'resetSupplierAllowance', params, clientResetingAllowance, 130000, HederaERC20__factory.abi);
}

export async function revokeSupplierRole(ContractId: any, proxyAddress: string, clientRevokingRole: any, accountToRevokeFrom: string){
    let params = [AccountId.fromString(accountToRevokeFrom!).toSolidityAddress()];      
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, clientRevokingRole, 130000, HederaERC20__factory.abi);
}

export async function supplierAllowance(ContractId: any, proxyAddress: string, clientCheckingAllowance: any, accountToCheckFrom: string) : Promise<any> { 
    let params = [AccountId.fromString(accountToCheckFrom!).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, clientCheckingAllowance, 60000, HederaERC20__factory.abi);
    return BigNumber.from(result[0]);
}
