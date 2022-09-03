import { ContractFunctionParameters, ContractId, AccountId } from "@hashgraph/sdk";
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient, createECDSAAccount } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;

let proxyAddress:any;
let client:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;

describe("Grant unlimited supplier role", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, 100000, "Hedera Accelerator Stable Coin");    
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });
  it("An account with unlimited supplier role can cash in 100 tokens", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'isUnlimitedSupplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(result[0]).to.eq(true);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi);
    expect(result[0]).to.eq(true);  
  });
  it("An account with unlimited supplier role can not cash in more than maxSupply tokens", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 101000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  }); 
});

describe("Grant supplier role", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, null, "Hedera Accelerator Stable Coin");    
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });
  it("An account with supplier role and an allowance of 100 tokens can cash in 100 tokens", async function() {
    //let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    //await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);    
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(100000);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi);
    expect(result[0]).to.equals(true);  
  });  
  it("An account with supplier role and an allowance of 90 tokens can not cash in 91 tokens", async function() {
    //let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 90000];  
    //await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 10000];  
    await contractCall(ContractId.fromString(proxyAddress), 'decreaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);    
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 91000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });    
  it("An account with supplier role and an allowance of 100 tokens can not cash more than maxSupply tokens", async function() {
    //let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 101000];  
    //await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 1000];  
    await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 101000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });     
  it("An account with supplier role and an allowance of 100 tokens, when decrease 10 tokens will have an allowance of 90 tokens", async function() {
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 10000];  
    await contractCall(ContractId.fromString(proxyAddress), 'decreaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(90000);
  });        
  it("An account with supplier role and an allowance of 100 tokens, when decrease 10 tokens will have an allowance of 90 tokens", async function() {
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'resetSupplierAllowance', params, client, 120000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(0);
  });          
});

describe("Revoke supplier role", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, null, "Hedera Accelerator Stable Coin");    
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });
  it("An account with supplier role and an allowance of 100 tokens, but revoked, can not cash in 100 tokens", async function() {
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
});

describe("Revoke unlimited supplier role", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, null, "Hedera Accelerator Stable Coin");    
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });
  it("An account with unlimited supplier role, but revoked, can not cash in 100 tokens", async function() {
    let params : any = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account!, hreConfig.accounts[1].privateKey!);        
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    params = [AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress(), 100000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
});
