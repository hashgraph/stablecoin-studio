const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import {grantRole, revokeRole, checkRole} from "../scripts/contractsMethods";

import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const CASHIN_ROLE  = '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c';


let proxyAddress:any;
let client:any;
let client2:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 100 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"


describe("Only Admin can grant and revoke cashin role", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);  

    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Admin account can grant cashin role to an account", async function() {    
    // Admin grants mint role : success  
    await grantRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke cashin role to an account", async function() {
    // Admin grants mint role : success  
    await grantRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await revokeRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(false);
  });

  it("Non Admin account can not grant cashin role to an account", async function() {      
    await expect(grantRole(CASHIN_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;

  });

  it("Non Admin account can not revoke cashin role to an account", async function() {
    await grantRole(CASHIN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await expect(revokeRole(CASHIN_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;
  });


});

describe("Cash in tokens with maxTotalSupply", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Can cash in 100 tokens to an account from a token with a 100 as maxTotalSupply", async function() {
    const CashInAmount = MAX_SUPPLY;
    let params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), CashInAmount];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress()];  
    const resultBalanceOf = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(Number(resultBalanceOf[0])).to.equals(CashInAmount);
    const resultTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi)  
    expect(Number(resultTotalSupply[0])).to.equals(CashInAmount);
  });

  it("Cannot cash in more than the maxTotalSupply", async function() {
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 1];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;
  });

  it("User without cashin_role cannot cash in tokens at all", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);      
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 1];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });

  it("Cannot cash in tokens to an account not associated to the token", async function() {
    const params = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress(), 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });

});

describe("Cash in tokens without maxTotalSupply", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, 0, null, TokenMemo);    
  });

  it("Should cash in 10000 tokens to an account from a token without maxTotalSupply", async function() {
    const MintedAmount = 10000 * 10**TokenDecimals;
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), MintedAmount];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    const result = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi)  
    expect(Number(result[0])).to.equals(MintedAmount);
  });
  
});
