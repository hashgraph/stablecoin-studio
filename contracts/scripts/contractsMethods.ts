const {AccountId} = require('@hashgraph/sdk')

import {HederaERC20__factory,} from '../typechain-types'

import { contractCall} from "./utils";


export async function grantRole(ROLE: string, ContractId: any, proxyAddress: string, clientGrantingRole: any, accountToGrantRoleTo: string){
    let params: any[] = [ROLE, AccountId.fromString(accountToGrantRoleTo).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, clientGrantingRole, 400000, HederaERC20__factory.abi);
}

export async function revokeRole(ROLE: string, ContractId: any, proxyAddress: string, clientRevokingRole: any, accountToRevokeRoleFrom: string){
    let params: any[] = [ROLE, AccountId.fromString(accountToRevokeRoleFrom).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeRole', params, clientRevokingRole, 400000, HederaERC20__factory.abi);  
}

export async function checkRole(ROLE: string, ContractId: any, proxyAddress: string, clientCheckingRole: any, accountToCheckRoleFrom: string): Promise<boolean>{
    let params: any[] = [ROLE, AccountId.fromString(accountToCheckRoleFrom).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, clientCheckingRole, 60000, HederaERC20__factory.abi);
    return result[0]; 
}

export async function getTotalSupply(ContractId: any, proxyAddress: string, client: any): Promise<number>{
    let result = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    return Number(result[0]); 
}

export async function Burn(ContractId: any, proxyAddress: string, amountOfTokenToBurn: number, client: any){
    let params = [amountOfTokenToBurn];        
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 500000, HederaERC20__factory.abi);
}

export async function Mint(ContractId: any, proxyAddress: string, amountOfTokenToMint: number, clientMintingToken: any, clientToAssignTokensTo: string){
    let params: any[] = [AccountId.fromString(clientToAssignTokensTo).toSolidityAddress(), amountOfTokenToMint];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, clientMintingToken, 400000, HederaERC20__factory.abi);
}

export async function Wipe(ContractId: any, proxyAddress: string, amountOfTokenToWipe: number, clientWipingToken: any, accountToWipeFrom: string){
    let params = [AccountId.fromString(accountToWipeFrom).toSolidityAddress(), amountOfTokenToWipe];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, clientWipingToken, 400000, HederaERC20__factory.abi);
}

export async function getBalanceOf(ContractId: any, proxyAddress: string, client: any, accountToGetBalanceOf: string): Promise<number>{
    let params = [AccountId.fromString(accountToGetBalanceOf).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi);  
    return Number(result[0]);
}